# StudentVerse Merchant Validator

A simple, mobile-first web application for merchants to validate and confirm StudentVerse entitlement redemptions.

## Features

- 📱 **QR Code Scanner**: Scan student QR codes using device camera
- 🔐 **PIN Validation**: Secure merchant authentication
- 💰 **Amount Calculation**: Automatic discount calculation
- ✅ **Confirmation Flow**: Simple 4-step redemption process
- 🎨 **Mobile-First Design**: Optimized for tablets and phones

## Tech Stack

- **HTML5**: Semantic structure
- **CSS3**: Custom properties, mobile-first responsive design
- **Vanilla JavaScript**: No frameworks, lightweight and fast
- **jsQR**: QR code scanning library

## Project Structure

```
frontend/
├── index.html          # Main HTML structure
├── styles.css          # All styles (mobile-first)
├── app.js              # Application logic
├── wrangler.toml       # Cloudflare Pages config
└── README.md           # This file
```

## Local Development

1. **Serve locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open in browser**:
   ```
   http://localhost:8000
   ```

3. **Test on mobile**:
   - Find your local IP address
   - Access from mobile device on same network
   - Grant camera permissions when prompted

## Configuration

Update the API endpoint in `app.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-backend-url.com',
    // ...
};
```

## Deployment to Cloudflare Pages

### Option 1: Git Integration (Recommended)

1. **Create GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/studentversedubai-rgb/sv-merchant-validator.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your GitHub account
   - Select `sv-merchant-validator` repository
   - Configure build settings:
     - **Build command**: (leave empty)
     - **Build output directory**: `/`
   - Click "Save and Deploy"

3. **Configure custom domain**:
   - Go to project settings
   - Click "Custom domains"
   - Add `merchant.studentverse.app`
   - Update DNS records as instructed

### Option 2: Direct Upload

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy**:
   ```bash
   wrangler pages publish . --project-name=sv-merchant-validator
   ```

## Usage Flow

### 1. Scan QR Code
- Merchant opens app
- Clicks "Start Scanner"
- Points camera at student's QR code
- Or enters code manually

### 2. Enter PIN
- System validates entitlement
- Shows offer details
- Merchant enters their PIN
- PIN is verified server-side

### 3. Enter Amount
- Merchant enters total bill amount
- System calculates discount automatically
- Shows final amount

### 4. Confirm
- Merchant confirms redemption
- System records transaction
- Shows success message with details

## Security Features

- ✅ HTTPS only
- ✅ PIN hashing with bcrypt
- ✅ Rate limiting on failed attempts
- ✅ Server-side validation
- ✅ No sensitive data in frontend
- ✅ Secure headers (CSP, X-Frame-Options, etc.)

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS 11+)
- ✅ Firefox
- ⚠️ Requires HTTPS for camera access

## Troubleshooting

### Camera not working
- Ensure HTTPS is enabled
- Check browser permissions
- Try different browser
- Verify camera is not in use by another app

### QR code not scanning
- Ensure good lighting
- Hold steady
- Try manual entry as fallback

### API errors
- Verify backend URL in config
- Check CORS settings on backend
- Ensure backend is running
- Check network connectivity

## Environment Variables

None required for frontend. All configuration is in `app.js`.

## Performance

- **First Load**: < 1s
- **QR Scan Rate**: 10 scans/second
- **Bundle Size**: < 50KB total
- **No build step**: Instant deployments

## Support

For issues or questions:
- Email: support@studentverse.app
- GitHub Issues: [Create an issue](https://github.com/studentversedubai-rgb/sv-merchant-validator/issues)

## License

Proprietary - StudentVerse © 2026
