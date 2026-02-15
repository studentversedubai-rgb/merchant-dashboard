# Implementation Checklist

Use this checklist to track your deployment progress.

## 📋 Pre-Deployment

### Backend Preparation
- [ ] Review existing backend structure
- [ ] Verify Phase 1-4 are working
- [ ] Confirm redemptions table exists
- [ ] Access to Supabase dashboard
- [ ] Access to Railway dashboard

### Frontend Preparation
- [ ] GitHub account ready
- [ ] Cloudflare account ready
- [ ] Domain access (studentverse.app)

---

## 🗄️ Database Setup

### Migrations
- [ ] Open Supabase SQL Editor
- [ ] Run `001_add_merchant_pins.sql`
- [ ] Verify merchant_pins table created
- [ ] Run `002_add_commission_to_redemptions.sql` (optional)
- [ ] Verify commission_amount column added
- [ ] Check indexes created
- [ ] Test query: `SELECT * FROM merchant_pins LIMIT 1;`

### Test Data
- [ ] Install bcrypt: `pip install bcrypt`
- [ ] Run `python scripts/generate_pin.py <merchant-id> 1234 365`
- [ ] Copy generated SQL
- [ ] Insert test PIN into database
- [ ] Verify: `SELECT * FROM merchant_pins WHERE merchant_id = '<merchant-id>';`

---

## 🔧 Backend Deployment

### Code Integration
- [ ] Copy `backend/services/merchant_pin_service.py` to backend repo
- [ ] Copy `backend/routes/entitlements_confirm.py` to backend repo
- [ ] Add `bcrypt==4.1.2` to requirements.txt
- [ ] Update CORS config with `https://merchant.studentverse.app`
- [ ] Import and register routes in main app

### Testing
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Test locally (if possible)
- [ ] Run `python scripts/test_api.py` (update config first)
- [ ] Verify all tests pass

### Deployment
- [ ] Commit changes: `git add . && git commit -m "Add merchant validation"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for Railway deployment
- [ ] Check Railway logs for errors
- [ ] Test endpoint: `POST /entitlements/confirm`

### Verification
- [ ] API docs updated: `<backend-url>/docs`
- [ ] Test with Postman/curl
- [ ] Verify CORS headers
- [ ] Check rate limiting works
- [ ] Verify PIN validation works

---

## 🎨 Frontend Deployment

### Configuration
- [ ] Navigate to `frontend/` directory
- [ ] Update `API_BASE_URL` in `app.js` (line 9)
- [ ] Test locally: `python -m http.server 8000`
- [ ] Open `http://localhost:8000` in browser
- [ ] Test QR scanner (grant camera permissions)

### Git Setup
- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repo: `sv-merchant-validator`
- [ ] Add remote: `git remote add origin <repo-url>`
- [ ] Push: `git push -u origin main`

### Cloudflare Pages
- [ ] Go to https://dash.cloudflare.com
- [ ] Navigate to Pages
- [ ] Click "Create a project"
- [ ] Click "Connect to Git"
- [ ] Authorize GitHub
- [ ] Select `sv-merchant-validator` repository
- [ ] Configure build:
  - Build command: (empty)
  - Build output: `/`
- [ ] Click "Save and Deploy"
- [ ] Wait for deployment (~1 minute)
- [ ] Note the URL: `<project>.pages.dev`

### Custom Domain
- [ ] In Cloudflare Pages project, go to "Custom domains"
- [ ] Click "Set up a custom domain"
- [ ] Enter: `merchant.studentverse.app`
- [ ] Wait for DNS configuration
- [ ] Wait for SSL certificate (~5-10 minutes)
- [ ] Verify HTTPS works: `https://merchant.studentverse.app`

### Verification
- [ ] Open `https://merchant.studentverse.app`
- [ ] Test QR scanner
- [ ] Test manual entry
- [ ] Test PIN validation
- [ ] Test amount calculation
- [ ] Test on mobile device
- [ ] Check browser console for errors

---

