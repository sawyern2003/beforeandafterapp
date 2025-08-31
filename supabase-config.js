// Supabase Configuration
// Replace these with your actual Supabase project credentials

export const supabaseConfig = {
    url: 'https://ktikfagtsfpyjzymqzyi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aWtmYWd0c2ZweWp6eW1xenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjMyNTIsImV4cCI6MjA3MjIzOTI1Mn0.zDqc9tCBthwuv9C-dDgVvju4NCvHqExIqQjcmwF-Ikc',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aWtmYWd0c2ZweWp6eW1xenlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2MzI1MiwiZXhwIjoyMDcyMjM5MjUyfQ.1TcnGjxaJQhi2W4H9Xyjd38QMtH8ZfACMV9zaZ2EkSw' // Only use on server side
};

// Database table names
export const TABLES = {
    USERS: 'users',
    PRESETS: 'presets',
    SUBSCRIPTIONS: 'subscriptions',
    PAYMENTS: 'payments'
};

// Stripe configuration
export const STRIPE_CONFIG = {
    publishableKey: 'pk_live_51S0RdbQJJqcmhCS44AKpVFfT3VdklBpYKVkfBDwbxnKJvA4CkwIH6punH3Gjo3DqVmLSRjDO6qjskT7z1UztnjJd00M26U1ULz', // Get from Stripe dashboard
    paymentLink: 'https://buy.stripe.com/7sY28tbfjfVj8Kt3V90x200' // Your existing payment link
}; 