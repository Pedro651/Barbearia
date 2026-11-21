import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_API_KEY;

if (!stripeKey) {
    throw new Error('STRIPE_API_KEY não configurada');
}

export const stripe = new Stripe(stripeKey, {
    apiVersion: '2026-11-18.endive',
    appInfo: {
        name: 'barberpro',
        version: '1'
    }
});