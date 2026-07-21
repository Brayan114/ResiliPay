/**
 * ResiliPay B2B SDK (Software Development Kit)
 * A secure, offline-first cryptographic payment protocol for mobile banking applications.
 * Supports ECDSA P-256 signatures, offline transaction validation, and compact SMS/USSD serialization.
 * 
 * Target environments: Browser (Global/AMD), Node.js (CommonJS/ESM)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ResiliPaySDK = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    class ResiliPaySDK {
        /**
         * Generates a new ECDSA P-256 Key Pair for a user wallet.
         * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey, publicKeyJWK: Object, publicKeyBase64: string}>}
         */
        static async generateWalletKeys() {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'ECDSA',
                    namedCurve: 'P-256'
                },
                true, // extractable
                ['sign', 'verify']
            );

            const jwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
            const base64 = btoa(JSON.stringify(jwk));

            return {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
                publicKeyJWK: jwk,
                publicKeyBase64: base64
            };
        }

        /**
         * Creates and signs an offline payment voucher (digital check).
         * @param {Object} params
         * @param {string} params.sender - Sender's phone number or account ID.
         * @param {string} params.receiver - Receiver's phone number or merchant ID.
         * @param {number} params.amount - Transaction amount.
         * @param {number} params.nonce - Sequential account nonce.
         * @param {CryptoKey} params.privateKey - Sender's private CryptoKey.
         * @param {string} params.senderPubKeyBase64 - Base64 encoded JWK of sender's public key.
         * @returns {Promise<{voucherString: string, payload: Object, signature: string, ussdCode: string}>}
         */
        static async createVoucher({ sender, receiver, amount, nonce, privateKey, senderPubKeyBase64 }) {
            if (!sender || !receiver || !amount || !nonce || !privateKey || !senderPubKeyBase64) {
                throw new Error("Missing required parameters for voucher creation.");
            }

            const payload = {
                sender,
                receiver,
                amount: parseInt(amount),
                nonce: parseInt(nonce),
                timestamp: Date.now(),
                senderPubKey: senderPubKeyBase64
            };

            const payloadText = JSON.stringify(payload);
            const encoder = new TextEncoder();
            const data = encoder.encode(payloadText);

            const signatureBuffer = await window.crypto.subtle.sign(
                {
                    name: 'ECDSA',
                    hash: { name: 'SHA-256' }
                },
                privateKey,
                data
            );

            const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

            const envelope = {
                payload,
                signature
            };

            const voucherString = btoa(JSON.stringify(envelope));
            const ussdCode = `*901*16*${amount}*${signature.substring(0, 6).toUpperCase()}#`;

            return {
                voucherString,
                payload,
                signature,
                ussdCode
            };
        }

        /**
         * Verifies a cryptographic voucher offline.
         * @param {string} voucherString - The base64 encoded envelope.
         * @returns {Promise<{isValid: boolean, payload: Object, signature: string}>}
         */
        static async verifyVoucher(voucherString) {
            if (!voucherString) {
                throw new Error("Voucher string is required.");
            }

            const envelope = JSON.parse(atob(voucherString));
            const payload = envelope.payload;
            const signature = envelope.signature;

            const payloadText = JSON.stringify(payload);
            
            // Import the sender's public key from base64 JWK
            const jwk = JSON.parse(atob(payload.senderPubKey));
            const publicKey = await window.crypto.subtle.importKey(
                'jwk',
                jwk,
                {
                    name: 'ECDSA',
                    namedCurve: 'P-256'
                },
                true,
                ['verify']
            );

            const encoder = new TextEncoder();
            const data = encoder.encode(payloadText);
            const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

            const isValid = await window.crypto.subtle.verify(
                {
                    name: 'ECDSA',
                    hash: { name: 'SHA-256' }
                },
                publicKey,
                signatureBytes,
                data
            );

            return {
                isValid,
                payload,
                signature
            };
        }

        /**
         * Helper to verify a simulated USSD offline input.
         * @param {string} ussdString - Dial string e.g. *901*16*Amount*Signature#
         * @param {string} referenceVoucherString - The voucher string for verification.
         * @returns {Promise<{isValid: boolean, payload: Object}>}
         */
        static async verifyUSSDCommand(ussdString, referenceVoucherString) {
            const matches = ussdString.match(/\*901\*16\*(\d+)\*([A-Za-z0-9]{6})#/);
            if (!matches) {
                throw new Error("Invalid USSD structure format.");
            }

            const amount = parseInt(matches[1]);
            const sigPart = matches[2];

            const result = await this.verifyVoucher(referenceVoucherString);
            if (!result.isValid) {
                return { isValid: false, payload: null };
            }

            const isAmountMatch = result.payload.amount === amount;
            const isSigMatch = result.signature.substring(0, 6).toUpperCase() === sigPart;

            return {
                isValid: isAmountMatch && isSigMatch,
                payload: result.payload
            };
        }
    }

    return ResiliPaySDK;
}));
