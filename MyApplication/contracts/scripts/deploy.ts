import { ethers } from 'hardhat';

async function main() {
  console.log('==================================================');
  console.log('🚀 Deploying BlindHireEscrow to Sepolia Testnet...');
  console.log('==================================================');

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Wallet Address: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer ETH Balance: ${ethers.formatEther(balance)} ETH`);

  const BlindHireEscrowFactory = await ethers.getContractFactory('BlindHireEscrow');
  const escrowContract = await BlindHireEscrowFactory.deploy();

  await escrowContract.waitForDeployment();

  const contractAddress = await escrowContract.getAddress();
  console.log(`==================================================`);
  console.log(`✅ BlindHireEscrow Deployed Successfully!`);
  console.log(`📍 Sepolia Contract Address: ${contractAddress}`);
  console.log(`==================================================`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment Failed:', error);
    process.exit(1);
  });
