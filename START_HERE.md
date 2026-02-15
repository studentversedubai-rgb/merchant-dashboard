# 🚀 START HERE - Quick Start Guide

**Welcome!** This guide will get you from zero to deployed in ~30 minutes.

---

## ⏱️ Time Estimate

- **Backend Setup**: 10 minutes
- **Frontend Setup**: 10 minutes
- **Testing**: 10 minutes
- **Total**: ~30 minutes

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] Access to Supabase dashboard
- [ ] Access to Railway dashboard (backend hosting)
- [ ] Access to Cloudflare dashboard
- [ ] GitHub account
- [ ] Python 3.11+ installed (for scripts)
- [ ] Git installed

---

## 🎯 Step-by-Step Deployment

### STEP 1: Database Setup (5 minutes)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Click "SQL Editor" in sidebar

2. **Run Migration 1**
   - Open file: `migrations/001_add_merchant_pins.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. No rows returned"

3. **Run Migration 2** (Optional - for commission tracking)
   - Open file: `migrations/002_add_commission_to_redemptions.sql`
   - Copy entire contents
   - Paste in SQL Editor
   - Click "Run"
   - ✅ Should see: "Success. No rows returned"

4. **Verify Tables**
   - Run this query:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('merchant_pins', 'redemptions');
   ```
   - ✅ Should see both tables listed

---

### STEP 2: Backend Deployment (10 minutes)

1. **Install bcrypt**
   ```bash
   pip install bcrypt==4.1.2
   ```

2. **Copy Files to Your Backend Repo**
   
   Navigate to your backend repository, then:
   
   ```bash
   # Copy PIN service
   cp "c:/Users/msina/OneDrive/Desktop/sv/merchant dashboard/backend/services/merchant_pin_service.py" app/services/
   
   # Copy confirmation route
   cp "c:/Users/msina/OneDrive/Desktop/sv/merchant dashboard/backend/routes/entitlements_confirm.py" app/modules/entitlements/
   ```

3. **Update requirements.txt**
   
   Add this line to your backend's `requirements.txt`:
   ```
   bcrypt==4.1.2
   ```

4. **Update CORS Configuration**
   
   In your backend's main app file (e.g., `app/main.py`), add to ALLOWED_ORIGINS:
   ```python
   ALLOWED_ORIGINS = [
       # ... existing origins ...
       "https://merchant.studentverse.app",  # ADD THIS LINE
   ]
   ```

5. **Register the Route**
   
   In your backend's main app file, add:
   ```python
   from app.modules.entitlements.routes import router as entitlements_router
   app.include_router(entitlements_router)
   ```

6. **Deploy to Railway**
   ```bash
   git add .
   git commit -m "Add merchant PIN validation feature"
   git push origin main
   ```

7. **Wait for Deployment**
   - Go to Railway dashboard
   - Wait for deployment to complete (~2 minutes)
   - ✅ Check logs for any errors

8. **Verify API**
   - Go to: `https://your-backend-url.com/docs`
   - ✅ Should see `POST /entitlements/confirm` endpoint

---

### STEP 3: Create Test Merchant PIN (5 minutes)

1. **Generate PIN**
   ```bash
   cd "c:/Users/msina/OneDrive/Desktop/sv/merchant dashboard"
   python scripts/generate_pin.py YOUR-MERCHANT-UUID 1234 365
   ```
   
   Replace `YOUR-MERCHANT-UUID` with an actual merchant ID from your database.

2. **Copy Generated SQL**
   - Script will output SQL and save to file
   - Copy the SQL INSERT statement

3. **Run in Supabase**
   - Open Supabase SQL Editor
   - Paste the SQL
   - Click "Run"
   - ✅ Should see: "Success. 1 row inserted"

4. **Verify PIN Created**
   ```sql
   SELECT * FROM merchant_pins WHERE merchant_id = 'YOUR-MERCHANT-UUID';
   ```
   - ✅ Should see your PIN record

---

### STEP 4: Frontend Deployment (10 minutes)

1. **Update API URL**
   
   Open: `frontend/app.js`
   
   Line 9, change:
   ```javascript
   API_BASE_URL: 'https://svapp-backend-production.up.railway.app'
   ```
   
   To your actual backend URL.

