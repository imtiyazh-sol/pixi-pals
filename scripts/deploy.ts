import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", (await deployer.getBalance()).toString());

  const PixiPals = await ethers.getContractFactory("PixiPals");
  const contract = await PixiPals.deploy("PixiPals", "PIXI");
  await contract.deployed();

  console.log("PixiPals deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
