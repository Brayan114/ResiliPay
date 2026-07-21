# Pitch Deck Outline - ResiliPay

Use this structural outline and speaker notes to prepare your slides and practice your pitch. Keep the pitch punchy, visual, and focused on the **B2B SDK Model**.

---

## Slide 1: The Title & Hook
* **Slide Content:**
  * **Title:** ResiliPay
  * **Subtitle:** The Offline Cryptographic Payment Protocol for Unstable Networks
  * **Tagline:** Empowering banks to transact when the internet dies.
  * **Visuals:** Minimalist dark design featuring the ResiliPay shield logo.
* **Speaker Notes:**
  > *"Good evening judges. We've all been there: you stand at a market stall or local grocery store in Port Harcourt, you make a mobile transfer, but the network fails, or the POS has no signal. You're stuck. Today, we present ResiliPay—a secure offline-first payment protocol that solves this problem for millions of Nigerians."*

---

## Slide 2: The Problem (The Downtime Tax)
* **Slide Content:**
  * **Headline:** The Real Cost of Unstable Networks
  * **Stats / Bullet Points:**
    * **Failed Transactions:** Mobile transfers fail up to 15% of the time due to cellular outages or bank server downtime.
    * **Financial Exclusion:** Over 35 million rural and riverine Nigerians lack reliable 3G/4G coverage, keeping them cash-dependent.
    * **Merchant Friction:** Small merchants lose sales and take on immense trust-based risk when networks drop.
  * **Visuals:** Map of Nigeria highlighting remote/riverine communities and a red warning "POS Connection Failed".
* **Speaker Notes:**
  > *"Network failure is a silent tax on the Nigerian economy. It hurts small businesses, isolates rural communities, and limits financial inclusion. If there is no internet coverage, digital banking ceases to exist. How can we make payments resilient to infrastructure limits?"*

---

## Slide 3: The Solution (ResiliPay)
* **Slide Content:**
  * **Headline:** Payments, Anytime, Anywhere.
  * **Key Features:**
    * **100% Offline-First:** Transact securely with zero internet or cellular connectivity.
    * **Progressive Web App (PWA):** Installs directly onto devices, loading and executing fully offline.
    * **Cryptographic Trust:** Utilizes device-native asymmetric keys instead of remote servers.
  * **Visuals:** Smartphone frames showing the customer generating a QR code and the merchant scanning it successfully with an offline badge.
* **Speaker Notes:**
  > *"ResiliPay is an offline-first payment gateway. Using browser-native secure enclaves, customers can cryptographically sign digital payments on their phones, and merchants can verify these signatures instantly without checking a central database. It turns smartphones into digital checkbooks."*

---

## Slide 4: Under the Hood (How Offline Security Works)
* **Slide Content:**
  * **Headline:** Trust Without Servers (Asymmetric Cryptography)
  * **Workflow Steps:**
    1. **Key Generation:** Each wallet generates an ECDSA key pair (Public/Private Key) stored locally on-device.
    2. **On-Device Signing:** The sender enters a PIN and signs the transaction details using their private key.
    3. **Compact QR / USSD Envelope:** The signature is encoded into a visual QR code or short text code.
    4. **Offline Verification:** The merchant's device uses the sender's public key to verify authenticity offline.
    5. **Queue & Settlement:** Vouchers are queued and automatically batch-settled when either party hits network coverage.
* **Speaker Notes:**
  > *"How can we trust a transaction offline? We use asymmetric cryptography. The customer's device signs a 'digital promise check' using their private key. The merchant scans it and validates the mathematical signature using the customer's public key. Since the private key cannot be forged, the merchant is guaranteed the customer authorized the payment. We also track sequentially incremented nonces to prevent double-spending."*

---

## Slide 5: The Business Model (B2B SDK Protocol)
* **Slide Content:**
  * **Headline:** Empowering Banks, Not Competing
  * **B2B Strategy:**
    * **Drop-in SDK:** Commercial banks (Zenith, Moniepoint, OPay, etc.) integrate ResiliPay directly into their existing apps.
    * **SaaS Pricing:** Standard license fee per active user or a micro-fee per offline settlement.
    * **Regulatory Compliance:** Fits seamlessly into existing clearing house systems (NIBSS) and CBDC (eNaira) frameworks.
  * **Visuals:** Logo grid of top Nigerian banks connected to the ResiliPay SDK hub.
* **Speaker Notes:**
  > *"We are not launching a new bank. That requires massive capital and license approvals. Instead, we operate a B2B SaaS model. We license our cryptographic protocol as an SDK to existing banks. They integrate it into their own apps. When network coverage is restored, the transactions are processed through NIBSS. This minimizes regulatory friction and scales our distribution overnight."*

---

## Slide 6: The Demo & Impact
* **Slide Content:**
  * **Headline:** Practical. Scalable. Resilient.
  * **Impact Metrics:**
    * **Low Cost:** Zero hardware requirements (works on any basic smartphone camera).
    * **Low Bandwidth:** Transaction payloads under 300 bytes (easily fits in SMS or USSD commands).
    * **Inclusion:** Bridges the gap between urban centers and riverine/rural communities.
* **Speaker Notes:**
  > *"Our prototype is fully functional and ready to test. We can simulate complete cell signal blackouts, sign transactions, scan them using the merchant camera, verify the signatures offline, and watch the central bank database consolidate balances when reconnected. ResiliPay makes Nigerian payments resilient, secure, and truly inclusive. Thank you."*
