# Quick Reference Guide

## 🚀 Quick Start

### Backend Setup (5 minutes)
```bash
# 1. Run migrations in Supabase SQL Editor
# Copy from: migrations/001_add_merchant_pins.sql
# Copy from: migrations/002_add_commission_to_redemptions.sql

# 2. Add to backend requirements.txt
echo "bcrypt==4.1.2" >> requirements.txt

# 3. Copy files to backend repo
cp backend/services/merchant_pin_service.py <backend-repo>/app/services/
cp backend/routes/entitlements_confirm.py <backend-repo>/app/modules/entitlements/

# 4. Update CORS (add to allowed origins)
# "https://merchant.studentverse.app"

# 5. Deploy
git add . && git commit -m "Add merchant validation" && git push
```

### Frontend Setup (5 minutes)
```bash
# 1. Navigate to frontend
cd frontend/

# 2. Update API URL in app.js (line 9)
# API_BASE_URL: 'https://your-backend-url.com'

# 3. Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/studentversedubai-rgb/sv-merchant-validator.git
git push -u origin main

# 4. Deploy to Cloudflare Pages
# - Go to dash.cloudflare.com
# - Pages > Create project > Connect Git
# - Select repo, deploy with default settings
# - Add custom domain: merchant.studentverse.app
```

---

## 📝 Generate Merchant PIN

```bash
# Install bcrypt
pip install bcrypt

# Generate PIN
python scripts/generate_pin.py <merchant-id> <pin> [valid-days]

# Example
python scripts/generate_pin.py 123e4567-e89b-12d3-a456-426614174000 1234 365

# Output: SQL file to insert into database
```

---

## 🧪 Test API

```bash
# Install requests
pip install requests

# Update config in scripts/test_api.py
# - API_BASE_URL
# - TEST_ENTITLEMENT_ID
# - TEST_MERCHANT_PIN

# Run tests
python scripts/test_api.py
```

---

## 🔧 Common Tasks

### Update Merchant PIN
```sql
-- Deactivate old PIN
UPDATE merchant_pins 
SET is_active = false 
WHERE merchant_id = 'merchant-uuid';

-- Insert new PIN (use generate_pin.py)
INSERT INTO merchant_pins (merchant_id, pin_hash, valid_until, is_active)
VALUES ('merchant-uuid', 'new-hash', NOW() + INTERVAL '1 year', true);
```

### Check Redemptions
```sql
-- Recent redemptions
SELECT 
    r.id,
    r.redeemed_at,
    r.total_amount,
    r.discount_amount,
    r.final_amount,
    m.name as merchant_name
FROM redemptions r
JOIN merchants m ON r.merchant_id = m.id
ORDER BY r.redeemed_at DESC
LIMIT 10;
```

### Check Failed PIN Attempts
```bash
# In Redis CLI or Upstash console
KEYS pin_attempts:*
GET pin_attempts:<merchant-id>
TTL pin_attempts:<merchant-id>
```

---

## 🐛 Troubleshooting

### Backend Issues

**CORS Error**
```python
# In main.py or config.py, ensure:
ALLOWED_ORIGINS = [
    "https://merchant.studentverse.app",
    # ... other origins
]
```

**PIN Validation Fails**
```bash
# Check bcrypt is installed
pip list | grep bcrypt

# Verify PIN hash format
python -c "import bcrypt; print(bcrypt.hashpw(b'1234', bcrypt.gensalt()))"
```

**Rate Limiting Not Working**
```python
# Check Redis connection
from app.core.redis import get_redis_client
redis = get_redis_client()
redis.ping()  # Should return True
```

### Frontend Issues

**Camera Not Working**
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try different browser (Chrome recommended)

**QR Scanner Not Detecting**
- Ensure good lighting
- Hold steady for 1-2 seconds
- Try manual entry as fallback

**API Calls Failing**
```javascript
// Check API URL in app.js
console.log(CONFIG.API_BASE_URL);

// Check CORS in browser console
// Should not see CORS errors
```

---

## 📊 Monitoring

### Backend Metrics
```bash
# Railway logs
railway logs --tail

# Check error rate
grep "ERROR" logs.txt | wc -l
```

### Frontend Metrics
- Cloudflare Pages > Analytics
- Check page views, errors, performance

### Database Metrics
```sql
-- Total redemptions today
SELECT COUNT(*) 
FROM redemptions 
WHERE redeemed_at >= CURRENT_DATE;

-- Average discount
SELECT AVG(discount_amount) 
FROM redemptions 
WHERE redeemed_at >= CURRENT_DATE;

-- Top merchants
SELECT 
    m.name,
    COUNT(*) as redemption_count,
    SUM(r.final_amount) as total_revenue
FROM redemptions r
JOIN merchants m ON r.merchant_id = m.id
WHERE r.redeemed_at >= CURRENT_DATE
GROUP BY m.name
ORDER BY redemption_count DESC
LIMIT 10;
```

---

## 🔐 Security Checklist

- [ ] HTTPS enforced on all domains
- [ ] CORS properly configured
- [ ] PINs hashed with bcrypt (never plain text)
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error messages don't leak sensitive info
- [ ] Merchant PINs distributed securely

---

## 📞 Support Contacts

- **Technical**: dev@studentverse.app
- **Business**: hello@studentverse.app
- **Emergency**: [Add emergency contact]

---

## 🔗 Important Links

- **Backend Repo**: https://github.com/studentversedubai-rgb/svapp-backend
- **Frontend Repo**: https://github.com/studentversedubai-rgb/sv-merchant-validator
- **Merchant App**: https://merchant.studentverse.app
- **API Docs**: https://svapp-backend-production.up.railway.app/docs
- **Supabase**: [Your Supabase dashboard URL]
- **Railway**: [Your Railway dashboard URL]
- **Cloudflare**: https://dash.cloudflare.com

---

## 📚 Documentation Files

- `PROJECT_SUMMARY.md` - Complete project overview
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `BACKEND_ADDITIONS.md` - Backend implementation details
- `frontend/README.md` - Frontend documentation
- `QUICK_REFERENCE.md` - This file

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly**
   - Test with real QR codes
   - Test on multiple devices
   - Test error scenarios

2. **Create merchant PINs**
   - Generate for all active merchants
   - Distribute securely
   - Document PIN reset process

3. **Train merchants**
   - Create user guide
   - Record video tutorial
   - Schedule training sessions

4. **Monitor usage**
   - Check logs daily for first week
   - Monitor error rates
   - Collect merchant feedback

5. **Iterate**
   - Fix bugs quickly
   - Add requested features
   - Optimize performance

---

Last updated: 2026-02-15
