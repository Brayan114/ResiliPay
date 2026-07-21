# ResiliPay B2B SDK & Prototype

**ResiliPay** is an offline-first, cryptographic payment protocol designed for resilient transactions in Nigerian communities experiencing unstable electricity or network connectivity. 

This repository contains:
1. **The ResiliPay B2B SDK (`resilipay-sdk.js`)**: A reusable JavaScript library for commercial banking apps to integrate offline transactions.
2. **Interactive Simulator (`index.html`)**: A double-device browser simulator demonstrating real-time offline payment, QR code scanning, and USSD/SMS fallback mechanisms.

---

## 🚀 Key Features

- **Offline-First Cryptography**: Leverages standard asymmetric keys (ECDSA P-256) on-device to authorize payments with zero network connection.
- **Micro-Payload Formats**: Compact signature packets designed to be easily serialized into high-density QR Codes or ultra-short USSD/SMS strings (<300 bytes).
- **Double-Spend Prevention**: Sequential account nonces and merchant-side offline replay detection queues.
- **PWA Installation**: Installs as a standalone Progressive Web App on mobile devices, loading and executing 100% offline.

---

## 📦 SDK Installation & Usage

The SDK is written in the UMD (Universal Module Definition) format, meaning it can be imported via standard script tags, CommonJS, or ES6 modules.

### 1. Include the SDK
```html
<script src="resilipay-sdk.js"></script>
```

### 2. Generate Wallet Keys (Customer & Merchant onboarding)
Generate an ECDSA P-256 key pair securely on the user's phone.
```javascript
const wallet = await ResiliPaySDK.generateWalletKeys();
console.log("Public Key Base64:", wallet.publicKeyBase64);
// Store private key securely in local secure enclave / encrypted storage
```

### 3. Create & Sign a Payment Voucher (Customer Offline)
Create a cryptographically signed voucher containing the transaction details.
```javascript
const transaction = await ResiliPaySDK.createVoucher({
    sender: "+2348031112222",
    receiver: "+2347035453003",
    amount: 15000, // NGN
    nonce: 1,      // Sequential transaction count
    privateKey: wallet.privateKey,
    senderPubKeyBase64: wallet.publicKeyBase64
});

console.log("Voucher String (QR Payload):", transaction.voucherString);
console.log("USSD Fallback Command:", transaction.ussdCode); // *901*16*15000*CHECKSUM#
```

### 4. Verify Payment Offline (Merchant POS Offline)
Verify the signature authenticity using the customer's public key (already contained inside the voucher payload).
```javascript
try {
    const verification = await ResiliPaySDK.verifyVoucher(scannedVoucherString);
    if (verification.isValid) {
        console.log("Payment Verified! Amount:", verification.payload.amount);
        // Add to local offline history, notify merchant, and queue for online sync.
    }
} catch (error) {
    console.error("Verification failed / voucher tampered:", error.message);
}
```

---

## 💻 Running the Simulator Locally

To test the multi-device phone simulator:

1. **Start the local server**:
   If Python is installed:
   ```bash
   python -m http.server 8080
   ```

2. **Access the simulator**:
   - On your computer: Open `http://localhost:8080`
   - On physical mobile devices (connect to same Wi-Fi):
     Open `http://[YOUR_IP_ADDRESS]:8080` (The dashboard log console prints your specific local network IP address on startup).
