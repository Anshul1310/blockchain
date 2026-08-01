import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BlindHireEscrow } from '../typechain-types';

describe('BlindHireEscrow Smart Contract Unit Tests', function () {
  let escrowContract: BlindHireEscrow;
  let owner: any;
  let client: any;
  let freelancer: any;

  beforeEach(async function () {
    [owner, client, freelancer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('BlindHireEscrow');
    escrowContract = (await Factory.deploy()) as BlindHireEscrow;
    await escrowContract.waitForDeployment();
  });

  it('Should register user profile CID reference', async function () {
    const testCid = 'QmP9xZ8y7wA4vM1N3L5T6R8S0W7';
    await expect(escrowContract.connect(freelancer).registerProfileCID(testCid))
      .to.emit(escrowContract, 'ProfileCIDRegistered')
      .withArgs(freelancer.address, testCid);

    const rep = await escrowContract.userReputations(freelancer.address);
    expect(rep.latestProfileCID).to.equal(testCid);
  });

  it('Should create project with milestone ETH escrow deposits', async function () {
    const projectCid = 'QmProj101CID';
    const milestoneAmounts = [ethers.parseEther('1.0'), ethers.parseEther('0.5')]; 
    const totalDeposit = ethers.parseEther('1.5');

    await expect(
      escrowContract
        .connect(client)
        .createProject(projectCid, 14, milestoneAmounts, { value: totalDeposit })
    )
      .to.emit(escrowContract, 'ProjectCreated')
      .withArgs(1, client.address, projectCid, totalDeposit, (await ethers.provider.getBlock('latest'))!.timestamp + 14 * 86400);

    const proj = await escrowContract.projects(1);
    expect(proj.client).to.equal(client.address);
    expect(proj.totalBudgetWei).to.equal(totalDeposit);
    expect(proj.milestoneCount).to.equal(2);
  });

  it('Should accept freelancer, upload deliverable CID, and release milestone ETH payment', async function () {
    const milestoneAmounts = [ethers.parseEther('1.0')];
    await escrowContract
      .connect(client)
      .createProject('QmProj101CID', 14, milestoneAmounts, { value: ethers.parseEther('1.0') });

    
    await escrowContract.connect(client).acceptFreelancer(1, freelancer.address);

    
    await escrowContract.connect(freelancer).uploadDeliverableCID(1, 0, 'QmDeliverableCID1');

    
    const initBalance = await ethers.provider.getBalance(freelancer.address);
    await escrowContract.connect(client).releaseMilestonePayment(1, 0);
    const finalBalance = await ethers.provider.getBalance(freelancer.address);

    expect(finalBalance - initBalance).to.equal(ethers.parseEther('1.0'));
  });
});
