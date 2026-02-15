/**
 * StudentVerse Merchant Validator
 * Main application logic
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://svapp-backend-production.up.railway.app', // Update with your backend URL
    ENDPOINTS: {
        VALIDATE: '/entitlements/validate',
        CONFIRM: '/entitlements/confirm'
    },
    QR_SCAN_INTERVAL: 100, // ms
    CANVAS_SIZE: 400
};

// Application State
const state = {
    currentSection: 'scanner',
    entitlementData: null,
    validationData: null,
    stream: null,
    scanning: false
};

// DOM Elements
const elements = {
    // Sections
    scannerSection: document.getElementById('scanner-section'),
    pinSection: document.getElementById('pin-section'),
    amountSection: document.getElementById('amount-section'),
    successSection: document.getElementById('success-section'),
    
    // Scanner
    qrVideo: document.getElementById('qr-video'),
    startScanBtn: document.getElementById('start-scan-btn'),
    manualCode: document.getElementById('manual-code'),
    manualSubmitBtn: document.getElementById('manual-submit-btn'),
    
    // PIN
    offerPreview: document.getElementById('offer-preview'),
    pinInput: document.getElementById('pin-input'),
    togglePinBtn: document.getElementById('toggle-pin-visibility'),
    verifyPinBtn: document.getElementById('verify-pin-btn'),
    cancelPinBtn: document.getElementById('cancel-pin-btn'),
    
    // Amount
    discountInfo: document.getElementById('discount-info'),
    totalAmount: document.getElementById('total-amount'),
    calculationPreview: document.getElementById('calculation-preview'),
    confirmRedemptionBtn: document.getElementById('confirm-redemption-btn'),
    cancelAmountBtn: document.getElementById('cancel-amount-btn'),
    
    // Success
    successDetails: document.getElementById('success-details'),
    newScanBtn: document.getElementById('new-scan-btn'),
    
    // UI
    errorToast: document.getElementById('error-toast'),
    errorMessage: document.getElementById('error-message'),
    closeError: document.getElementById('close-error'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// Utility Functions
const utils = {
    showLoading() {
        elements.loadingOverlay.classList.add('show');
    },
    
    hideLoading() {
        elements.loadingOverlay.classList.remove('show');
    },
    
    showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorToast.classList.add('show');
        setTimeout(() => {
            elements.errorToast.classList.remove('show');
        }, 5000);
    },
    
    hideError() {
        elements.errorToast.classList.remove('show');
    },
    
    formatCurrency(amount) {
        return `AED ${parseFloat(amount).toFixed(2)}`;
    },
    
    async apiCall(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || data.error || 'Request failed');
        }
        
        return data;
    }
};

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionName;
    }
}

// QR Scanner Functions
async function startCamera() {
    try {
        state.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        
        elements.qrVideo.srcObject = state.stream;
        elements.qrVideo.play();
        
        elements.startScanBtn.textContent = 'Scanning...';
        elements.startScanBtn.disabled = true;
        
        state.scanning = true;
        scanQRCode();
    } catch (error) {
        utils.showError('Camera access denied. Please enable camera permissions.');
        console.error('Camera error:', error);
    }
}

function stopCamera() {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
    state.scanning = false;
    elements.startScanBtn.textContent = 'Start Scanner';
    elements.startScanBtn.disabled = false;
}

function scanQRCode() {
    if (!state.scanning) return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = CONFIG.CANVAS_SIZE;
    canvas.height = CONFIG.CANVAS_SIZE;
    
    context.drawImage(elements.qrVideo, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
        stopCamera();
        handleQRCodeDetected(code.data);
    } else {
        setTimeout(scanQRCode, CONFIG.QR_SCAN_INTERVAL);
    }
}

async function handleQRCodeDetected(qrData) {
    try {
        // Extract entitlement ID from QR data
        // Assuming QR contains JSON or just the ID
        let entitlementId;
        try {
            const parsed = JSON.parse(qrData);
            entitlementId = parsed.entitlement_id || parsed.id;
        } catch {
            entitlementId = qrData;
        }
        
        await validateEntitlement(entitlementId);
    } catch (error) {
        utils.showError(error.message);
        resetToScanner();
    }
}

// API Functions
async function validateEntitlement(entitlementId) {
    utils.showLoading();
    
    try {
        const data = await utils.apiCall(
            `${CONFIG.ENDPOINTS.VALIDATE}?entitlement_id=${entitlementId}`,
            'POST'
        );
        
        state.validationData = data;
        state.entitlementData = { id: entitlementId };
        
        displayOfferPreview(data);
        showSection('pin');
    } catch (error) {
        utils.showError(error.message);
        resetToScanner();
    } finally {
        utils.hideLoading();
    }
}

async function confirmRedemption(pin, totalAmount) {
    utils.showLoading();
    
    try {
        const discountPercentage = state.validationData.offer.discount_percentage;
        const discountAmount = (totalAmount * discountPercentage / 100).toFixed(2);
        
        const data = await utils.apiCall(
            CONFIG.ENDPOINTS.CONFIRM,
            'POST',
            {
                entitlement_id: state.entitlementData.id,
                merchant_pin: pin,
                total_amount: parseFloat(totalAmount),
                discount_amount: parseFloat(discountAmount)
            }
        );
        
        displaySuccessDetails(data);
        showSection('success');
    } catch (error) {
        utils.showError(error.message);
    } finally {
        utils.hideLoading();
    }
}

// Display Functions
function displayOfferPreview(data) {
    const { offer, merchant } = data;
    
    elements.offerPreview.innerHTML = `
        <h3>${offer.title}</h3>
        <p><strong>Merchant:</strong> ${merchant.name}</p>
        <p><strong>Discount:</strong> ${offer.discount_percentage}% off</p>
        <p><strong>Valid until:</strong> ${new Date(offer.valid_until).toLocaleDateString()}</p>
    `;
}

function displayDiscountInfo() {
    const discountPercentage = state.validationData.offer.discount_percentage;
    
    elements.discountInfo.innerHTML = `
        <h3>${discountPercentage}% OFF</h3>
        <p>${state.validationData.offer.title}</p>
    `;
}

function updateCalculationPreview() {
    const total = parseFloat(elements.totalAmount.value) || 0;
    const discountPercentage = state.validationData.offer.discount_percentage;
    const discount = (total * discountPercentage / 100);
    const final = total - discount;
    
    elements.calculationPreview.innerHTML = `
        <div class="calc-row">
            <span>Total Amount:</span>
            <span>${utils.formatCurrency(total)}</span>
        </div>
        <div class="calc-row">
            <span>Discount (${discountPercentage}%):</span>
            <span class="discount">-${utils.formatCurrency(discount)}</span>
        </div>
        <div class="calc-row total">
            <span>Final Amount:</span>
            <span>${utils.formatCurrency(final)}</span>
        </div>
    `;
}

function displaySuccessDetails(data) {
    const { details } = data;
    
    elements.successDetails.innerHTML = `
        <div class="detail-row">
            <span>Total Amount:</span>
            <strong>${utils.formatCurrency(details.total_amount)}</strong>
        </div>
        <div class="detail-row">
            <span>Discount:</span>
            <strong style="color: var(--secondary-color)">-${utils.formatCurrency(details.discount_amount)}</strong>
        </div>
        <div class="detail-row">
            <span>Final Amount:</span>
            <strong>${utils.formatCurrency(details.final_amount)}</strong>
        </div>
        ${details.commission_amount ? `
        <div class="detail-row">
            <span>Your Commission:</span>
            <strong>${utils.formatCurrency(details.commission_amount)}</strong>
        </div>
        ` : ''}
        <div class="detail-row">
            <span>Redemption ID:</span>
            <strong style="font-size: 0.875rem">${data.redemption_id}</strong>
        </div>
    `;
}

// Reset Functions
function resetToScanner() {
    state.entitlementData = null;
    state.validationData = null;
    elements.pinInput.value = '';
    elements.totalAmount.value = '';
    elements.manualCode.value = '';
    showSection('scanner');
}

// Event Listeners
elements.startScanBtn.addEventListener('click', startCamera);

elements.manualSubmitBtn.addEventListener('click', async () => {
    const code = elements.manualCode.value.trim();
    if (!code) {
        utils.showError('Please enter an entitlement code');
        return;
    }
    await validateEntitlement(code);
});

elements.togglePinBtn.addEventListener('click', () => {
    const type = elements.pinInput.type === 'password' ? 'text' : 'password';
    elements.pinInput.type = type;
    elements.togglePinBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

elements.verifyPinBtn.addEventListener('click', () => {
    const pin = elements.pinInput.value.trim();
    
    if (!pin || pin.length < 4 || pin.length > 6) {
        utils.showError('Please enter a valid 4-6 digit PIN');
        return;
    }
    
    if (!/^\d+$/.test(pin)) {
        utils.showError('PIN must contain only numbers');
        return;
    }
    
    displayDiscountInfo();
    showSection('amount');
});

elements.cancelPinBtn.addEventListener('click', resetToScanner);

elements.totalAmount.addEventListener('input', updateCalculationPreview);

elements.confirmRedemptionBtn.addEventListener('click', async () => {
    const total = parseFloat(elements.totalAmount.value);
    const pin = elements.pinInput.value.trim();
    
    if (!total || total <= 0) {
        utils.showError('Please enter a valid amount');
        return;
    }
    
    await confirmRedemption(pin, total);
});

elements.cancelAmountBtn.addEventListener('click', () => {
    showSection('pin');
});

elements.newScanBtn.addEventListener('click', resetToScanner);

elements.closeError.addEventListener('click', utils.hideError);

// Initialize
console.log('StudentVerse Merchant Validator loaded');
