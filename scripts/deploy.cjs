const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CampusChain with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const CampusChain = await ethers.getContractFactory("CampusChain");
  const campusChain = await CampusChain.deploy();
  await campusChain.waitForDeployment();

  const address = await campusChain.getAddress();
  console.log("\n✅ CampusChain deployed to:", address);
  console.log("Network: Polygon Mumbai (Chain ID 80001)");
  console.log("View on PolygonScan: https://mumbai.polygonscan.com/address/" + address);

  // Register demo students
  console.log("\n📚 Registering demo students...");
  const students = [
    { addr: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", name: "Arjun Sharma",  balance: ethers.parseEther("12400") },
    { addr: "0x53d284357ec70cE289D6D64134DfAc8E511c8a3", name: "Priya Mehta",    balance: ethers.parseEther("8750")  },
    { addr: "0x4E9ce36E442e55EcD9025B9a6E0D88485d628A9", name: "Rohan Gupta",    balance: ethers.parseEther("15200") },
  ];

  for (const s of students) {
    try {
      const tx = await campusChain.registerStudent(s.addr, s.name, s.balance);
      await tx.wait();
      console.log(`  ✓ Registered ${s.name}`);
    } catch (e) {
      console.log(`  ⚠ Could not register ${s.name} (address may not be on testnet):`, e.message);
    }
  }

  console.log("\n🚀 Deployment complete! Add this to your .env:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log(`VITE_CHAIN_ID=80001`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
