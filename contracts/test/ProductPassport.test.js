const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductPassport", function () {
  let productPassport;
  let owner;
  let manufacturer;
  let consumer;

  beforeEach(async function () {
    [owner, manufacturer, consumer] = await ethers.getSigners();

    const ProductPassport = await ethers.getContractFactory("ProductPassport");
    productPassport = await ProductPassport.deploy();
    await productPassport.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await productPassport.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await productPassport.name()).to.equal("MyGreenChain Passport");
      expect(await productPassport.symbol()).to.equal("MGCP");
    });
  });

  describe("Manufacturer Authorization", function () {
    it("Should allow owner to authorize manufacturers", async function () {
      await productPassport.authorizeManufacturer(manufacturer.address);
      expect(await productPassport.authorizedManufacturers(manufacturer.address)).to.be.true;
    });

    it("Should emit ManufacturerAuthorized event", async function () {
      await expect(productPassport.authorizeManufacturer(manufacturer.address))
        .to.emit(productPassport, "ManufacturerAuthorized")
        .withArgs(manufacturer.address);
    });

    it("Should allow owner to revoke manufacturers", async function () {
      await productPassport.authorizeManufacturer(manufacturer.address);
      await productPassport.revokeManufacturer(manufacturer.address);
      expect(await productPassport.authorizedManufacturers(manufacturer.address)).to.be.false;
    });
  });

  describe("Product Registration", function () {
    beforeEach(async function () {
      await productPassport.authorizeManufacturer(manufacturer.address);
    });

    it("Should allow authorized manufacturer to register product", async function () {
      const tx = await productPassport.connect(manufacturer).registerProduct(
        "Eco T-Shirt",
        "GreenTextiles Inc",
        5000, // 5kg CO2
        85, // sustainability score
        "100% Organic Cotton",
        "Portugal",
        "ipfs://QmTest123"
      );

      await expect(tx)
        .to.emit(productPassport, "ProductRegistered")
        .withArgs(1, "Eco T-Shirt", manufacturer.address, 85);

      expect(await productPassport.getTotalProducts()).to.equal(1);
    });

    it("Should prevent unauthorized addresses from registering", async function () {
      await expect(
        productPassport.connect(consumer).registerProduct(
          "Fake Product",
          "Fake Inc",
          1000,
          50,
          "Plastic",
          "Unknown",
          "ipfs://fake"
        )
      ).to.be.revertedWith("Not authorized to register products");
    });

    it("Should reject invalid sustainability scores", async function () {
      await expect(
        productPassport.connect(manufacturer).registerProduct(
          "Bad Product",
          "Test Inc",
          1000,
          150, // invalid score > 100
          "Plastic",
          "China",
          "ipfs://test"
        )
      ).to.be.revertedWith("Sustainability score must be 0-100");
    });

    it("Should mint NFT to manufacturer", async function () {
      await productPassport.connect(manufacturer).registerProduct(
        "Eco T-Shirt",
        "GreenTextiles Inc",
        5000,
        85,
        "100% Organic Cotton",
        "Portugal",
        "ipfs://QmTest123"
      );

      expect(await productPassport.ownerOf(1)).to.equal(manufacturer.address);
    });
  });

  describe("Lifecycle Events", function () {
    let tokenId;

    beforeEach(async function () {
      await productPassport.authorizeManufacturer(manufacturer.address);
      const tx = await productPassport.connect(manufacturer).registerProduct(
        "Eco T-Shirt",
        "GreenTextiles Inc",
        5000,
        85,
        "100% Organic Cotton",
        "Portugal",
        "ipfs://QmTest123"
      );
      tokenId = 1;
    });

    it("Should add lifecycle event", async function () {
      await productPassport.connect(manufacturer).addLifecycleEvent(
        tokenId,
        "transport",
        "Germany",
        500, // 0.5kg CO2 for transport
        "Shipped to distribution center"
      );

      const events = await productPassport.getLifecycleEvents(tokenId);
      expect(events.length).to.equal(2); // production + transport
      expect(events[1].eventType).to.equal("transport");
    });

    it("Should update carbon footprint when adding events", async function () {
      const productBefore = await productPassport.getProduct(tokenId);
      const initialCO2 = productBefore.carbonFootprint;

      await productPassport.connect(manufacturer).addLifecycleEvent(
        tokenId,
        "transport",
        "Germany",
        500,
        "Shipped to distribution center"
      );

      const productAfter = await productPassport.getProduct(tokenId);
      expect(productAfter.carbonFootprint).to.equal(initialCO2 + 500n);
    });
  });

  describe("Recycling", function () {
    let tokenId;

    beforeEach(async function () {
      await productPassport.authorizeManufacturer(manufacturer.address);
      await productPassport.connect(manufacturer).registerProduct(
        "Eco T-Shirt",
        "GreenTextiles Inc",
        5000,
        85,
        "100% Organic Cotton",
        "Portugal",
        "ipfs://QmTest123"
      );
      tokenId = 1;

      // Transfer to consumer
      await productPassport.connect(manufacturer).transferFrom(
        manufacturer.address,
        consumer.address,
        tokenId
      );
    });

    it("Should allow owner to recycle product", async function () {
      await productPassport.connect(consumer).recycleProduct(tokenId);

      const product = await productPassport.getProduct(tokenId);
      expect(product.isRecycled).to.be.true;
      expect(product.recycledDate).to.be.greaterThan(0);
    });

    it("Should emit ProductRecycled event", async function () {
      await expect(productPassport.connect(consumer).recycleProduct(tokenId))
        .to.emit(productPassport, "ProductRecycled")
        .withArgs(tokenId, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });

    it("Should prevent double recycling", async function () {
      await productPassport.connect(consumer).recycleProduct(tokenId);

      await expect(
        productPassport.connect(consumer).recycleProduct(tokenId)
      ).to.be.revertedWith("Already recycled");
    });
  });
});
