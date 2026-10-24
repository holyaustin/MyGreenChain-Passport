const hre = require("hardhat");

async function main() {
  console.log("Deploying MyGreenChain ProductPassport contract...");

  const ProductPassport = await hre.ethers.getContractFactory("ProductPassport");
  const productPassport = await ProductPassport.deploy();

  await productPassport.waitForDeployment();

  const address = await productPassport.getAddress();
  console.log("ProductPassport deployed to:", address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await productPassport.deploymentTransaction().wait(5);

  console.log("Deployment complete!");
  console.log("\nContract Details:");
  console.log("- Network:", hre.network.name);
  console.log("- Contract Address:", address);
  console.log("\nNext steps:");
  console.log("1. Verify contract: npx hardhat verify --network", hre.network.name, address);
  console.log("2. Update .env with CONTRACT_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
