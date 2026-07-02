// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Razorpay Configuration
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
const RAZORPAY_KEY_SECRET = 'YOUR_RAZORPAY_KEY_SECRET';

// App Configuration
const APP_CONFIG = {
    supabase: {
        url: SUPABASE_URL,
        key: SUPABASE_KEY
    },
    razorpay: {
        keyId: RAZORPAY_KEY_ID
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}