## 🧪 End-to-End Testing

### Happy Path
- [ ] Open merchant app
- [ ] Click "Start Scanner"
- [ ] Grant camera permissions
- [ ] Scan valid QR code (or enter manually)
- [ ] Verify offer details displayed
- [ ] Enter valid merchant PIN
- [ ] Verify PIN accepted
- [ ] Enter total amount (e.g., 100)
- [ ] Verify discount calculated correctly
- [ ] Click "Confirm Redemption"
- [ ] Verify success screen shows
- [ ] Check database: redemption record created
- [ ] Check database: entitlement marked as used

### Error Cases
- [ ] Test invalid entitlement ID → Should show error
- [ ] Test wrong PIN → Should show "Invalid PIN"
- [ ] Test wrong PIN 3 times → Should lock for 15 minutes
- [ ] Test duplicate redemption → Should show "Already redeemed"
- [ ] Test negative amount → Should show validation error
- [ ] Test network offline → Should show connection error

### Cross-Browser Testing
- [ ] Chrome (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

---

## 📊 Monitoring Setup

### Backend Monitoring
- [ ] Set up Railway alerts
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Set up uptime monitoring (optional)

### Frontend Monitoring
- [ ] Check Cloudflare Analytics
- [ ] Monitor page load times
- [ ] Check for JavaScript errors
- [ ] Set up error tracking (optional)

### Database Monitoring
- [ ] Check Supabase dashboard
- [ ] Monitor query performance
- [ ] Check table sizes
- [ ] Set up backup schedule

---

## 📝 Documentation

### Internal Documentation
- [ ] Update team wiki (if applicable)
- [ ] Document merchant PIN distribution process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

### Merchant Documentation
- [ ] Create user guide (PDF)
- [ ] Record video tutorial
- [ ] Create FAQ document
- [ ] Prepare training materials

---

## 🚀 Launch Preparation

### Pre-Launch
- [ ] All tests passing
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup plan ready
- [ ] Rollback plan documented
- [ ] Support team briefed

### Launch Day
- [ ] Deploy backend (off-peak hours)
- [ ] Deploy frontend
- [ ] Verify both deployments
- [ ] Generate PINs for all merchants
- [ ] Distribute PINs securely
- [ ] Send launch announcement
- [ ] Monitor closely for 24 hours

### Post-Launch
- [ ] Collect merchant feedback
- [ ] Monitor error rates
- [ ] Check redemption volumes
- [ ] Address any issues quickly
- [ ] Schedule follow-up training

---

## 🔐 Security Verification

### Backend Security
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] PINs hashed with bcrypt
- [ ] Rate limiting active
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error messages sanitized

### Frontend Security
- [ ] HTTPS enforced
- [ ] No sensitive data in code
- [ ] Secure headers configured
- [ ] Camera permissions handled
- [ ] API keys not exposed
- [ ] CSP headers set

---

## 📞 Support Readiness

### Support Team
- [ ] Support team trained
- [ ] Escalation process defined
- [ ] Contact information updated
- [ ] Support hours defined

### Merchant Support
- [ ] Help desk ready
- [ ] FAQ published
- [ ] Video tutorials available
- [ ] Phone support available

---

## ✅ Final Checks

### Before Going Live
- [ ] All checklist items completed
- [ ] Stakeholders informed
- [ ] Monitoring in place
- [ ] Support team ready
- [ ] Rollback plan tested
- [ ] Communication plan ready

### Go/No-Go Decision
- [ ] Technical lead approval
- [ ] Product manager approval
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] All critical bugs fixed

---

## 🎉 Launch!

- [ ] **DEPLOY TO PRODUCTION**
- [ ] Monitor for first hour
- [ ] Send launch announcement
- [ ] Update status page
- [ ] Celebrate! 🎊

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Sign-off**: _______________

---

## 📝 Notes

Use this space for deployment notes, issues encountered, or lessons learned:

```
[Your notes here]
```

---

Last updated: 2026-02-15
