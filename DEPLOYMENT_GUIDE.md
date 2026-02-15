# Complete Deployment Guide

This guide covers deploying both backend additions and the frontend merchant validator.

## Prerequisites

- Access to Supabase database
- Backend deployed on Railway
- Cloudflare account
- GitHub account

---

## Part 1: Backend Deployment

### Step 1: Run Database Migrations

1. **Connect to Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run migrations in order**:

   **Migration 1 - merchant_pins table**:
   ```sql
   -- Copy contents from migrations/001_add_merchant_pins.sql
   -- Run in Supabase SQL Editor
   ```

   **Migration 2 - commission tracking (optional)**:
   ```sql
   -- Copy contents from migrations/002_add_commission_to_redemptions.sql
   -- Run in Supabase SQL Editor
   ```

3. **Verify tables created**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('merchant_pins', 'redemptions');
   ```

### Step 2: Install Dependencies

1. **Add to your backend's requirements.txt**:
   ```
   bcrypt==4.1.2
   ```

2. **Install locally**:
   ```bash
   pip install bcrypt==4.1.2
   ```

3. **Commit changes**:
   ```bash
   git add requirements.txt
   git commit -m "Add bcrypt for PIN hashing"
   git push origin main
   ```

### Step 3: Add Service Files

1. **Copy service file**:
   - Copy `backend/services/merchant_pin_service.py` to your backend repo
   - Path: `app/services/merchant_pin_service.py`

2. **Copy route file**:
   - Copy `backend/routes/entitlements_confirm.py` to your backend repo
   - Path: `app/modules/entitlements/routes.py` (or create new file)

3. **Update main router**:
   ```python
   # In your main app file (e.g., app/main.py)
   from app.modules.entitlements.routes import router as entitlements_router
   
   app.include_router(entitlements_router)
   ```

### Step 4: Update CORS Configuration

1. **Update CORS settings**:
   ```python
   # In your app/core/config.py or main.py
   
   ALLOWED_ORIGINS = [
       "https://studentverse.app",
       "https://www.studentverse.app",
       "https://merchant.studentverse.app",  # ADD THIS
       "http://localhost:3000",
       "http://localhost:5173",
   ]
   ```

2. **Apply CORS middleware**:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=ALLOWED_ORIGINS,
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
       allow_headers=["*"],
   )
   ```

