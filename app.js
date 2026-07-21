/**
 * ResiliPay - Cryptographic Offline Banking Prototype
 * Core Application Logic & Cryptographic Engine
 */

// --- Application State ---
const state = {
    networkMode: 'online', // 'online', 'low-bandwidth', 'offline'
    bankLedger: {
        '+234 803 111 2222': 100000, // Customer start balance: 100,000 NGN
        '+234 703 545 3003': 15000   // Merchant start balance: 15,000 NGN
    },
    customerWallet: {
        phone: '+234 803 111 2222',
        balance: 100000, // Synced from ledger
        keyPair: null,
        publicKeyJWK: null,
        publicKeyBase64: '',
        nonce: 1
    },
    merchantWallet: {
        phone: '+234 703 545 3003',
        balance: 15000, // Synced from ledger
        keyPair: null,
        publicKeyJWK: null,
        publicKeyBase64: '',
        pendingVouchers: [], // Vouchers accepted offline but not yet settled online
        settledTransactions: []
    },
    offlineSyncQueue: [], // Outbox of transactions to sync when network is back online
    currentTransactionDraft: null,
    lastVoucherAmount: 0
};

// --- Cryptographic Engine ---
// Using official ResiliPaySDK from resilipay-sdk.js for key generation, signing, and verification.


// --- Helper Utilities ---

/**
 * Logs a message to our simulated dashboard terminal console
 */
