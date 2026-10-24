# Deployment Guide — Somnia Testnet

## Prerequisites

1. **MetaMask Wallet** configured for Somnia Testnet.
2. **Somnia Testnet STT** for transaction gas fees, obtained from the [official Somnia Faucet](https://faucet.somnia.network/).
3. **Node.js 18+** installed.
4. **Hardhat** and the required project dependencies installed.

## Step 1: Configure and Deploy Smart Contracts

Open a terminal and navigate to the contracts directory:

```bash
cd contracts

# Create the environment file
cp .env.example .env
```

Add your private key to `.env`:

```env
PRIVATE_KEY=your_private_key_here
```

**Security warning:** Never commit your private key or `.env` file to Git. Use a dedicated test wallet containing only testnet funds.

Compile the smart contracts:

```bash
npx hardhat compile
```

Deploy the contracts to Somnia Testnet:

```bash
npx hardhat run scripts/deploy.js --network somniaTestnet
```

Copy the deployed contract address from the terminal output.

Expected output:

```text
ProductPassport deployed to: 0x1234567890abcdef...
```

The address above is an example. Use the actual address returned by your deployment.

## Step 2: Configure the Frontend

Navigate to the application directory:

```bash
cd ../app

# Create the frontend environment file
cp .env.local.example .env.local
```

Update `.env.local` with your deployed contract address and Somnia Testnet RPC:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_SOMNIA_TESTNET_RPC=https://dream-rpc.somnia.network/
```

Ensure the frontend's wallet configuration uses Somnia Testnet and the correct chain ID. Update the variable names and configuration to match those referenced by your application code.

## Step 3: Authorize Yourself as a Manufacturer

Open the Hardhat console on Somnia Testnet:

```bash
cd ../contracts

npx hardhat console --network somniaTestnet
```

Run the following commands in the console:

```javascript
const ProductPassport =
  await ethers.getContractFactory("ProductPassport");

const contract = await ProductPassport.attach(
  "0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
);

const [deployer] = await ethers.getSigners();

const tx = await contract.authorizeManufacturer(
  deployer.address
);

await tx.wait();

console.log("Manufacturer authorized:", deployer.address);
```

Replace the example contract address with your actual deployed address.

**Important:** The wallet used for authorization must have the required permissions to call `authorizeManufacturer`, typically the contract owner's address.

## Step 4: Run the Application

From the project root or the appropriate application directory:

```bash
cd ../app

npm install
npm run dev
```

Open the application in your browser:

[http://localhost:3000](http://localhost:3000)

Confirm that MetaMask is connected to Somnia Testnet before interacting with the application.

## Step 5: Test the Product Passport Flow

1. **Connect Wallet:** Open the manufacturer page and connect MetaMask.
2. **Register Product:** Enter the following sample data:
   - Product Name: `Eco T-Shirt`
   - Manufacturer: `GreenTextiles Inc`
   - Carbon Footprint: `5.0 kg`
   - Materials: `100% Organic Cotton`
   - Origin: `Portugal`
3. **Confirm Transaction:** Approve the transaction in MetaMask and wait for confirmation.
4. **View Product Passport:** Scan the generated QR code or open the product passport link.
5. **Verify Transaction:** Open the Somnia Testnet explorer and search for the transaction hash or deployed contract address.

## Contract Verification

Verify the deployed contract on the Somnia Testnet explorer, provided that contract verification is supported and configured for the network.

```bash
npx hardhat verify --network somniaTestnet 0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Constructor arguments may also be required, depending on your contract.

## Troubleshooting

### Insufficient Funds for Gas

- Obtain Somnia Testnet STT from the official faucet.
- Confirm that MetaMask is connected to Somnia Testnet.
- Wait for the faucet transaction to complete before retrying.

### Not Authorized to Register Products

- Confirm that Step 3 completed successfully.
- Verify that the connected wallet is the authorized manufacturer.
- Confirm that the authorization transaction was mined on Somnia Testnet.
- Check whether the contract restricts authorization to its owner.

### Wrong Network or RPC Error

- Verify that the configured RPC endpoint is correct.
- Confirm that the wallet's chain ID matches the network configured in Hardhat.
- Check that the frontend is not still using Polygon Amoy settings.

### Module Not Found: `Can't resolve 'wagmi'`

```bash
cd app

rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

Use this reinstall procedure only if necessary. Ensure the required dependencies are declared in `package.json` before reinstalling.

## Production Deployment

**Do not deploy to mainnet until the smart contracts have been thoroughly tested and audited.**

For a future production deployment:

1. Review and audit the smart contracts.
2. Configure the intended production network and its RPC.
3. Securely configure production environment variables.
4. Deploy and verify the contracts on the selected network.
5. Deploy the Next.js application to Vercel:

```bash
cd app
vercel --prod
```

## Quick Demo Setup

For hackathon judges or other testers:

1. Install MetaMask.
2. Add or select Somnia Testnet.
3. Obtain testnet STT from the [Somnia Faucet](https://faucet.somnia.network/).
4. Open the deployed application URL.
5. Connect the wallet.
6. Register a product and inspect its passport and on-chain transaction.

---

**Estimated deployment time:** Approximately 15 minutes, assuming dependencies are installed and the project is configured correctly.

**Gas cost:** Depends on the contract and network conditions. Measure the actual cost during testing rather than assuming a fixed amount.

**Target network:** Somnia Testnet only.