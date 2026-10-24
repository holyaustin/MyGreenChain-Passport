# Demo Script for IEEE ClimateChain Hackathon

**Duration**: 3-5 minutes  
**Target Audience**: Hackathon judges

---

## Opening (30 seconds)

"Hi judges! I'm excited to present **MyGreenChain Passport** - a blockchain solution that brings transparency to product sustainability claims.

The problem? Greenwashing. Consumers can't verify if a product is truly sustainable. Companies struggle to prove their environmental commitment. 

Our solution? Digital product passports - blockchain-verified sustainability data that travels with products from factory to recycling."

---

## Problem Deep Dive (30 seconds)

**Show slide or visual**:
- 70% of consumers doubt sustainability claims
- $2.3 billion lost annually to greenwashing fines
- No standardized way to track product environmental impact

"This directly aligns with the Sustainable Supply Chains track - we're solving the verification and transparency crisis."

---

## Solution Demo - Part 1: Manufacturer (90 seconds)

**Screen recording or live demo**:

"Let me show you how it works. I'm a manufacturer at GreenTextiles Inc.

[Navigate to manufacturer page]

First, I connect my Web3 wallet - this authenticates me on the blockchain.

[Connect MetaMask]

Now I register my product - an organic cotton t-shirt:
- Product name: Eco T-Shirt
- Carbon footprint: 5 kg CO2
- Materials: 100% Organic Cotton  
- Origin: Portugal

[Fill form and submit]

Our AI sustainability algorithm instantly analyzes this data:
- Penalizes carbon emissions
- Rewards sustainable materials
- Bonuses for local production

[Transaction confirms]

And there it is - a blockchain NFT passport with an A grade, 85/100 sustainability score. This record is now permanent and tamper-proof."

---

## Solution Demo - Part 2: Consumer (90 seconds)

**Show product passport page**:

"Now let's switch to the consumer perspective. 

[Click on product passport]

Every product gets a QR code. When consumers scan it in-store, they see:

1. **Sustainability Score** - A grade, 85/100, AI-calculated from real data
2. **Carbon Footprint** - 5 kg CO2, transparently tracked
3. **Material Verification** - 100% Organic Cotton, blockchain-verified
4. **Lifecycle Journey** - Complete history from production in Portugal

[Scroll through events]

See these lifecycle events? As the product moves through supply chain, we add:
- Transport emissions
- Distribution center stops  
- Retail sale
- Final recycling

Every update goes on-chain. Consumers trust it because no one can fake blockchain records.

[Show blockchain verification]

This footer shows the NFT token ID and owner address - anyone can verify on PolygonScan."

---

## Technical Implementation (30 seconds)

**Show architecture slide briefly**:

"Technical stack:
- **Smart Contracts**: Solidity on Polygon for low-cost, high-speed transactions
- **Frontend**: Next.js 16 with TypeScript for production-ready web app
- **AI Scoring**: Rule-based algorithm analyzing carbon, materials, and origin
- **Web3**: Wagmi for seamless wallet integration

The entire codebase is on GitHub with comprehensive tests and documentation."

---

## Impact & Scalability (30 seconds)

"Why this matters:

**Climate Impact**:
- Reduces greenwashing by 100% for participating products
- Empowers sustainable purchasing decisions
- Incentivizes manufacturers to improve practices

**Scalability**:
- Works for ANY product - clothing, electronics, food
- Polygon L2 enables millions of products at low cost
- QR codes work anywhere, no app needed

**Real Adoption Path**:
- Start with certified B Corps
- Integrate with existing eco-labels
- Partner with retailers for in-store displays

We envision a future where every product has a passport, and sustainability is verifiable, not just claimed."

---

## Closing (20 seconds)

"MyGreenChain Passport transforms sustainability from marketing buzzwords into blockchain-verified facts. 

We're not just building for this hackathon - we're building the infrastructure for transparent, accountable supply chains.

Thank you! Happy to answer questions."

---

## Backup Q&A Responses

**Q: How do you prevent fake data input?**
A: Phase 1 uses authorized manufacturers. Phase 2 integrates IoT sensors and satellite verification APIs for automated data.

**Q: What about products without blockchain?**
A: Manufacturers can bulk-import existing products. The passport becomes most valuable for new production runs.

**Q: Gas costs at scale?**
A: Polygon L2 costs ~$0.0001 per transaction. For 1 million products, that's ~$100 total.

**Q: Why not just use a database?**
A: Blockchain provides immutability (no editing history), decentralization (no single authority), and public verifiability (anyone can audit).

**Q: Privacy concerns?**
A: Product data is public (that's the point for transparency). Personal consumer data is never stored on-chain.

---

## Demo Backup Plan

If live demo fails:
1. Show pre-recorded video
2. Walk through screenshots  
3. Show PolygonScan transaction history
4. Display code in GitHub

---

**Key Message**: We make sustainability verifiable, not just voluntary.

🌱 Every product deserves a passport. Every claim deserves proof.