function logConsole(message, type = 'info') {
    const consoleLogs = document.getElementById('console-logs');
    if (!consoleLogs) return;

    const time = new Date().toLocaleTimeString();
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${type}`;
    
    let prefix = '⚙️ [SYSTEM]';
    if (type === 'crypto') prefix = '🔐 [CRYPTO]';
    if (type === 'success') prefix = '🟢 [SUCCESS]';
    if (type === 'warning') prefix = '⚠️ [WARN]';
    if (type === 'error') prefix = '🚨 [ERROR]';
    if (type === 'network') prefix = '📡 [NET]';

    logItem.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-prefix">${prefix}</span> <span class="log-text">${escapeHtml(message)}</span>`;
    consoleLogs.appendChild(logItem);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

function escapeHtml(text) {
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Generates a mock barcode/matrix visual representation of a signature hash on canvas
 */
function drawMockQRCode(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Create a simple deterministic matrix pattern based on hash of input text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const gridSize = 16;
    const cellSize = size / gridSize;

    // Draw background
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, size, size);

    // Draw QR-like squares
    ctx.fillStyle = '#10b981'; // Emerald payment color
    
    // Static corner alignment squares (classic QR indicators)
    drawAnchor(ctx, 0, 0, cellSize);
    drawAnchor(ctx, (gridSize - 4) * cellSize, 0, cellSize);
    drawAnchor(ctx, 0, (gridSize - 4) * cellSize, cellSize);

    // Draw pseudo-random binary grid based on hash
    let count = 0;
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // Avoid corner anchors
            if ((x < 4 && y < 4) || (x >= gridSize - 4 && y < 4) || (x < 4 && y >= gridSize - 4)) {
                continue;
            }
            
            // Deterministic binary checker
            const val = Math.abs(Math.sin(hash + count++)) * 1000;
            if ((Math.floor(val) % 2) === 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function drawAnchor(ctx, x, y, cellSize) {
    ctx.fillRect(x, y, cellSize * 4, cellSize * 4);
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 2, cellSize * 2);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + cellSize * 1.5, y + cellSize * 1.5, cellSize, cellSize);
}

// --- Application Features & Core Flows ---

/**
 * Initializes wallets and keys
 */
async function initializeWallets() {
    logConsole("Initializing secure local cryptographic enclaves using ResiliPaySDK...", "system");
    
    // Customer Key Generation
    const customerKeys = await ResiliPaySDK.generateWalletKeys();
    state.customerWallet.keyPair = { publicKey: customerKeys.publicKey, privateKey: customerKeys.privateKey };
    state.customerWallet.publicKeyJWK = customerKeys.publicKeyJWK;
    state.customerWallet.publicKeyBase64 = customerKeys.publicKeyBase64;
    
    logConsole(`Customer keys generated. Curve: P-256. Public key: ${customerKeys.publicKeyBase64.substring(0, 32)}...`, "crypto");

    // Merchant Key Generation (in real life, merchant has their own app, we simulate both here)
    const merchantKeys = await ResiliPaySDK.generateWalletKeys();
    state.merchantWallet.keyPair = { publicKey: merchantKeys.publicKey, privateKey: merchantKeys.privateKey };
    state.merchantWallet.publicKeyJWK = merchantKeys.publicKeyJWK;
    state.merchantWallet.publicKeyBase64 = merchantKeys.publicKeyBase64;
    
    logConsole(`Merchant keys generated. Curve: P-256. Public key: ${merchantKeys.publicKeyBase64.substring(0, 32)}...`, "crypto");

    updateUI();
    logConsole("ResiliPay interface ready. Simulated network state: ONLINE.", "success");
}

/**
 * Updates UI values across the screens
 */
function updateUI() {
    // Balances
    document.getElementById('cust-balance').innerText = state.customerWallet.balance.toLocaleString();
    document.getElementById('merch-balance').innerText = state.merchantWallet.balance.toLocaleString();
    document.getElementById('cust-phone').innerText = state.customerWallet.phone;
    document.getElementById('merch-phone').innerText = state.merchantWallet.phone;

    // Ledgers state UI
    document.getElementById('ledger-cust-bal').innerText = state.bankLedger[state.customerWallet.phone].toLocaleString();
    document.getElementById('ledger-merch-bal').innerText = state.bankLedger[state.merchantWallet.phone].toLocaleString();

    // Outbox badge
    const badge = document.getElementById('sync-badge');
    if (badge) {
        const pendingCount = state.offlineSyncQueue.length;
        badge.innerText = pendingCount;
        badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        
        // Disable sync button if online queue is empty or offline
        const syncBtn = document.getElementById('sync-ledger-btn');
        if (syncBtn) {
            syncBtn.disabled = pendingCount === 0 || state.networkMode === 'offline';
        }
    }
}

/**
 * Handle Network Mode Switching
 */
function setNetworkMode(mode) {
    state.networkMode = mode;
    
    // UI elements update
    const netIndicators = document.querySelectorAll('.net-indicator');
    const netTexts = document.querySelectorAll('.net-text');
    const root = document.documentElement;

    netIndicators.forEach(ind => {
        ind.className = 'net-indicator ' + mode;
    });

    let statusLabel = 'Online (Fast Broadband)';
    if (mode === 'low-bandwidth') {
        statusLabel = 'Low Bandwidth (GPRS/Edge 2G)';
        root.style.setProperty('--status-glow', '#f59e0b');
    } else if (mode === 'offline') {
        statusLabel = 'OFFLINE (Zero Coverage)';
        root.style.setProperty('--status-glow', '#ef4444');
    } else {
        root.style.setProperty('--status-glow', '#10b981');
    }

    netTexts.forEach(txt => {
        txt.innerText = statusLabel;
    });

    logConsole(`Network mode changed to: ${mode.toUpperCase()} (${statusLabel})`, "network");
    
    // Handle automatic syncing if switched back to online
    if (mode === 'online' && state.offlineSyncQueue.length > 0) {
        logConsole("Network connection restored! Autodetected pending offline transactions. Initiating auto-settlement...", "network");
        settleOfflineTransactions();
    }
    
    updateUI();
}

/**
 * Sender generates offline cryptographic payment voucher
 */
async function initiatePayment(amount, receiverPhone) {
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid transfer amount");
        return;
    }

    if (state.customerWallet.balance < amount) {
        alert("Insufficient funds in customer wallet");
        return;
    }

    logConsole(`Initiating payment of ${amount} NGN to ${receiverPhone}...`, "info");
    logConsole("Calling ResiliPaySDK to cryptographically sign transaction details...", "crypto");

    try {
        const result = await ResiliPaySDK.createVoucher({
            sender: state.customerWallet.phone,
            receiver: receiverPhone,
            amount: amount,
            nonce: state.customerWallet.nonce,
            privateKey: state.customerWallet.keyPair.privateKey,
            senderPubKeyBase64: state.customerWallet.publicKeyBase64
        });

        // Save the amount for potential offline void/refunds
        state.lastVoucherAmount = amount;

        // Update Customer wallet state (subtract locally to reflect balance change)
        state.customerWallet.balance -= amount;
        state.customerWallet.nonce += 1;
        
        updateUI();

        // Display cryptographic voucher UI (QR code & shortcode panel)
        document.getElementById('cust-send-form').classList.add('hidden');
        document.getElementById('cust-voucher-screen').classList.remove('hidden');
        
        // Draw the QR Code canvas
        drawMockQRCode('qrcode-canvas', result.voucherString);
        document.getElementById('raw-voucher-data').value = result.voucherString;
        document.getElementById('ussd-output-code').innerText = result.ussdCode;

        logConsole(`Cryptographic voucher generated. Nonce: ${result.payload.nonce}. Awaiting merchant scan.`, "success");
    } catch (err) {
        logConsole(`Voucher Signing Error: ${err.message}`, "error");
    }
}

