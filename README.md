# Call of Duty Mobile Tournaments Platform

A competitive tournament platform for Call of Duty Mobile gamers with integrated payment processing and real-time leaderboards.

## Features

### 🎮 Tournament Management
- **Multiple Tournament Types**: Elite Championship, Squad Strike, Quick Fire Duel, Legendary Showdown
- **Real-time Updates**: Live participant tracking
- **Tournament Details**: Prize pools, entry fees, participant limits, game formats
- **Status Tracking**: Ongoing and upcoming tournaments

### 👥 User Management
- **User Authentication**: Email/password signup and login
- **User Profiles**: Game ID, statistics tracking
- **Dashboard**: View registered tournaments and personal statistics

### 🏆 Leaderboard System
- **Global Rankings**: Top players ranked by points
- **Player Stats**: Wins, total points, tournaments played
- **Real-time Updates**: Automatic ranking calculations

### 💳 Payment Integration
- **Razorpay Integration**: Secure payment processing
- **INR Currency Support**: Indian Rupee transactions
- **Automated Registration**: Instant tournament entry after payment
- **Payment Verification**: Secure payment confirmation

### 🎨 CoD Theme Design
- **Military Aesthetic**: Dark theme with tactical colors
- **Call of Duty Branding**: Yellow (#FFB81C) and Orange (#FF6B35) accent colors
- **Glitch Effects**: Animated text and visual effects
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Advanced styling with animations and gradients
- **Vanilla JavaScript**: No dependencies for faster loading

### Backend
- **Supabase**: PostgreSQL database with authentication
- **Tables**:
  - `users`: Player profiles and statistics
  - `tournaments`: Tournament information and details
  - `registrations`: User tournament registrations
  - `leaderboards`: Cached leaderboard data

### Payments
- **Razorpay**: Payment gateway for INR transactions
- **Secure Checkout**: Embedded payment modal

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/harsha1599/cod-mobile-tournaments.git
cd cod-mobile-tournaments
```

### 2. Configure Supabase
1. Create a project on [Supabase](https://supabase.com)
2. Create the following tables:

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  game_id TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  tournaments_played INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tournaments Table:**
```sql
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
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Registrations Table:**
```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Update `config.js` with your Supabase credentials:
```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_KEY = 'your_supabase_anon_key';
```

### 3. Configure Razorpay
1. Create a Razorpay account at [Razorpay.com](https://razorpay.com)
2. Get your Key ID from the dashboard
3. Update `config.js`:
```javascript
const RAZORPAY_KEY_ID = 'your_razorpay_key_id';
```

### 4. Add Supabase Library
Add the Supabase library to your HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
```

## Project Structure

```
cod-mobile-tournaments/
├── index.html           # Main HTML file
├── style.css            # Styling with CoD theme
├── config.js            # Configuration (API keys, URLs)
├── supabase.js          # Supabase client and database functions
├── auth.js              # Authentication logic
├── tournaments.js       # Tournament management
├── payments.js          # Razorpay integration
├── script.js            # Main application logic
└── README.md            # This file
```

## File Descriptions

### index.html
- Main HTML structure
- All modals for auth, tournaments, payments, and dashboard
- Navigation and hero sections

### style.css
- 800+ lines of responsive styling
- Call of Duty military theme colors
- Animations and hover effects
- Mobile-first responsive design

### config.js
- Centralized configuration
- API keys and URLs
- App settings

### supabase.js
- Supabase client initialization
- Database functions for users, tournaments, registrations
- Leaderboard queries

### auth.js
- Login and signup functionality
- User authentication state management
- Auth UI updates

### tournaments.js
- Tournament loading and display
- Mock tournament data
- Leaderboard display

### payments.js
- Razorpay payment initiation
- Payment verification
- Registration processing

### script.js
- Modal management
- Notification system
- Dashboard logic
- Event listeners

## Usage

### For Players
1. **Sign Up**: Create an account with your Game ID
2. **Browse Tournaments**: View active and upcoming tournaments
3. **Register**: Click "Register Now" and complete payment
4. **Compete**: Participate in your registered tournaments
5. **Track Stats**: View your wins, points, and rankings

### For Administrators
1. Access Supabase dashboard
2. Add tournaments using the Tournaments table
3. Manage registrations and player data
4. Update leaderboards after tournament completion

## Features Implemented

✅ User Authentication (Signup/Login)
✅ Tournament Listing
✅ Tournament Registration
✅ Payment Processing (Razorpay)
✅ User Dashboard
✅ Leaderboard System
✅ Responsive Design
✅ Notifications
✅ Modal System
✅ Call of Duty Theme
✅ Smooth Animations
✅ Mock Data Support

## Features to Implement

🔲 Email Verification
🔲 Tournament Results Management
🔲 Match History
🔲 Friend System
🔲 In-app Messaging
🔲 Tournament Streaming Integration
🔲 Admin Panel
🔲 Automated Payouts
🔲 Refund Management
🔲 Analytics Dashboard

## Environment Variables

Create a `.env.local` file:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## API Integration

### Razorpay Payment Flow
1. User clicks "Register Now"
2. System shows payment modal
3. Razorpay checkout opens
4. User completes payment
5. Payment verified
6. User registered in tournament
7. Confirmation notification

## Security Considerations

- ✅ Razorpay handles payment security
- ✅ Supabase authentication for user management
- ✅ HTTPS recommended for production
- ✅ Environment variables for sensitive data
- ⚠️ Add server-side verification in production
- ⚠️ Implement CORS properly
- ⚠️ Add rate limiting

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Supabase Connection Issues
- Verify credentials in config.js
- Check Supabase project status
- Ensure tables are created correctly

### Razorpay Not Loading
- Check internet connection
- Verify Key ID is correct
- Check console for errors

### Authentication Issues
- Clear browser cache
- Check localStorage for stored user data
- Verify Supabase auth settings

## Contributing

Fork the repository and submit pull requests for improvements.

## License

MIT License - Feel free to use this project for personal and commercial purposes.

## Support

For issues and feature requests, open an issue on GitHub.

---

**Made with ❤️ for CoD Mobile Gamers**

*This project is not affiliated with Call of Duty or Activision Blizzard.*