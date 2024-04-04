

  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  require('chai').assert
  
  describe("Medical Certificate tests", function () {
    let MedicalCertificateNFT;
    let mcNFT;
    let owner;
    let authorizedContract;

  beforeEach(async function () {
    [owner, authorizedContract, unAuthorizedContract, userx] = await ethers.getSigners();

    const Medic = await ethers.getContractFactory("MedicalCertificateNFT");
    medicalCertificateNFTContract = await Medic.deploy();
    
  });

  it("should mint a medical certificate NFT", async function () {
    await medicalCertificateNFTContract.authorizeContract(authorizedContract.address);
    await expect(medicalCertificateNFTContract.mintMedicalCertificateNFT(owner.address, "metadata"))
      .to.emit(medicalCertificateNFTContract, "Transfer");
    
      expect(await medicalCertificateNFTContract.balanceOf(owner.address)).to.equal(1);
  });

  it("should not mint a medical certificate NFT from an unregistered contract", async function () {
    await medicalCertificateNFTContract.authorizeContract(authorizedContract.address);
   
    await expect(medicalCertificateNFTContract.connect(unAuthorizedContract).mintMedicalCertificateNFT(owner.address, "metadata"))
      .to.be.revertedWith("Not authorized");
  });

  it("should authorize a contract", async function () {
    await expect(medicalCertificateNFTContract.authorizeContract(authorizedContract.address))
      .to.emit(medicalCertificateNFTContract, "ContractAuthorized")
      .withArgs(authorizedContract.address);
   
  });
  it("should NOT authorize a contract due to not Owner", async function () {
    await expect(medicalCertificateNFTContract.connect(userx).authorizeContract(authorizedContract.address))
    .to.be.revertedWithCustomError(medicalCertificateNFTContract,"OwnableUnauthorizedAccount");
   
  });


  
});