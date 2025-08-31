# 🚀 Supabase Backend Setup Guide

This guide will walk you through setting up the Supabase backend for your Before & After Pro web app.

## 📋 Prerequisites

- [Supabase account](https://supabase.com) (free tier available)
- [Stripe account](https://stripe.com) for payment processing
- Node.js 18+ installed
- Basic knowledge of SQL and web development

## 🗄️ Step 1: Set up Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `before-after-pro`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

### 1.2 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **Anon (public) key**
   - **Service (secret) key** (keep this secure!)

## 🗃️ Step 2: Set up Database Schema

### 2.1 Run SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute the schema

### 2.2 Verify Tables Created
Go to **Table Editor** and verify these tables exist:
- `users`
- `presets`
- `subscriptions`
- `payments`

## 🔐 Step 3: Configure Authentication

### 3.1 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates if desired

### 3.2 Set up Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and recovery emails
3. Test email delivery

## 💳 Step 4: Set up Stripe Integration

### 4.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification
3. Get your API keys from **Developers** → **API keys**

### 4.2 Create Product and Price
1. Go to **Products** → **Add Product**
2. Create a product called "Before & After Pro"
3. Add a recurring price:
   - **Amount**: £29.00
   - **Billing**: Monthly
   - **Currency**: GBP
4. Copy the **Price ID** (starts with `price_`)

### 4.3 Set up Webhooks
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Webhook secret**

## ⚙️ Step 5: Configure Environment Variables

### 5.1 Update Supabase Config
Edit `supabase-config.js`:

```javascript
export const supabaseConfig = {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    serviceRoleKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
};

export const STRIPE_CONFIG = {
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
    priceId: 'YOUR_STRIPE_PRICE_ID',
    webhookSecret: 'YOUR_STRIPE_WEBHOOK_SECRET'
};
```

### 5.2 Environment Variables (Optional)
Create a `.env` file for local development:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 🚀 Step 6: Install Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install development dependencies
npm install --save-dev serve
```

## 🌐 Step 7: Set up API Endpoints

### 7.1 Create API Server (Optional)
For production, you'll need a server to handle Stripe webhooks. Here's a basic Express.js setup:

```javascript
// server.js
import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { userId, email, priceId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
            customer_email: email,
            metadata: {
                userId: userId
            }
        });
        
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        // Update user subscription in Supabase
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                stripe_subscription_id: session.subscription,
                stripe_customer_id: session.customer,
                status: 'active',
                current_period_start: new Date(session.subscription_data.period_start * 1000),
                current_period_end: new Date(session.subscription_data.period_end * 1000)
            });
    }
    
    res.json({ received: true });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

## 🧪 Step 8: Test the Integration

### 8.1 Test Authentication
1. Open your web app
2. Click "Sign Up" and create an account
3. Verify email confirmation
4. Test login/logout

### 8.2 Test Preset Saving
1. Log in to your account
2. Create a preset
3. Check if it appears in the database
4. Test loading and deleting presets

### 8.3 Test Stripe Integration
1. Click "Upgrade to Pro"
2. Complete Stripe checkout with test card
3. Verify subscription is created in database
4. Check if pro features are unlocked

## 🔒 Step 9: Security Considerations

### 9.1 Row Level Security (RLS)
- RLS is already enabled in the schema
- Users can only access their own data
- Test with multiple user accounts

### 9.2 API Security
- Use HTTPS in production
- Validate all input data
- Rate limit API endpoints
- Monitor for suspicious activity

### 9.3 Stripe Security
- Never expose secret keys in frontend
- Verify webhook signatures
- Use test mode for development
- Monitor payment failures

## 🚀 Step 10: Deploy to Production

### 10.1 Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Ensure HTTPS is enabled
- Set up custom domain if needed

### 10.2 Backend Deployment
- Deploy API server to Vercel, Heroku, or similar
- Update webhook URLs in Stripe
- Set production environment variables

### 10.3 Database Migration
- Backup development data if needed
- Run schema on production database
- Test all functionality in production

## 📊 Monitoring and Maintenance

### 10.1 Supabase Monitoring
- Monitor database performance
- Check authentication logs
- Review RLS policy effectiveness

### 10.2 Stripe Monitoring
- Monitor payment success rates
- Check webhook delivery
- Review subscription metrics

### 10.3 Application Monitoring
- Monitor user signups
- Track preset usage
- Monitor error rates

## 🆘 Troubleshooting

### Common Issues

**Authentication not working:**
- Check Supabase URL and keys
- Verify email templates are configured
- Check browser console for errors

**Presets not saving:**
- Verify RLS policies are correct
- Check database permissions
- Ensure user is authenticated

**Stripe checkout failing:**
- Verify API keys are correct
- Check webhook configuration
- Ensure price ID is valid

**Database connection errors:**
- Check Supabase project status
- Verify connection string
- Check firewall settings

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## 🎯 Next Steps

1. **Customize the UI** to match your brand
2. **Add more features** like preset sharing
3. **Implement analytics** to track usage
4. **Add admin panel** for user management
5. **Set up automated testing**

---

**🎉 Congratulations!** You now have a fully functional web app with:
- ✅ User authentication
- ✅ Cloud-based preset storage
- ✅ Stripe payment integration
- ✅ Pro feature gating
- ✅ Secure data access

Your users can now sign up, save their presets in the cloud, and upgrade to Pro through Stripe! 