// Supabase Configuration
const SUPABASE_URL = 'https://xjixjuvmuimtrjkxnwey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qDY5780wrBgu2UHdtueDKg_T8rvCV-C';

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
