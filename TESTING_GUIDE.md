# End-to-End Testing Guide

**Date**: October 24, 2026  
**Status**: Contract Deployed ✅ | Frontend Running ✅  
**Time to Deadline**: ~38 hours

---

## 🎯 Testing Checklist

Follow these steps to verify your MyGreenChain Passport is working correctly.

---

## **Phase 1: Pre-Testing Setup** (5 minutes)

### 1. Verify Contract Deployment
```bash
cd contracts
cat .env | grep PRIVATE_KEY
# Should show your private key (keep it secret!)
```

**Check deployment:**
- Open Somnia Testnet Explorer: https://shannon-explorer.somnia.network
- Search for your contract address
- Verify it shows "Contract" and has transactions

### 2. Verify Frontend Configuration
```bash
cd ../app
cat .env.local | grep CONTRACT_ADDRESS
# Should show: NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

**Confirm frontend is running:**
- Open browser: http://localhost:3000
- Page should load without errors
- Check browser console (F12) for errors

### 3. MetaMask Setup
**Add Somnia Testnet to MetaMask:**

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter:
   - **Network Name**: Somnia Testnet
   - **RPC URL**: https://dream-rpc.somnia.network
   - **Chain ID**: 50312
   - **Currency Symbol**: STT
   - **Block Explorer**: https://shannon-explorer.somnia.network

4. Get test tokens: https://faucet.somnia.network/

---

## **Phase 2: Home Page Testing** (2 minutes)

### ✅ Test 1: Home Page Loads
- [ ] Navigate to http://localhost:3000
- [ ] Page loads without errors
- [ ] "MyGreenChain Passport" logo visible
- [ ] "Register Your Product" button visible
- [ ] "View Demo Product" button visible
- [ ] Footer shows IEEE ClimateChain branding

**Expected Result**: Clean, professional landing page

**If it fails**: Check browser console (F12) for errors

---

## **Phase 3: Manufacturer Flow Testing** (10 minutes)

### ✅ Test 2: Navigate to Manufacturer Page
- [ ] Click "For Manufacturers" or go to http://localhost:3000/manufacturer
- [ ] Page shows "Connect Your Wallet" card

**Expected Result**: Wallet connection prompt displayed

### ✅ Test 3: Connect Wallet
- [ ] Click "Connect Wallet" button
- [ ] MetaMask popup appears
- [ ] Select your account
- [ ] Approve connection
- [ ] Page shows product registration form
- [ ] Header shows wallet address (0x1234...5678)

**Expected Result**: Form with fields for product details

**If it fails**:
- MetaMask installed? → Install from https://metamask.io
- Wrong network? → Switch to Somnia Testnet
- No STT tokens? → Get from faucet

### ✅ Test 4: Register Product (Happy Path)

**Fill out form:**
- **Product Name**: `Eco T-Shirt`
- **Manufacturer**: `GreenTextiles Inc`
- **Carbon Footprint**: `5.0` (kg CO₂)
- **Materials**: `100% Organic Cotton`
- **Origin**: `Portugal`
- **Description**: `Sustainably produced organic cotton t-shirt`

**Submit:**
- [ ] Click "Register Product" button
- [ ] MetaMask popup appears requesting transaction approval
- [ ] Review gas fees (should be small on testnet)
- [ ] Click "Confirm" in MetaMask
- [ ] Button shows "Confirming Transaction..."
- [ ] Wait for blockchain confirmation (~5-10 seconds)
- [ ] Button shows "Minting NFT..."
- [ ] Success screen appears with:
  - ✅ Green checkmark
  - ✅ "Product Registered!" message
  - ✅ Transaction hash displayed
  - ✅ "View Product Passport" button
  - ✅ "Register Another Product" button

**Expected Result**: NFT minted successfully, tokenId = 1

**If it fails**:
- "Not authorized to register products" → Run authorization step (see below)
- "Insufficient funds" → Get more STT from faucet
- Transaction rejected → Check MetaMask is on Somnia Testnet
- Timeout → Somnia network might be slow, wait longer

### ✅ Test 5: Authorization Check (If Test 4 Failed)

**Authorize yourself as manufacturer:**
```bash
cd contracts
npx hardhat console --network somniaTestnet
```

**In Hardhat console:**
```javascript
const ProductPassport = await ethers.getContractFactory("ProductPassport");
const contract = await ProductPassport.attach("YOUR_CONTRACT_ADDRESS");
const [deployer] = await ethers.getSigners();

