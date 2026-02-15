"""
Test script for merchant PIN validation
Tests the complete flow from validation to confirmation
"""

import requests
import json
from typing import Dict, Any

# Configuration
API_BASE_URL = "https://svapp-backend-production.up.railway.app"  # Update with your URL
TEST_MERCHANT_PIN = "1234"  # Update with test PIN
TEST_ENTITLEMENT_ID = "test-uuid"  # Update with valid entitlement ID

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def test_validate_entitlement(entitlement_id: str) -> Dict[str, Any]:
    """Test entitlement validation endpoint"""
    print_info(f"Testing entitlement validation for ID: {entitlement_id}")
    
    url = f"{API_BASE_URL}/entitlements/validate"
    params = {"entitlement_id": entitlement_id}
    
    try:
        response = requests.post(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Entitlement validation successful")
            print(f"  Offer: {data.get('offer', {}).get('title', 'N/A')}")
            print(f"  Discount: {data.get('offer', {}).get('discount_percentage', 'N/A')}%")
            return data
        else:
            print_error(f"Validation failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_confirm_redemption(
    entitlement_id: str,
    merchant_pin: str,
    total_amount: float = 100.00
) -> Dict[str, Any]:
    """Test redemption confirmation endpoint"""
    print_info(f"Testing redemption confirmation")
    
    url = f"{API_BASE_URL}/entitlements/confirm"
    
    # Calculate discount (assuming 20% for test)
    discount_amount = total_amount * 0.20
    
    payload = {
        "entitlement_id": entitlement_id,
        "merchant_pin": merchant_pin,
        "total_amount": total_amount,
        "discount_amount": discount_amount
    }
    
    print(f"  Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Redemption confirmation successful")
            print(f"  Redemption ID: {data.get('redemption_id', 'N/A')}")
            print(f"  Final Amount: AED {data.get('details', {}).get('final_amount', 'N/A')}")
            return data
        else:
            print_error(f"Confirmation failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_invalid_pin(entitlement_id: str):
    """Test with invalid PIN (should fail)"""
    print_info("Testing invalid PIN (should fail)")
    
    url = f"{API_BASE_URL}/entitlements/confirm"
    payload = {
        "entitlement_id": entitlement_id,
        "merchant_pin": "9999",  # Invalid PIN
        "total_amount": 100.00,
        "discount_amount": 20.00
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 401:
            print_success("Invalid PIN correctly rejected")
        else:
            print_warning(f"Unexpected status code: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print_error(f"Request failed: {str(e)}")

def test_rate_limiting(entitlement_id: str):
    """Test rate limiting on failed PIN attempts"""
    print_info("Testing rate limiting (3 failed attempts)")
    
    url = f"{API_BASE_URL}/entitlements/confirm"
    
    for i in range(4):  # Try 4 times to trigger rate limit
        payload = {
            "entitlement_id": entitlement_id,
            "merchant_pin": "0000",  # Invalid PIN
            "total_amount": 100.00,
            "discount_amount": 20.00
        }
        
        response = requests.post(url, json=payload)
        print(f"  Attempt {i+1}: {response.status_code} - {response.json().get('detail', 'N/A')}")
        
        if i == 3 and "locked" in response.text.lower():
            print_success("Rate limiting working correctly")
            return
    
    print_warning("Rate limiting may not be working as expected")

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("MERCHANT VALIDATION API TESTS")
    print("="*60 + "\n")
    
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Test Entitlement ID: {TEST_ENTITLEMENT_ID}\n")
    
    # Test 1: Validate entitlement
    print("\n--- Test 1: Validate Entitlement ---")
    validation_data = test_validate_entitlement(TEST_ENTITLEMENT_ID)
    
    if not validation_data:
        print_error("Validation failed, skipping remaining tests")
        return
    
    # Test 2: Confirm with valid PIN
    print("\n--- Test 2: Confirm with Valid PIN ---")
    confirmation_data = test_confirm_redemption(
        TEST_ENTITLEMENT_ID,
        TEST_MERCHANT_PIN,
        100.00
    )
    
    # Test 3: Invalid PIN
    print("\n--- Test 3: Invalid PIN ---")
    test_invalid_pin(TEST_ENTITLEMENT_ID)
    
    # Test 4: Rate limiting
    print("\n--- Test 4: Rate Limiting ---")
    test_rate_limiting(TEST_ENTITLEMENT_ID)
    
    print("\n" + "="*60)
    print("TESTS COMPLETED")
    print("="*60 + "\n")

if __name__ == "__main__":
    print_warning("Make sure to update the configuration variables before running!")
    print(f"  - API_BASE_URL: {API_BASE_URL}")
    print(f"  - TEST_ENTITLEMENT_ID: {TEST_ENTITLEMENT_ID}")
    print(f"  - TEST_MERCHANT_PIN: {TEST_MERCHANT_PIN}\n")
    
    input("Press Enter to continue or Ctrl+C to cancel...")
    
    run_all_tests()