### Step 5: Deploy Backend

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Add merchant PIN validation feature"
   git push origin main
   ```

2. **Railway auto-deploys** (if connected to GitHub)

3. **Verify deployment**:
   - Check Railway logs
   - Test endpoint: `POST /entitlements/confirm`

### Step 6: Create Test Merchant PIN

1. **Generate PIN hash** (Python):
   ```python
   import bcrypt
   
   pin = "1234"  # Your test PIN
   pin_hash = bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt(rounds=10))
   print(pin_hash.decode('utf-8'))
   ```

2. **Insert into database**:
   ```sql
   INSERT INTO merchant_pins (merchant_id, pin_hash, valid_until, is_active)
   VALUES (
       'your-merchant-uuid',
       'bcrypt-hash-from-above',
       NOW() + INTERVAL '1 year',
       true
   );
   ```

---

## Part 2: Frontend Deployment

### Step 1: Create GitHub Repository

1. **Initialize git**:
   ```bash
   cd "c:/Users/msina/OneDrive/Desktop/sv/merchant dashboard/frontend"
   git init
   git add .
   git commit -m "Initial commit: Merchant validator app"
   ```

2. **Create GitHub repo**:
   - Go to https://github.com/new
   - Repository name: `sv-merchant-validator`
   - Description: "Merchant validation app for StudentVerse"
   - Public or Private: Private (recommended)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/studentversedubai-rgb/sv-merchant-validator.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Cloudflare Pages

1. **Login to Cloudflare**:
   - Go to https://dash.cloudflare.com
   - Navigate to "Pages"

2. **Create new project**:
   - Click "Create a project"
   - Click "Connect to Git"
   - Authorize GitHub
   - Select `sv-merchant-validator` repository

3. **Configure build**:
   - **Project name**: `sv-merchant-validator`
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
   - Click "Save and Deploy"

4. **Wait for deployment**:
   - First deployment takes ~1 minute
   - You'll get a URL like: `sv-merchant-validator.pages.dev`

### Step 3: Configure Custom Domain

1. **Add custom domain**:
   - In Cloudflare Pages project
   - Go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `merchant.studentverse.app`

2. **Update DNS** (if studentverse.app is on Cloudflare):
   - Cloudflare will auto-configure DNS
   - If not, add CNAME record:
     ```
     Type: CNAME
     Name: merchant
     Target: sv-merchant-validator.pages.dev
     Proxy: Enabled (orange cloud)
     ```

3. **Wait for SSL**:
   - SSL certificate auto-provisions
   - Usually takes 5-10 minutes

### Step 4: Update Frontend Configuration

1. **Update API URL in app.js**:
   ```javascript
   const CONFIG = {
       API_BASE_URL: 'https://svapp-backend-production.up.railway.app',
       // ... rest of config
   };
   ```

2. **Commit and push**:
   ```bash
   git add app.js
   git commit -m "Update API URL for production"
   git push origin main
   ```

3. **Auto-redeploy**:
   - Cloudflare Pages auto-deploys on push
   - Check deployment status in dashboard

---

## Part 3: Testing

### Test Backend Endpoints

1. **Test PIN validation** (using Postman or curl):
   ```bash
   curl -X POST https://svapp-backend-production.up.railway.app/entitlements/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "entitlement_id": "test-uuid",
       "merchant_pin": "1234",
       "total_amount": 100.00,
       "discount_amount": 20.00
     }'
   ```

2. **Expected responses**:
   - Success: `200 OK` with redemption details
   - Invalid PIN: `401 Unauthorized`
   - Not found: `404 Not Found`

### Test Frontend

1. **Open app**:
   - Go to https://merchant.studentverse.app

2. **Test QR scanner**:
   - Click "Start Scanner"
   - Grant camera permissions
   - Test with QR code or manual entry

3. **Test PIN flow**:
   - Enter valid entitlement code
   - Enter merchant PIN
   - Verify validation

4. **Test amount calculation**:
   - Enter total amount
   - Verify discount calculation
   - Confirm redemption

### Test Mobile

1. **Access from mobile device**:
   - Open https://merchant.studentverse.app on phone/tablet
   - Test camera permissions
   - Verify responsive layout

2. **Test offline behavior**:
   - Disable network
   - Verify error messages

---

## Part 4: Monitoring

### Backend Monitoring

1. **Railway logs**:
   - Check for errors in deployment logs
   - Monitor API response times

2. **Supabase monitoring**:
   - Check database queries
   - Monitor table sizes

### Frontend Monitoring

1. **Cloudflare Analytics**:
   - Go to Pages project > Analytics
   - Monitor page views, errors

2. **Browser Console**:
   - Open DevTools
   - Check for JavaScript errors

---

## Troubleshooting

### Backend Issues

**Issue**: Migration fails
- **Solution**: Check if tables already exist, verify syntax

**Issue**: CORS errors
- **Solution**: Verify `merchant.studentverse.app` in ALLOWED_ORIGINS

**Issue**: PIN validation fails
- **Solution**: Check bcrypt is installed, verify PIN hash format

### Frontend Issues

**Issue**: Camera not working
- **Solution**: Ensure HTTPS, check browser permissions

**Issue**: API calls fail
- **Solution**: Verify API_BASE_URL, check CORS, verify backend is running

**Issue**: QR scanner not detecting codes
- **Solution**: Check lighting, try manual entry, verify jsQR library loaded

---

## Rollback Plan

### Backend Rollback

1. **Revert code**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Railway auto-deploys** previous version

### Frontend Rollback

1. **Revert in GitHub**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or use Cloudflare Pages**:
   - Go to Deployments
   - Click "..." on previous deployment
   - Click "Rollback to this deployment"

---

## Security Checklist

- [ ] HTTPS enforced on both frontend and backend
- [ ] CORS properly configured
- [ ] PINs hashed with bcrypt
- [ ] Rate limiting enabled
- [ ] No sensitive data in frontend code
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Error messages don't leak sensitive info

---

## Next Steps

1. **Create merchant PINs** for all merchants
2. **Train merchants** on using the app
3. **Monitor usage** for first week
4. **Collect feedback** and iterate
5. **Add analytics** for business insights

---

## Support

For deployment issues:
- Backend: Check Railway logs
- Frontend: Check Cloudflare Pages logs
- Database: Check Supabase logs

Contact: dev@studentverse.app