// Check if already authorized
const isAuthorized = await contract.authorizedManufacturers(deployer.address);
console.log("Authorized:", isAuthorized);

// If false, authorize yourself
if (!isAuthorized) {
  const tx = await contract.authorizeManufacturer(deployer.address);
  await tx.wait();
  console.log("Authorized:", deployer.address);
}
```

**Then retry Test 4**

### ✅ Test 6: Register Product (Edge Cases)

**Test invalid inputs:**

1. **Empty fields:**
   - [ ] Leave "Product Name" empty
   - [ ] Try to submit
   - [ ] Browser shows validation error
   - **Expected**: Form won't submit

2. **Invalid carbon footprint:**
   - [ ] Enter negative number: `-5`
   - [ ] Try to submit
   - [ ] Should show error or prevent submission
   - **Expected**: Validation prevents invalid data

3. **Score validation:**
   - [ ] Fill form normally
   - [ ] Submit successfully
   - [ ] Note the sustainability score displayed
   - **Expected**: Score between 0-100

---

## **Phase 4: Product Passport Viewer Testing** (10 minutes)

### ✅ Test 7: View Product Passport
After successful registration in Test 4:

- [ ] Click "View Product Passport" button
- [ ] New page loads: http://localhost:3000/product/1
- [ ] Product name displayed: "Eco T-Shirt"
- [ ] Manufacturer shown: "GreenTextiles Inc"
- [ ] Sustainability grade shown (A, B, C, etc.)
- [ ] Sustainability score shown (0-100)
- [ ] Carbon footprint displayed: "5.00 kg"
- [ ] Production date shown
- [ ] Materials listed: "100% Organic Cotton"
- [ ] Origin shown: "Portugal"
- [ ] Lifecycle section shows "Production" event
- [ ] Blockchain verification footer shows:
  - Token ID: #1
  - Owner address

**Expected Result**: Complete product passport with all data

### ✅ Test 8: QR Code Generation
On product passport page:

- [ ] Click "Show QR Code" button
- [ ] QR code appears at top of page
- [ ] QR code is scannable (test with phone camera)
- [ ] Scanning QR code leads to same product page
- [ ] Click "Hide QR Code" button
- [ ] QR code disappears

**Expected Result**: QR code generates and works

### ✅ Test 9: Sustainability Score Validation

**Check AI algorithm worked correctly:**

For "Eco T-Shirt" with:
- Carbon: 5kg (5000g)
- Material: "100% Organic Cotton" (contains "organic")
- Origin: Portugal (EU country)
- Not recycled yet

**Expected calculation:**
```
Base: 100
- Carbon penalty: ~5 points (5kg is low)
+ Organic bonus: +15 points
+ EU origin bonus: +5 points
= Score: ~115 → capped at 100
→ Final score: 85-100 range
→ Grade: A or A+
```

- [ ] Score is 80-100
- [ ] Grade is A or A+
- [ ] Score color is green
- [ ] Message says "Excellent" or "Outstanding"

**If score doesn't make sense**: Check `/app/lib/utils.ts` calculation logic

### ✅ Test 10: Direct URL Access
- [ ] Copy product URL: http://localhost:3000/product/1
- [ ] Open in new browser tab
- [ ] Product passport loads correctly
- [ ] All data displays without needing wallet connection

**Expected Result**: Public viewing works (read-only)

### ✅ Test 11: Non-Existent Product
- [ ] Navigate to http://localhost:3000/product/999
- [ ] "Product Not Found" message displays
- [ ] "Go Home" button works

**Expected Result**: Graceful error handling

---

## **Phase 5: Blockchain Verification** (5 minutes)

### ✅ Test 12: Verify on Somnia Explorer

1. **Find your transaction:**
   - Copy transaction hash from success screen
   - Open: https://shannon-explorer.somnia.network
   - Paste transaction hash in search
   - [ ] Transaction shows "Success" status
   - [ ] Shows contract interaction
   - [ ] Shows gas used

2. **View contract:**
   - Search for your contract address
   - [ ] Contract page loads
   - [ ] Shows "Contract" type
   - [ ] Shows transaction history
   - [ ] Shows token transfers (ERC-721)

3. **View NFT:**
   - [ ] Transaction shows "Token Transfer" event
   - [ ] NFT ID matches your product (ID: 1)
   - [ ] Shows from 0x0000... (mint) to your address

**Expected Result**: All blockchain data verifiable on explorer

---

## **Phase 6: Multiple Products Testing** (10 minutes)

### ✅ Test 13: Register Second Product

**Different sustainability profile:**
- **Product Name**: `Plastic Water Bottle`
- **Manufacturer**: `PlastiCorp`
- **Carbon Footprint**: `15.0` kg
- **Materials**: `100% Plastic (PET)`
- **Origin**: `China`

- [ ] Submit and confirm transaction
- [ ] Product registers successfully
- [ ] Token ID = 2
- [ ] View product passport
- [ ] Score is lower (should be 40-60 range)
- [ ] Grade is C or D (worse than T-shirt)
- [ ] Score color is yellow/orange
- [ ] Plastic penalty applied

**Expected Result**: Different products get different scores based on sustainability

### ✅ Test 14: Register Third Product (Best Score)

**Maximum sustainability:**
- **Product Name**: `Recycled Cork Yoga Mat`
- **Manufacturer**: `EcoFit Co`
- **Carbon Footprint**: `2.0` kg
- **Materials**: `100% Recycled Cork and Organic Rubber`
- **Origin**: `Portugal`

- [ ] Submit and confirm
- [ ] Token ID = 3
- [ ] View passport
- [ ] Score is 90-100 (A+)
- [ ] Multiple bonuses applied (recycled + organic + local)
- [ ] Highest score of all products

**Expected Result**: Best practices rewarded with highest scores

---

## **Phase 7: Responsive Design Testing** (5 minutes)

### ✅ Test 15: Mobile View
- [ ] Open browser DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select "iPhone 12 Pro" or similar
- [ ] Test all pages:
  - [ ] Home page looks good
  - [ ] Manufacturer page form is usable
  - [ ] Product passport is readable
  - [ ] QR code displays properly
  - [ ] No horizontal scrolling

**Expected Result**: Mobile-friendly on all pages

---

## **Phase 8: Error Handling Testing** (5 minutes)

### ✅ Test 16: Disconnect Wallet Mid-Session
- [ ] Connect wallet and go to manufacturer page
- [ ] In MetaMask, disconnect from site
- [ ] Try to submit form
- [ ] Error message appears or redirects to connect wallet

**Expected Result**: Graceful handling of disconnection

### ✅ Test 17: Wrong Network
- [ ] Switch MetaMask to different network (e.g., Ethereum Mainnet)
- [ ] Try to use manufacturer page
- [ ] Error shown or transaction fails with clear message

**Expected Result**: Network mismatch detected

### ✅ Test 18: Reject Transaction
- [ ] Fill out product registration form
- [ ] Click submit
- [ ] When MetaMask popup appears, click "Reject"
- [ ] Form returns to ready state
- [ ] No error crashes the page
- [ ] Can try again

**Expected Result**: Transaction rejection handled gracefully

---

## **Phase 9: Performance Testing** (3 minutes)

### ✅ Test 19: Page Load Speed
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Reload home page
- [ ] Page loads within 2 seconds
- [ ] No console errors
- [ ] Images load properly

### ✅ Test 20: Wallet Connection Speed
- [ ] Disconnect and reconnect wallet
- [ ] Connection happens within 3 seconds
- [ ] Form loads immediately after connection

### ✅ Test 21: Blockchain Query Speed
- [ ] Load product passport page
- [ ] Data loads within 5 seconds
- [ ] Shows loading state if taking longer

**Expected Result**: Responsive application

---

## **Phase 10: Data Accuracy Testing** (5 minutes)

### ✅ Test 22: Smart Contract Data Match
For a registered product, verify data consistency:

**Check on blockchain:**
```bash
cd contracts
npx hardhat console --network somniaTestnet
```

```javascript
const ProductPassport = await ethers.getContractFactory("ProductPassport");
const contract = await ProductPassport.attach("YOUR_CONTRACT_ADDRESS");

