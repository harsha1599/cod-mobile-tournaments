# Complete Setup Guide for CoD Mobile Tournaments Platform

## Prerequisites

- Supabase account (https://supabase.com)
- Razorpay account (https://razorpay.com)
- Basic knowledge of SQL and JavaScript
- Modern web browser

---

## Step 1: Supabase Configuration

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Get your API URL and Anon Key
5. Update `config.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your_anon_key';
```

### 1.2 Create Database Tables

Run these SQL commands in Supabase SQL Editor:

#### Core Tables
```sql
-- Users Table (with email verification)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  game_id TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://via.placeholder.com/100',
  wins INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  tournaments_played INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspended_until TIMESTAMP,
  suspension_reason TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tournaments Table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  prize_pool TEXT NOT NULL,
  entry_fee TEXT NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  start_date DATE NOT NULL,
  format TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Registrations Table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  amount DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Email Verification Tables
```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Match Management Tables
```sql
CREATE TABLE match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  match_id TEXT NOT NULL,
  winner_id UUID REFERENCES users(id),
  loser_id UUID REFERENCES users(id),
  score TEXT,
  screenshots TEXT[],
  status TEXT DEFAULT 'pending_verification',
  verified_by UUID REFERENCES users(id),
  verification_notes TEXT,
  verified_at TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  opponent_id UUID REFERENCES users(id),
  winner_id UUID REFERENCES users(id),
  tournament_id UUID REFERENCES tournaments(id),
  stats JSONB,
  played_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE result_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID REFERENCES match_results(id),
  reason TEXT,
  evidence TEXT[],
  status TEXT DEFAULT 'open',
  filed_at TIMESTAMP DEFAULT NOW()
);
```

#### Friend System Tables
```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP
);

CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW()
);
```

#### Messaging Tables
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

#### Streaming Tables
```sql
CREATE TABLE tournament_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id),
  platform TEXT,
  channel_url TEXT,
  video_id TEXT,
  status TEXT DEFAULT 'live',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES tournament_streams(id),
  user_id UUID REFERENCES users(id),
  watched_at TIMESTAMP DEFAULT NOW()
);
```

#### Payout Tables
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tournament_id UUID REFERENCES tournaments(id),
  amount DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'pending',
  razorpay_payout_id TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_bank_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  account_holder_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  bank_name TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Admin Tables
```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reason TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  action_taken TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

---

## Step 2: Razorpay Integration

### 2.1 Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up for a business account
3. Complete KYC verification
4. Go to Settings > API Keys
5. Copy Key ID and Key Secret

### 2.2 Update Configuration
```javascript
const RAZORPAY_KEY_ID = 'your_razorpay_key_id';
const RAZORPAY_KEY_SECRET = 'your_razorpay_key_secret'; // Keep this secret!
```

### 2.3 Enable Payment Methods
1. Go to Razorpay Dashboard
2. Enable desired payment methods (UPI, Cards, Wallets, etc.)
3. Configure settlement account details

---

## Step 3: File Structure

```
cod-mobile-tournaments/
├── index.html                    # Main HTML file
├── style.css                     # Styling
├── config.js                     # Configuration
├── supabase.js                   # Supabase client
├── auth.js                       # Authentication
├── tournaments.js                # Tournament management
├── payments.js                   # Payment processing
├── email-verification.js         # Email verification
├── tournament-results.js         # Results management
├── match-history.js              # Match history
├── friend-system.js              # Friend system
├── messaging-system.js           # Messaging
├── streaming-integration.js      # Streaming integration
├── admin-panel.js                # Admin dashboard
├── payout-system.js              # Payouts
├── analytics-dashboard.js        # Analytics
├── script.js                     # Main application
├── README.md                     # Project README
├── FEATURES-DOCUMENTATION.md     # Features guide
└── SETUP-GUIDE.md               # This file
```

---

## Step 4: Local Testing

### 4.1 Simple HTTP Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using Live Server extension in VS Code
```

### 4.2 Access Application
Open browser: `http://localhost:8000`

### 4.3 Test Features
1. **Sign Up**: Create test account
2. **Email Verification**: Check console for link
3. **Browse Tournaments**: View mock data
4. **Register**: Test payment flow (use Razorpay test keys)
5. **Dashboard**: View stats and history

---

## Step 5: Production Deployment

### 5.1 Choose Hosting
- **Netlify**: Recommended, free tier available
- **Vercel**: Fast, easy deployment
- **GitHub Pages**: Static hosting
- **Firebase Hosting**: Google's platform

### 5.2 Deploy to Netlify
1. Push code to GitHub
2. Go to Netlify.com
3. Click "New site from Git"
4. Select your repository
5. Deploy

### 5.3 Environment Variables
Set in hosting platform:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
RAZORPAY_KEY_ID=your_key
```

### 5.4 Security Checklist
- [ ] Use HTTPS only
- [ ] Set Supabase RLS policies
- [ ] Hide secret keys
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Implement DDOS protection
- [ ] Regular backups
- [ ] Monitor errors

---

## Step 6: Email Service Integration

### Using SendGrid
1. Create SendGrid account
2. Get API key
3. Update email-verification.js:

```javascript
// Replace mock implementation with SendGrid API
const sendgridApiKey = 'your_sendgrid_key';
```

### Using Mailgun
1. Create Mailgun account
2. Configure domain
3. Update with Mailgun API calls

---

## Step 7: Testing Razorpay

### Test Credentials
```
Key ID: rzp_test_xxxxx
Test Cards:
- 4111111111111111 (Success)
- 4000000000000002 (Failure)
```

### Test Payment Flow
1. Go to Register
2. Click "Pay Now"
3. Use test card numbers
4. Complete payment
5. Check transactions in dashboard

---

## Step 8: Admin Setup

### Create Admin User
1. Sign up as normal user
2. In Supabase, update user role:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your_admin_email@example.com';
```

### Access Admin Panel
1. Login with admin account
2. "⚙️ Admin" button appears in navbar
3. Access all admin features

---

## Step 9: Monitoring & Maintenance

### Regular Tasks
- [ ] Monitor error logs
- [ ] Review suspicious activities
- [ ] Verify tournament results
- [ ] Process pending payouts
- [ ] Backup database
- [ ] Update security patches

### Performance Optimization
- Enable Supabase caching
- Optimize database queries
- Compress images
- Minify JavaScript
- Use CDN for assets

---

## Troubleshooting

### Supabase Connection Issues
**Problem**: Cannot connect to Supabase
**Solution**:
1. Verify credentials in config.js
2. Check Supabase project status
3. Verify internet connection
4. Clear browser cache

### Razorpay Not Loading
**Problem**: Payment gateway error
**Solution**:
1. Verify Key ID is correct
2. Check internet connection
3. Enable third-party cookies
4. Use different browser

### Email Verification Not Working
**Problem**: Verification link not received
**Solution**:
1. Check email service configuration
2. Verify token in database
3. Check email spam folder
4. Resend verification

### Admin Panel Access Denied
**Problem**: Admin features not visible
**Solution**:
1. Check user role in database
2. Clear browser storage: `localStorage.clear()`
3. Log out and log back in
4. Verify admin role was set

---

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
- JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

**Setup Complete! Your platform is ready to launch. 🚀**