2. **Create GitHub Repository**
   
   ```bash
   cd "c:/Users/msina/OneDrive/Desktop/sv/merchant dashboard/frontend"
   git init
   git add .
   git commit -m "Initial commit: Merchant validator app"
   ```

3. **Push to GitHub**
   
   Go to https://github.com/new and create repo: `sv-merchant-validator`
   
   Then:
   ```bash
   git remote add origin https://github.com/studentversedubai-rgb/sv-merchant-validator.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Cloudflare Pages**
   
   - Go to https://dash.cloudflare.com
   - Click "Pages" in sidebar
   - Click "Create a project"
   - Click "Connect to Git"
   - Select `sv-merchant-validator` repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: `/`
   - Click "Save and Deploy"
   - ✅ Wait ~1 minute for deployment

5. **Configure Custom Domain**
   
   - In Cloudflare Pages project, click "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `merchant.studentverse.app`
   - Click "Activate domain"
   - ✅ Wait ~5 minutes for SSL certificate

6. **Verify Deployment**
   - Go to: `https://merchant.studentverse.app`
   - ✅ Should see the merchant validator app

---

### STEP 5: Test Everything (10 minutes)

1. **Test QR Scanner**
   - Open `https://merchant.studentverse.app` on your phone
   - Click "Start Scanner"
   - Grant camera permissions
   - ✅ Camera should activate

2. **Test Manual Entry**
   - Enter a valid entitlement ID
   - Click "Submit"
   - ✅ Should show offer details

3. **Test PIN Validation**
   - Enter the PIN you created (e.g., 1234)
   - Click "Verify PIN"
   - ✅ Should proceed to amount entry

4. **Test Amount Calculation**
   - Enter amount: 100
   - ✅ Should calculate discount correctly

5. **Test Confirmation**
   - Click "Confirm Redemption"
   - ✅ Should show success screen

6. **Verify in Database**
   ```sql
   SELECT * FROM redemptions ORDER BY redeemed_at DESC LIMIT 1;
   ```
   - ✅ Should see your test redemption

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Database tables created (merchant_pins, redemptions updated)
- [ ] Backend deployed successfully
- [ ] API endpoint `/entitlements/confirm` exists
- [ ] Test merchant PIN created
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Custom domain working (merchant.studentverse.app)
- [ ] QR scanner works on mobile
- [ ] PIN validation works
- [ ] Amount calculation correct
- [ ] Redemption creates database record
- [ ] Entitlement marked as used

---

## 🐛 Troubleshooting

### Backend Issues

**"bcrypt not found"**
```bash
pip install bcrypt==4.1.2
```

**"CORS error in browser"**
- Check CORS configuration includes `merchant.studentverse.app`
- Redeploy backend

**"PIN validation fails"**
- Verify PIN was created in database
- Check PIN hash format
- Ensure merchant_id matches

### Frontend Issues

**"Camera not working"**
- Ensure using HTTPS (not HTTP)
- Check browser permissions
- Try Chrome browser

**"API calls failing"**
- Verify API_BASE_URL in app.js
- Check backend is running
- Check CORS configuration

**"QR scanner not detecting"**
- Ensure good lighting
- Hold steady for 2 seconds
- Try manual entry instead

---

## 📞 Need Help?

### Quick Reference
See `QUICK_REFERENCE.md` for common commands and queries.

### Full Documentation
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **API Details**: See `BACKEND_ADDITIONS.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`

### Contact
- **Technical Issues**: dev@studentverse.app
- **Questions**: Open an issue on GitHub

---

## 🎉 You're Done!

If all checkboxes are ✅, you're ready to:

1. **Generate PINs** for all merchants
2. **Train merchants** on using the app
3. **Monitor usage** for the first week
4. **Collect feedback** and iterate

---

## 📚 Next Steps

After successful deployment:

1. **Create Merchant PINs**
   - Use `scripts/generate_pin.py` for each merchant
   - Distribute PINs securely

2. **Create User Guide**
   - Document for merchants
   - Video tutorial
   - FAQ

3. **Monitor**
   - Check Railway logs
   - Check Cloudflare Analytics
   - Monitor database growth

4. **Iterate**
   - Collect merchant feedback
   - Fix any issues
   - Add requested features

---

**Estimated Total Time**: 30 minutes  
**Difficulty**: Easy  
**Status**: Ready to deploy! 🚀

---

Last updated: 2026-02-15
