# StudentVerse Merchant Validation System

> **Complete implementation of merchant PIN validation and QR-based redemption confirmation for StudentVerse**

[![Status](https://img.shields.io/badge/status-ready%20for%20deployment-green)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)]()
[![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS-F7DF1E)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL-336791)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Security](#security)
- [Deployment](#deployment)
- [Support](#support)

---

## 🎯 Overview

This system enables StudentVerse merchants to validate and confirm student entitlement redemptions using:
- **QR Code Scanning**: Fast camera-based validation
- **PIN Authentication**: Secure merchant verification
- **Automatic Calculations**: Real-time discount computation
- **Mobile-First Design**: Optimized for tablets and phones

### Use Case
1. Student shows QR code to merchant
2. Merchant scans code with this app
3. Merchant enters their PIN
4. Merchant enters bill amount
5. System calculates discount and confirms redemption
6. Both parties receive confirmation

---

## ✨ Features

### Backend Features
- ✅ Secure PIN validation with bcrypt hashing
- ✅ Rate limiting (3 attempts per 15 minutes)
- ✅ Duplicate redemption prevention
- ✅ State management (pending → confirmed → used)
- ✅ Optional commission tracking
- ✅ Comprehensive error handling

### Frontend Features
- ✅ Real-time QR code scanning
- ✅ Manual code entry fallback
- ✅ PIN entry with visibility toggle
- ✅ Live discount calculation
- ✅ Success confirmation screen
- ✅ Error notifications
- ✅ Loading states
- ✅ Fully responsive design

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Student   │         │   Merchant   │         │   Backend   │
│     App     │────────▶│  Validator   │────────▶│     API     │
│             │  Shows  │     App      │  Calls  │             │
│  (QR Code)  │  QR     │ (This Repo)  │   API   │  (Railway)  │
└─────────────┘         └──────────────┘         └─────────────┘
                              │                         │
                              │                         │
                              ▼                         ▼
                        ┌──────────┐            ┌─────────────┐
                        │ Camera/  │            │  Supabase   │
                        │  Input   │            │  (Database) │
                        └──────────┘            └─────────────┘
```

### Data Flow
1. **Scan**: Merchant scans student's QR code
2. **Validate**: `POST /entitlements/validate` → Check entitlement status
3. **Authenticate**: Merchant enters PIN → Validated server-side
4. **Calculate**: Merchant enters amount → Auto-calculate discount
5. **Confirm**: `POST /entitlements/confirm` → Create redemption record
6. **Success**: Show confirmation to both parties

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ (for backend)
- Node.js 18+ (optional, for local frontend testing)
- Supabase account
- Railway account (backend hosting)
- Cloudflare account (frontend hosting)

### Backend Setup (5 minutes)

```bash
# 1. Run database migrations
# Open Supabase SQL Editor and run:
# - migrations/001_add_merchant_pins.sql
# - migrations/002_add_commission_to_redemptions.sql

# 2. Install dependencies
pip install bcrypt==4.1.2

# 3. Copy files to your backend repo
cp backend/services/merchant_pin_service.py <your-backend>/app/services/
cp backend/routes/entitlements_confirm.py <your-backend>/app/modules/entitlements/

# 4. Update CORS configuration
# Add "https://merchant.studentverse.app" to allowed origins

# 5. Deploy
git add . && git commit -m "Add merchant validation" && git push
```

### Frontend Setup (5 minutes)

```bash
# 1. Navigate to frontend directory
cd frontend/

# 2. Update API URL in app.js (line 9)
# Change API_BASE_URL to your backend URL

# 3. Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/studentversedubai-rgb/sv-merchant-validator.git
git push -u origin main

# 4. Deploy to Cloudflare Pages
# - Go to dash.cloudflare.com
# - Pages > Create project > Connect Git
# - Select repository and deploy
# - Add custom domain: merchant.studentverse.app
```

### Generate Merchant PIN

```bash
# Install bcrypt
pip install bcrypt

# Generate PIN
python scripts/generate_pin.py <merchant-id> <pin> <valid-days>

# Example
python scripts/generate_pin.py 123e4567-e89b-12d3-a456-426614174000 1234 365

# Copy the generated SQL and run in Supabase
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Complete project overview and specifications |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Step-by-step deployment instructions |
| **[BACKEND_ADDITIONS.md](BACKEND_ADDITIONS.md)** | Backend implementation details |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Common commands and troubleshooting |
| **[frontend/README.md](frontend/README.md)** | Frontend-specific documentation |

---

## 📁 Project Structure

```
merchant-dashboard/
│
├── 📄 README.md                    # This file
├── 📄 PROJECT_SUMMARY.md           # Complete project overview
├── 📄 DEPLOYMENT_GUIDE.md          # Deployment instructions
├── 📄 QUICK_REFERENCE.md           # Quick reference guide
├── 📄 BACKEND_ADDITIONS.md         # Backend implementation guide
│
├── 📂 backend/                     # Backend additions
│   ├── services/
│   │   └── merchant_pin_service.py      # PIN validation logic
│   ├── routes/
│   │   └── entitlements_confirm.py      # Confirmation endpoint
│   ├── config/
│   │   └── cors_config.py               # CORS configuration
│   ├── requirements_merchant.txt        # Python dependencies
│   └── .gitignore
│
├── 📂 frontend/                    # Merchant validator app
│   ├── index.html                       # Main HTML
│   ├── styles.css                       # Styles (mobile-first)
│   ├── app.js                           # Application logic
│   ├── wrangler.toml                    # Cloudflare config
│   ├── README.md                        # Frontend docs
│   └── .gitignore
│
├── 📂 migrations/                  # Database migrations
│   ├── 001_add_merchant_pins.sql        # Create merchant_pins table
│   └── 002_add_commission_to_redemptions.sql  # Add commission tracking
│
└── 📂 scripts/                     # Utility scripts
    ├── generate_pin.py                  # Generate merchant PINs
    └── test_api.py                      # Test API endpoints
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Web framework |
| **PostgreSQL** | Database (via Supabase) |
| **Redis** | Rate limiting & caching |
| **bcrypt** | PIN hashing |
| **Railway** | Hosting |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling (mobile-first) |
| **JavaScript (ES6+)** | Logic |
| **jsQR** | QR code scanning |
| **Cloudflare Pages** | Hosting |

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash (Redis)
- **Backend Hosting**: Railway
- **Frontend Hosting**: Cloudflare Pages
- **Domain**: Cloudflare DNS

---

## 🔐 Security

### Implemented Security Measures

1. **PIN Security**
   - ✅ Bcrypt hashing (10 salt rounds)
   - ✅ Server-side validation only
   - ✅ Never stored or transmitted in plain text
   - ✅ HTTPS enforced

2. **Rate Limiting**
   - ✅ 3 failed attempts per merchant
   - ✅ 15-minute lockout period
   - ✅ Redis-based tracking

3. **State Validation**
   - ✅ Only `pending_confirmation` entitlements
   - ✅ Duplicate redemption prevention
   - ✅ Atomic database operations

4. **Network Security**
   - ✅ HTTPS-only
   - ✅ CORS properly configured
   - ✅ Secure headers (CSP, X-Frame-Options)
   - ✅ No sensitive data in frontend

### Security Checklist
- [ ] HTTPS enforced on all domains
- [ ] CORS properly configured
- [ ] PINs hashed with bcrypt
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error messages sanitized
- [ ] Merchant PINs distributed securely

---

## 🚢 Deployment

### Production URLs
- **Backend API**: `https://svapp-backend-production.up.railway.app`
- **Merchant App**: `https://merchant.studentverse.app`
- **Main App**: `https://studentverse.app`

### Deployment Steps

1. **Backend** (Railway)
   - Run database migrations in Supabase
   - Add files to backend repository
   - Update CORS configuration
   - Push to GitHub (auto-deploys)

2. **Frontend** (Cloudflare Pages)
   - Update API URL in configuration
   - Push to GitHub repository
   - Connect to Cloudflare Pages
   - Configure custom domain

**See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.**

---

## 🧪 Testing

### Run API Tests
```bash
# Install dependencies
pip install requests

# Update configuration in scripts/test_api.py
# Run tests
python scripts/test_api.py
```

### Manual Testing Checklist
- [ ] QR scanner works on mobile
- [ ] Camera permissions granted
- [ ] Manual entry works
- [ ] PIN validation works
- [ ] Rate limiting enforced
- [ ] Amount calculation correct
- [ ] Success screen displays
- [ ] Error handling works
- [ ] HTTPS enforced
- [ ] Responsive on all devices

---

## 📊 Monitoring

### Backend Metrics
- Railway deployment logs
- API response times
- Error rates
- Database query performance

### Frontend Metrics
- Cloudflare Analytics
- Page load times
- JavaScript errors
- User engagement

### Database Metrics
```sql
-- Total redemptions today
SELECT COUNT(*) FROM redemptions WHERE redeemed_at >= CURRENT_DATE;

-- Average discount
SELECT AVG(discount_amount) FROM redemptions WHERE redeemed_at >= CURRENT_DATE;

-- Top merchants
SELECT m.name, COUNT(*) as redemptions
FROM redemptions r
JOIN merchants m ON r.merchant_id = m.id
WHERE r.redeemed_at >= CURRENT_DATE
GROUP BY m.name
ORDER BY redemptions DESC;
```

---

## 🐛 Troubleshooting

### Common Issues

**Camera not working**
- Ensure HTTPS is enabled
- Check browser permissions
- Try different browser (Chrome recommended)

**QR code not scanning**
- Ensure good lighting
- Hold steady for 1-2 seconds
- Try manual entry as fallback

**API calls failing**
- Verify API URL in configuration
- Check CORS settings
- Ensure backend is running
- Check network connectivity

**PIN validation fails**
- Verify bcrypt is installed
- Check PIN hash format
- Ensure merchant has active PIN

**See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more troubleshooting.**

---

## 🤝 Contributing

This is a proprietary project for StudentVerse. For internal contributions:

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Wait for review

---

## 📞 Support

### For Developers
- **Email**: dev@studentverse.app
- **GitHub Issues**: Create an issue in the repository

### For Merchants
- **Email**: support@studentverse.app
- **Phone**: [Add support phone number]

### Emergency Contact
- **On-call**: [Add emergency contact]

---

## 📝 License

Proprietary - StudentVerse © 2026. All rights reserved.

---

## 🙏 Acknowledgments

Built with ❤️ by the StudentVerse team in Dubai, UAE.

### Team
- **Backend**: [Your name]
- **Frontend**: [Your name]
- **Design**: [Designer name]
- **Product**: [Product manager name]

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] Merchant PIN validation
- [x] QR code scanning
- [x] Redemption confirmation
- [x] Mobile-first frontend

### Phase 2 (Future)
- [ ] Offline mode support
- [ ] Bulk redemption processing
- [ ] Analytics dashboard
- [ ] Push notifications
- [ ] Receipt generation

### Phase 3 (Future)
- [ ] Native mobile app
- [ ] Advanced fraud detection
- [ ] Real-time reporting
- [ ] POS system integration

---

## 📅 Version History

- **v1.0.0** (2026-02-15): Initial release
  - Merchant PIN validation
  - QR code scanning
  - Redemption confirmation
  - Mobile-first frontend
  - Complete documentation

---

## 🔗 Related Repositories

- **Backend**: https://github.com/studentversedubai-rgb/svapp-backend
- **Frontend (Merchant)**: https://github.com/studentversedubai-rgb/sv-merchant-validator
- **Frontend (Student)**: [Add student app repo]

---

**Last Updated**: February 15, 2026

**Status**: ✅ Ready for deployment

**Maintained by**: StudentVerse Engineering Team