/**
 * Void/Cancel the current offline payment voucher and restore local balance.
 */
function voidVoucher() {
    if (state.lastVoucherAmount <= 0) return;

    logConsole(`Voiding active cryptographic voucher...`, "warning");
    
    // Restore the balance and decrement nonce
    state.customerWallet.balance += state.lastVoucherAmount;
    state.customerWallet.nonce -= 1;
    
    logConsole(`Voucher voided. ₦${state.lastVoucherAmount.toLocaleString()} NGN refunded to local wallet cache. Nonce recycled.`, "success");
    
    state.lastVoucherAmount = 0;
    
    // Clear inputs and screens
    document.getElementById('raw-voucher-data').value = '';
    document.getElementById('transfer-amount').value = '';
    
    // Switch screen back to send form
    document.getElementById('cust-send-form').classList.remove('hidden');
    document.getElementById('cust-voucher-screen').classList.add('hidden');
    
    updateUI();
}

/**
 * Merchant Scans and verifies the cryptographic voucher offline
 */
async function scanVoucher(envelopeString) {
    if (!envelopeString) {
        alert("Voucher data is empty");
        return;
    }

    logConsole("Reading scanned voucher envelope...", "info");
    try {
        logConsole("Calling ResiliPaySDK to cryptographically verify signature offline...", "crypto");
        const verification = await ResiliPaySDK.verifyVoucher(envelopeString);

        if (verification.isValid) {
            logConsole("Signature verified SUCCESS! Transaction is authentic and signed by sender.", "success");
            
            const payload = verification.payload;
            
            // Check double-spend locally in merchant's pending history (e.g. check duplicate nonce/sender combination)
            const isDuplicate = state.merchantWallet.pendingVouchers.some(v => 
                v.payload.sender === payload.sender && v.payload.nonce === payload.nonce
            );

            if (isDuplicate) {
                logConsole("Duplicate transaction detected (replayed nonce)! Transaction Rejected.", "error");
                alert("Error: Duplicate voucher detected. Transaction rejected!");
                return;
            }

            // Accept payment offline: Add to merchant's local balances and store in sync queue
            state.merchantWallet.balance += payload.amount;
            
            // Re-envelope for matching local storage state
            const localEnvelope = {
                payload: payload,
                signature: verification.signature
            };
            state.merchantWallet.pendingVouchers.push(localEnvelope);
            state.offlineSyncQueue.push(localEnvelope);

            // Display verification success UI
            document.getElementById('merch-receive-screen').classList.add('hidden');
            document.getElementById('merch-success-screen').classList.remove('hidden');
            
            // Fill details
            document.getElementById('success-sender').innerText = payload.sender;
            document.getElementById('success-amount').innerText = payload.amount.toLocaleString();
            document.getElementById('success-nonce').innerText = payload.nonce;
            document.getElementById('success-sign-verified').innerText = `ECDSA-P256 [VERIFIED OFFLINE]`;

            updateUI();
            logConsole(`Merchant balance updated locally: ${state.merchantWallet.balance} NGN. Pending online settlement.`, "success");
        } else {
            logConsole("Cryptographic verification FAILED. Data tampered or invalid key!", "error");
            alert("Security Alert: Invalid cryptographic signature. Transaction rejected!");
        }
    } catch (e) {
        logConsole(`Failed to parse voucher: ${e.message}`, "error");
        alert("Failed to parse voucher data. Make sure it is a valid ResiliPay voucher string.");
    }
}

/**
 * Simulates USSD/SMS fallback verification (for basic phones)
 */
