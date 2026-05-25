const hre = require("hardhat");

async function main() {
  const AgapayClaims = await hre.ethers.deployContract("AgapayClaims");
  await AgapayClaims.waitForDeployment();

  console.log(`AgapayClaims contract deployed to ${AgapayClaims.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
