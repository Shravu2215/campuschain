/**
 * CampusChain Local Blockchain Setup
 * Deploys real smart contract to local Hardhat node
 * Run: node scripts/localSetup.cjs
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔗 Starting CampusChain local blockchain...\n");

  const [admin, student1, student2, student3, student4, canteen, accounts_dept] = await ethers.getSigners();

  console.log("📋 Deploying CampusChain.sol...");
  const CampusChain = await ethers.getContractFactory("CampusChain");
  const contract = await CampusChain.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ Contract deployed at: ${address}`);
  console.log(`   Admin: ${admin.address}`);

  // Register students
  const students = [
    { signer: student1, name: "Arjun Sharma",  balance: ethers.parseEther("5000") },
    { signer: student2, name: "Priya Mehta",   balance: ethers.parseEther("5000") },
    { signer: student3, name: "Rohan Gupta",   balance: ethers.parseEther("5000") },
    { signer: student4, name: "Sneha Patil",   balance: ethers.parseEther("5000") },
    { signer: canteen,  name: "Central Canteen", balance: ethers.parseEther("0") },
    { signer: accounts_dept, name: "Accounts Dept", balance: ethers.parseEther("0") },
  ];

  console.log("\n📚 Registering students...");
  for (const s of students) {
    await contract.registerStudent(s.signer.address, s.name, s.balance);
    console.log(`  ✓ ${s.name} (${s.signer.address.slice(0,10)}...) — ${ethers.formatEther(s.balance)} CPC`);
  }

  // Save addresses to a JSON file for frontend to read
  const fs = require("fs");
  const config = {
    contractAddress: address,
    adminAddress: admin.address,
    students: students.map((s, i) => ({
      name: s.name,
      address: s.signer.address,
      balance: ethers.formatEther(s.balance),
      privateKey: `hardhat_account_${i}` // placeholder — real keys in hardhat config
    })),
    network: "hardhat-local",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545"
  };

  fs.writeFileSync("./src/utils/contractConfig.json", JSON.stringify(config, null, 2));
  console.log("\n📄 Contract config saved to src/utils/contractConfig.json");
  console.log("\n🚀 Local blockchain is ready!");
  console.log(`   RPC URL: http://127.0.0.1:8545`);
  console.log(`   Chain ID: 31337`);
  console.log(`   Contract: ${address}`);
  console.log("\n   Add to MetaMask (optional):");
  console.log("   Network Name: CampusChain Local");
  console.log("   RPC URL: http://127.0.0.1:8545");
  console.log("   Chain ID: 31337");
  console.log("   Currency: CPC\n");
}

main().catch(console.error);