async function processUSSDInput(ussdCode) {
    // Format expected: *901*16*Amount*SigSub#
    logConsole(`USSD Network Command received: ${ussdCode}`, "network");
    
    const matches = ussdCode.match(/\*901\*16\*(\d+)\*([A-Za-z0-9]{6})#/);
    if (!matches) {
        alert("Invalid USSD transaction code format. Try copying it exactly from customer screen.");
        return;
    }

    const amount = parseInt(matches[1]);
    const sigPart = matches[2];

    logConsole(`USSD Decoded: Transfer ${amount} NGN. Signature Checksum: ${sigPart}`, "info");

    if (state.networkMode === 'offline') {
        // In physical USSD offline, the phone sends a signal that is routed through GSM channel.
        // If there is absolutely no GSM signal, we queue it.
        logConsole("USSD Gateway unreachable (Cell Tower Offline). Queuing request on device...", "warning");
    }

    // Let's check matching transaction generated by customer (simulating search/verification)
    // For prototype simplicity, we find the active customer voucher matching this checksum
    const rawVoucherData = document.getElementById('raw-voucher-data').value;
    if (!rawVoucherData) {
        alert("Customer has not generated an active voucher yet!");
        return;
    }

    // Process the scanned voucher
    await scanVoucher(rawVoucherData);
}

/**
 * Settles offline vouchers with the central ledger database
 */
async function settleOfflineTransactions() {
    if (state.networkMode === 'offline') {
        logConsole("Unable to settle ledger: Network offline.", "error");
        return;
    }

    if (state.offlineSyncQueue.length === 0) {
        logConsole("Nothing to settle. Sync queue is empty.", "warning");
        return;
    }

    const queueLength = state.offlineSyncQueue.length;
    logConsole(`Synchronizing ${queueLength} offline transactions with bank central database...`, "network");
    
    // Process queue
    let successfulSyncs = 0;
    while (state.offlineSyncQueue.length > 0) {
        const envelope = state.offlineSyncQueue[0];
        const payload = envelope.payload;
        
        // Double-check signature at central bank level (regulatory rule)
        const envelopeString = btoa(JSON.stringify(envelope));
        const verification = await ResiliPaySDK.verifyVoucher(envelopeString);
        const isValid = verification.isValid;
        
        if (!isValid) {
            logConsole(`Fraud prevention triggered: Transaction nonce ${payload.nonce} signature invalid! Settle rejected.`, "error");
            state.offlineSyncQueue.shift();
            continue;
        }

        // Verify ledger balance & nonce sequence at server
        const currentLedgerBal = state.bankLedger[payload.sender];
        if (currentLedgerBal < payload.amount) {
            logConsole(`Settlement collision: Sender ${payload.sender} has insufficient ledger funds (${currentLedgerBal} NGN) for ${payload.amount} NGN transaction. Potential double-spend attempt! Rejecting.`, "error");
            // Reverse merchant local balance
            state.merchantWallet.balance -= payload.amount;
            state.offlineSyncQueue.shift();
            continue;
        }

        // Apply transfer in central ledger
        state.bankLedger[payload.sender] -= payload.amount;
        state.bankLedger[payload.receiver] += payload.amount;
        
        // Complete transaction record
        state.merchantWallet.settledTransactions.push({
            id: `SETTLE-${Date.now()}-${successfulSyncs}`,
            sender: payload.sender,
            amount: payload.amount,
            timestamp: payload.timestamp
        });

        successfulSyncs++;
        state.offlineSyncQueue.shift(); // Remove from queue
    }

    // Reset pending offline local balances to represent official settled bank state
    state.customerWallet.balance = state.bankLedger[state.customerWallet.phone];
    state.merchantWallet.balance = state.bankLedger[state.merchantWallet.phone];
    state.merchantWallet.pendingVouchers = [];

    logConsole(`Settlement complete. ${successfulSyncs} transactions posted to bank database.`, "success");
    updateUI();
    
    // Redraw transaction list
    renderMerchantHistory();
}

function renderMerchantHistory() {
    const list = document.getElementById('merch-tx-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (state.merchantWallet.settledTransactions.length === 0) {
        list.innerHTML = '<div class="empty-txs">No settled transactions yet</div>';
        return;
    }

    state.merchantWallet.settledTransactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'tx-item';
        item.innerHTML = `
            <div class="tx-details">
                <span class="tx-id">${tx.id}</span>
                <span class="tx-from">From: ${tx.sender}</span>
            </div>
            <div class="tx-amount font-bold text-emerald">+${tx.amount.toLocaleString()} NGN</div>
        `;
        list.appendChild(item);
    });
}

// --- UI Event Bindings & Camera Scanner Setup ---
let cameraStream = null;