// Get product data for token ID 1
const product = await contract.getProduct(1);
console.log("Product Name:", product.productName);
console.log("Manufacturer:", product.manufacturer);
console.log("Carbon Footprint:", product.carbonFootprint.toString(), "g");
console.log("Score:", product.sustainabilityScore.toString());
console.log("Materials:", product.materialComposition);
console.log("Origin:", product.originCountry);
console.log("Owner:", product.currentOwner);

// Get lifecycle events
const events = await contract.getLifecycleEvents(1);
console.log("Lifecycle Events:", events.length);
console.log("First Event:", events[0]);
```

**Verify:**
- [ ] Data matches what you entered in form
- [ ] Carbon footprint in grams (5kg = 5000g)
- [ ] Score matches frontend display
- [ ] Owner address is your wallet address
- [ ] Production event exists

**Expected Result**: 100% data accuracy between frontend and blockchain

---

## 📊 **Test Results Summary**

Create a checklist of what worked:

```
✅ Contract deployed successfully
✅ Frontend running on localhost:3000
✅ Wallet connection works
✅ Product registration works
✅ NFT minting works
✅ Product passport displays correctly
✅ QR code generation works
✅ Sustainability scoring accurate
✅ Multiple products work
✅ Blockchain verification passes
✅ Mobile responsive
✅ Error handling works
✅ Performance acceptable
```

---

## 🐛 **Common Issues & Fixes**

### Issue: "Not authorized to register products"
**Fix:**
```bash
cd contracts
npx hardhat console --network somniaTestnet
# Run authorization commands (see Test 5)
```

### Issue: Transaction fails with "insufficient funds"
**Fix:**
- Get more STT from faucet: https://faucet.somnia.network/
- Wait 5 minutes after faucet request
- Check balance in MetaMask

### Issue: "Module not found: wagmi"
**Fix:**
```bash
cd app
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Issue: Frontend shows old contract address
**Fix:**
```bash
cd app
# Edit .env.local with correct address
nano .env.local
# Restart dev server
npm run dev
```

