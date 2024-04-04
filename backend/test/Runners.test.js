

  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  require('chai').assert
  
  describe("Runners tests", function () {
    let runners;
    let owner;
    let runner1;
    let medicalCertificateNFTContract;


  beforeEach(async function () {
    [owner, runner1, runner2] = await ethers.getSigners();  

    const Medic = await ethers.getContractFactory("MedicalCertificateNFT");
    medicalCertificateNFTContract = await Medic.deploy();

    const Runner = await ethers.getContractFactory("Runners");
    runners = await Runner.deploy(medicalCertificateNFTContract.target);

    await medicalCertificateNFTContract.authorizeContract(runners.target);

    
  });

  it('should register a runner', async function () {
    await runners.connect(runner1).registerRunner('Alice', 'Runner', 25, { value: ethers.parseEther('0.01') });

    const runner = await runners.getRunnerById(runner1.address);
    expect(runner.isRegistered).to.be.true;
    expect(runner.firstName).to.equal('Alice');
    expect(runner.lastName).to.equal('Runner');
    expect(runner.age).to.equal(25);
    expect(runner.isMedicalCertificateValidated).to.be.false;
  });

  it('should get a runner if msg.sender', async function () {
    await runners.connect(runner1).registerRunner('Alice', 'Runner', 25, { value: ethers.parseEther('0.01') });

    const runner = await runners.connect(runner1).getRunnerById(runner1.address);
    expect(runner.firstName).to.equal('Alice');
  });

  it('should NOT get a runner if NOT Owner', async function () {
    await runners.connect(runner1).registerRunner('Alice', 'Runner', 25, { value: ethers.parseEther('0.01') });

    await expect(runners.connect(runner2).getRunnerById(runner1.address))
    .to.be.revertedWith("You are not authorized");

    
  });

  it('should set medical certificate for a runner', async function () {
    await runners.connect(runner1).registerRunner('Alice', 'Runner', 25, { value: ethers.parseEther('0.01') });

    const ipfsCertificateHash = 'ipfs_hash_of_certificate';
    const nftUrl = 'nft_url';

    await runners.connect(runner1).setMedicalCertificate(runner1.address, ipfsCertificateHash, nftUrl);

    const runner = await runners.getRunnerById(runner1.address);
    expect(runner.medicalCertificate).to.equal(ipfsCertificateHash);
    expect(runner.medicalCertificateNftUrl).to.equal(nftUrl);
    expect(runner.isMedicalCertificateValidated).to.be.false;
  });

  it('should NOT set medical certificate for a runner dur to NOT msg.sender', async function () {
    await runners.connect(runner1).registerRunner('Alice', 'Runner', 25, { value: ethers.parseEther('0.01') });

    const ipfsCertificateHash = 'ipfs_hash_of_certificate';
    const nftUrl = 'nft_url';

    await expect (runners.connect(runner2).setMedicalCertificate(runner1.address, ipfsCertificateHash, nftUrl))
    .to.be.revertedWith("You are not authorized");
  
  });

  it('should NOT set medical certificate for a runner dur to NOT registered as Runner', async function () {
    
    const ipfsCertificateHash = 'ipfs_hash_of_certificate';
    const nftUrl = 'nft_url';
    await expect (runners.connect(runner2).setMedicalCertificate(runner2.address, ipfsCertificateHash, nftUrl))
    .to.be.revertedWith("You are not registered as a runner");
  });

  it('should NOT validate pending medical certificates due to nothing to validate', async function () {
    await expect(runners.connect(owner).validatePendingMedicalCertificates())
    .to.be.revertedWith("Nothing to validate");
  });

  it('should NOT validate pending medical certificates if NOT owner', async function () {
    await expect(runners.connect(runner1).validatePendingMedicalCertificates())
    .to.be.revertedWithCustomError(runners,"OwnableUnauthorizedAccount");
  });

  it('should validate pending medical certificates', async function () {
    await runners.connect(runner1).registerRunner('prenom', 'nom ', 25, { value: ethers.parseEther('0.01') });
    await runners.connect(owner).validatePendingMedicalCertificates();

    const runner = await runners.getRunnerById(runner1.address);
    expect(runner.isMedicalCertificateValidated).to.be.true;
  });

  it('should return false if runner is not registered', async function () {
    const isRegisteredAndValid = await runners.isRunnerRegisteredAndHasAValidMedicalCertificate(runner1.address);
    expect(isRegisteredAndValid).to.equal(false);
  });
  
  it('should return false if runner is registered but medical certificate is not validated', async function () {
    await runners.registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') });
  
    const isRegisteredAndValid = await runners.isRunnerRegisteredAndHasAValidMedicalCertificate(runner1.address);
    expect(isRegisteredAndValid).to.equal(false);
  });
  
  it('should return true if runner is registered and medical certificate is validated', async function () {

    await runners.connect(runner1).registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') });
    await runners.connect(runner1).setMedicalCertificate(runner1.address, 'ipfs_hash', 'nft_url');
    await runners.connect(owner).validatePendingMedicalCertificates();

    const isRegisteredAndValid = await runners.isRunnerRegisteredAndHasAValidMedicalCertificate(runner1.address);
    expect(isRegisteredAndValid).to.equal(true);
  });

  it('should return false if runner is registered and medical certificate is  NOT validated', async function () {

    await runners.connect(runner1).registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') });

    const isRegisteredAndValid = await runners.isRunnerRegisteredAndHasAValidMedicalCertificate(runner1.address);
    expect(isRegisteredAndValid).to.equal(false);
  });

  it('should not register runner if already registered', async function () {

    await runners.connect(runner1).registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') });
    await expect(runners.connect(runner1).registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') }))
    .to.be.revertedWith("You are already registered as a runner");
    
  });
  
  it('should not register runner if NO first name', async function () {

    await expect(runners.connect(runner1).registerRunner('', 'nom', 30, { value: ethers.parseEther('0.01') }))
    .to.be.revertedWith("Please give your first name");
  });
  it('should not register runner if NO last name', async function () {

    await expect(runners.connect(runner1).registerRunner('prenom', '', 30, { value: ethers.parseEther('0.01') }))
    .to.be.revertedWith("Please give your last name");
  });
  it('should not register runner if NO age', async function () {

    await expect(runners.connect(runner1).registerRunner('prenom', 'nom', 0, { value: ethers.parseEther('0.01') }))
    .to.be.revertedWith("Please give your age");
  });
  it('should not register runner if wrong fee for registration', async function () {

    await expect(runners.connect(runner1).registerRunner('prenom', 'nom', 10, { value: ethers.parseEther('0.02') }))
    .to.be.revertedWith("The registration cost on the platform is 0.01 ETH");
  });


  it("Should allow the owner to withdraw contract balance", async function () {
    await runners.connect(runner1).registerRunner('prenom', 'nom', 30, { value: ethers.parseEther('0.01') });

    const initialBalance = await ethers.provider.getBalance(owner.address);

    await expect(runners.connect(owner).withdraw())
      .to.emit(runners, "RunnerBalanceCollected")
      .withArgs(owner.address, ethers.parseEther("0.01"));

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Should NOT allow  to withdraw contract balance if not owner", async function () {
    await expect(runners.connect(runner1).withdraw())
    .to.be.revertedWithCustomError(runners,"OwnableUnauthorizedAccount");
  });

  
});