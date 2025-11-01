exports.getConfig = (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey.trim() === '') {
        console.error('STRIPE_PUBLISHABLE_KEY is not set in environment variables');
        return res.status(500).json({ 
            error: 'Stripe configuration is missing',
            message: 'STRIPE_PUBLISHABLE_KEY must be set in the .env file'
        });
    }
    
    res.json({
        publishableKey: publishableKey,
    });
};