### Issue: Product passport shows "Product Not Found"
**Fix:**
- Verify contract address in .env.local
- Verify token ID exists (check on explorer)
- Wait for blockchain confirmation (might take 30s)

---

## ✅ **Final Validation Checklist**

Before demo/submission, confirm:

- [ ] At least 3 products registered with different scores
- [ ] All products visible with correct data
- [ ] QR codes generate and work
- [ ] Blockchain explorer shows all transactions
- [ ] No console errors in browser
- [ ] Works on mobile view
- [ ] Demo flow takes less than 3 minutes
- [ ] Screenshots taken for submission

---

## 🎬 **Demo Flow (2 minutes)**

**Practice this flow:**

1. **Start**: Home page (5 seconds)
   - "This is MyGreenChain Passport..."

2. **Manufacturer**: Register product (30 seconds)
   - Fill form quickly
   - Submit transaction
   - Show confirmation

3. **Consumer**: View passport (45 seconds)
   - Navigate to product
   - Show sustainability score
   - Explain lifecycle tracking
   - Display QR code
   - Show blockchain verification

4. **Impact**: Compare products (30 seconds)
   - Show Eco T-Shirt (A grade)
   - Show Plastic Bottle (D grade)
   - Explain algorithm fairness

5. **Close**: (10 seconds)
   - "Verified sustainability, powered by blockchain"

---

## 📸 **Screenshots to Capture**

For Devpost submission:

1. Home page
2. Wallet connection screen
3. Product registration form (filled)
4. Transaction confirmation in MetaMask
5. Success screen with NFT confirmation
6. Product passport (A-grade product)
7. Product passport (lower-grade product)
8. QR code displayed
9. Lifecycle events timeline
10. Somnia explorer showing your contract
11. Mobile view of product passport

---

**Testing Complete!** ✅

Your MyGreenChain Passport is ready for:
- ✅ Live demo
- ✅ Video recording
- ✅ Devpost submission
- ✅ Judge evaluation

**Time spent testing**: ~60 minutes  
**Time remaining to deadline**: ~37 hours  
**Next step**: Record demo video! 🎬
