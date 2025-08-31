import { supabase, authService } from './supabase-client.js';
import { STRIPE_CONFIG, TABLES } from './supabase-config.js';

// Stripe service for payment handling
export class StripeService {
    constructor() {
        this.stripe = null;
        this.setupStripe();
    }

    // Initialize Stripe
    setupStripe() {
        if (typeof Stripe !== 'undefined') {
            this.stripe = Stripe(STRIPE_CONFIG.publishableKey);
        } else {
            console.warn('Stripe not loaded. Make sure to include Stripe.js in your HTML.');
        }
    }

    // Create checkout session for subscription
    async createCheckoutSession() {
        if (!authService.isAuthenticated()) {
            return { success: false, error: 'User must be authenticated to subscribe' };
        }

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: authService.user.id,
                    email: authService.user.email,
                    priceId: STRIPE_CONFIG.priceId
                })
            });

            const session = await response.json();
            
            if (session.error) {
                throw new Error(session.error);
            }

            return { success: true, sessionId: session.id };
        } catch (error) {
            console.error('Create checkout session error:', error);
            return { success: false, error: error.message };
        }
    }

    // Redirect to Stripe checkout
    async redirectToCheckout(sessionId) {
        if (!this.stripe) {
            return { success: false, error: 'Stripe not initialized' };
        }

        try {
            const { error } = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Redirect to checkout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle successful payment (called from webhook)
    async handleSuccessfulPayment(paymentData) {
        try {
            // Update user subscription status
            const { error } = await supabase
                .from(TABLES.SUBSCRIPTIONS)
                .upsert({
                    user_id: paymentData.userId,
                    stripe_subscription_id: paymentData.subscriptionId,
                    stripe_customer_id: paymentData.customerId,
                    status: 'active',
                    current_period_start: new Date(paymentData.periodStart * 1000).toISOString(),
                    current_period_end: new Date(paymentData.periodEnd * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Log payment
            await supabase
                .from(TABLES.PAYMENTS)
                .insert({
                    user_id: paymentData.userId,
                    stripe_payment_intent_id: paymentData.paymentIntentId,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    status: 'succeeded',
                    created_at: new Date().toISOString()
                });

            return { success: true };
        } catch (error) {
            console.error('Handle successful payment error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create customer portal session for subscription management
    async createCustomerPortalSession() {
        if (!authService.isAuthenticated()) {
            return { success: false, error: 'User must be authenticated' };
        }

        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: authService.user.id,
                    email: authService.user.email
                })
            });

            const session = await response.json();
            
            if (session.error) {
                throw new Error(session.error);
            }

            return { success: true, url: session.url };
        } catch (error) {
            console.error('Create portal session error:', error);
            return { success: false, error: error.message };
        }
    }

    // Redirect to customer portal
    async redirectToCustomerPortal() {
        const result = await this.createCustomerPortalSession();
        if (result.success) {
            window.location.href = result.url;
        }
        return result;
    }

    // Check subscription status
    async checkSubscriptionStatus() {
        if (!authService.isAuthenticated()) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.SUBSCRIPTIONS)
                .select('*')
                .eq('user_id', authService.user.id)
                .eq('status', 'active')
                .single();

            if (error) throw error;

            if (data) {
                const now = new Date();
                const periodEnd = new Date(data.current_period_end);
                
                if (periodEnd > now) {
                    return { 
                        success: true, 
                        isActive: true, 
                        expiresAt: periodEnd,
                        daysRemaining: Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))
                    };
                } else {
                    // Subscription expired, update status
                    await supabase
                        .from(TABLES.SUBSCRIPTIONS)
                        .update({ status: 'expired' })
                        .eq('id', data.id);
                    
                    return { success: true, isActive: false, reason: 'expired' };
                }
            }

            return { success: true, isActive: false, reason: 'no_subscription' };
        } catch (error) {
            console.error('Check subscription status error:', error);
            return { success: false, error: error.message };
        }
    }

    // Cancel subscription
    async cancelSubscription() {
        if (!authService.isAuthenticated()) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: authService.user.id
                })
            });

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            // Update local subscription status
            await supabase
                .from(TABLES.SUBSCRIPTIONS)
                .update({ 
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', authService.user.id);

            return { success: true };
        } catch (error) {
            console.error('Cancel subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get payment history
    async getPaymentHistory() {
        if (!authService.isAuthenticated()) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.PAYMENTS)
                .select('*')
                .eq('user_id', authService.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, payments: data || [] };
        } catch (error) {
            console.error('Get payment history error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global Stripe service instance
export const stripeService = new StripeService(); 