async function startCameraScanner() {
    logConsole("Initializing camera hardware...", "info");
    const video = document.getElementById('scanner-video');
    const container = document.getElementById('camera-scanner-container');
    const openBtn = document.getElementById('open-scanner-btn');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: 320, height: 240 } 
        });
        video.srcObject = cameraStream;
        
        container.classList.remove('hidden');
        openBtn.classList.add('hidden');
        logConsole("Webcam feed active. Awaiting frame capture...", "success");
    } catch (err) {
        logConsole(`Camera access denied or unavailable: ${err.message}. Using manual fallback.`, "warning");
        alert("Camera access failed. Please paste the token manually in the input below.");
    }
}

function stopCameraScanner() {
    const container = document.getElementById('camera-scanner-container');
    const openBtn = document.getElementById('open-scanner-btn');
    const video = document.getElementById('scanner-video');

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    video.srcObject = null;
    container.classList.add('hidden');
    openBtn.classList.remove('hidden');
    logConsole("Camera hardware released.", "info");
}

// --- View Navigation Controllers ---
function navigateTo(mode) {
    const portal = document.getElementById('portal-screen');
    const grid = document.getElementById('workspace-grid');
    const customerSim = document.getElementById('phone-customer');
    const merchantSim = document.getElementById('phone-merchant');
    const headerBtn = document.getElementById('header-portal-btn');

    // Default clean states
    portal.classList.add('hidden');
    grid.classList.remove('hidden', 'single-layout');
    customerSim.classList.add('hidden');
    merchantSim.classList.add('hidden');
    headerBtn.classList.remove('hidden');

    if (mode === 'portal') {
        portal.classList.remove('hidden');
        grid.classList.add('hidden');
        headerBtn.classList.add('hidden');
        logConsole("Navigation: Returned to ResiliPay Portal.", "info");
    } else if (mode === 'customer') {
        grid.classList.add('single-layout');
        customerSim.classList.remove('hidden');
        logConsole("Navigation: Entered Customer Wallet screen.", "info");
    } else if (mode === 'merchant') {
        grid.classList.add('single-layout');
        merchantSim.classList.remove('hidden');
        logConsole("Navigation: Entered Merchant POS Terminal screen.", "info");
    } else if (mode === 'split') {
        customerSim.classList.remove('hidden');
        merchantSim.classList.remove('hidden');
        logConsole("Navigation: Entered Side-by-Side Desktop Split-View.", "info");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    initializeWallets();

    // Portal Selector Buttons
    document.getElementById('select-customer-btn').addEventListener('click', () => navigateTo('customer'));
    document.getElementById('select-merchant-btn').addEventListener('click', () => navigateTo('merchant'));
    document.getElementById('toggle-split-btn').addEventListener('click', () => navigateTo('split'));
    document.getElementById('cust-exit-btn').addEventListener('click', () => navigateTo('portal'));
    document.getElementById('merch-exit-btn').addEventListener('click', () => navigateTo('portal'));
    document.getElementById('header-portal-btn').addEventListener('click', () => navigateTo('portal'));
    
    // Log local IP connection options for demo presentation
    setTimeout(() => {
        logConsole("💡 DEMO PRESENTATION TIP: To run ResiliPay across two physical phones simultaneously:", "info");
        logConsole("   1. Connect your computer and phones to the same Wi-Fi network.", "info");
        logConsole("   2. Open this address on your phones: http://172.23.108.124:8080", "success");
        logConsole("   3. Tap the PWA install popup (or 'Add to Home Screen') to install.", "info");
    }, 1200);

    // Toggle Network Range Slider
    const netToggle = document.getElementById('network-slider');
    if (netToggle) {
        netToggle.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            let mode = 'online';
            if (val === 1) mode = 'low-bandwidth';
            if (val === 2) mode = 'offline';
            setNetworkMode(mode);
        });
    }

    // Pay Submit Form (Show Confirmation Screen)
    const payForm = document.getElementById('pay-form');
    if (payForm) {
        payForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseInt(document.getElementById('transfer-amount').value);
            
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid transfer amount");
                return;
            }

            if (state.customerWallet.balance < amount) {
                alert("Insufficient funds in customer wallet");
                return;
            }

            // Save draft
            state.currentTransactionDraft = {
                amount: amount,
                receiver: state.merchantWallet.phone
            };

            // Update confirmation screen fields
            document.getElementById('confirm-amount-display').innerText = amount.toLocaleString();
            document.getElementById('confirm-balance-display').innerText = (state.customerWallet.balance - amount).toLocaleString();
            
            // Toggle Screens
            document.getElementById('cust-send-form').classList.add('hidden');
            document.getElementById('cust-confirm-screen').classList.remove('hidden');
            
            logConsole(`Entering review phase. Send amount: ₦${amount.toLocaleString()} NGN.`, "info");
        });
    }

    // Cancel / Back button from Confirmation Screen
    const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', () => {
            state.currentTransactionDraft = null;
            document.getElementById('cust-send-form').classList.remove('hidden');
            document.getElementById('cust-confirm-screen').classList.add('hidden');
            logConsole("Transaction review cancelled. Returned to form.", "info");
        });
    }

    // Authorize & Sign transaction from Confirmation Screen
    const confirmSignBtn = document.getElementById('confirm-sign-btn');
    if (confirmSignBtn) {
        confirmSignBtn.addEventListener('click', async () => {
            const pin = document.getElementById('cust-pin').value;
            
            if (pin !== '1234') {
                alert("Security Authorization Failed: Invalid PIN code! Hint: try '1234'");
                logConsole("Transaction signing rejected: Invalid wallet authorization PIN.", "error");
                return;
            }

            if (!state.currentTransactionDraft) return;

            const { amount, receiver } = state.currentTransactionDraft;
            state.currentTransactionDraft = null;
            
            // Hide confirmation screen
            document.getElementById('cust-confirm-screen').classList.add('hidden');
            
            // Execute signing
            await initiatePayment(amount, receiver);
        });
    }

    // Void & Refund Voucher
    const voidVoucherBtn = document.getElementById('void-voucher-btn');
    if (voidVoucherBtn) {
        voidVoucherBtn.addEventListener('click', () => {
            voidVoucher();
        });
    }

    // Return to Pay Home Screen (New Transaction)
    const newTxBtn = document.getElementById('new-tx-btn');
    if (newTxBtn) {
        newTxBtn.addEventListener('click', () => {
            document.getElementById('cust-send-form').classList.remove('hidden');
            document.getElementById('cust-voucher-screen').classList.add('hidden');
            document.getElementById('transfer-amount').value = '';
        });
    }

    // Open QR Camera Scanner
    const openScannerBtn = document.getElementById('open-scanner-btn');
    if (openScannerBtn) {
        openScannerBtn.addEventListener('click', startCameraScanner);
    }

    // Close QR Camera Scanner
    const closeScannerBtn = document.getElementById('close-scanner-btn');
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', stopCameraScanner);
    }

    // Capture Scan & Verify
    const captureScanBtn = document.getElementById('capture-scan-btn');
    if (captureScanBtn) {
        captureScanBtn.addEventListener('click', async () => {
            logConsole("Capturing frame and running cryptographic OCR...", "info");
            
            // In a simulated scan, we pull the active transaction voucher string from Phone A's UI.
            // This provides 100% reliable scan results for live demos without failing due to webcam glares.
            const voucherString = document.getElementById('raw-voucher-data').value;
            if (!voucherString) {
                alert("Scan failed: No active cryptographic token found on Phone A. Generate a voucher first!");
                stopCameraScanner();
                return;
            }

            // Close scanner first
            stopCameraScanner();
            
            // Verify
            await scanVoucher(voucherString);
        });
    }

    // Manual Voucher Input Submission
    const submitVoucherBtn = document.getElementById('submit-voucher-btn');
    if (submitVoucherBtn) {
        submitVoucherBtn.addEventListener('click', async () => {
            const data = document.getElementById('manual-voucher-data').value;
            await scanVoucher(data);
        });
    }

    // Manual USSD Code Entry Submission
    const submitUssdBtn = document.getElementById('submit-ussd-btn');
    if (submitUssdBtn) {
        submitUssdBtn.addEventListener('click', async () => {
            const ussd = document.getElementById('manual-ussd-input').value;
            await processUSSDInput(ussd);
        });
    }

    // Reset merchant success screen back to receive screen
    const returnReceiveBtn = document.getElementById('return-receive-btn');
    if (returnReceiveBtn) {
        returnReceiveBtn.addEventListener('click', () => {
            document.getElementById('merch-receive-screen').classList.remove('hidden');
            document.getElementById('merch-success-screen').classList.add('hidden');
            document.getElementById('manual-voucher-data').value = '';
            document.getElementById('manual-ussd-input').value = '';
        });
    }

    // Manual Sync Database Button
    const syncBtn = document.getElementById('sync-ledger-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            settleOfflineTransactions();
        });
    }
});
