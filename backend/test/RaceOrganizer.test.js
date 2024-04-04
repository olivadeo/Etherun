

  const { expect } = require("chai");
  const { ethers } = require("hardhat");

  require('chai').assert
  
  describe("RaceOrganizer tests", function () {
    let owner;
  let organizer;
  let RaceOrganizer;
  let raceOrganizer;

  beforeEach(async function () {
    [owner, organizer, userx] = await ethers.getSigners();
    RaceOrganizer = await ethers.getContractFactory("RaceOrganizer");
    raceOrganizer = await RaceOrganizer.deploy();
  });

  it("Should deploy the contract", async function () {
    expect(raceOrganizer.target).to.not.be.undefined;
  });

  it("Should register an organizer", async function () {
    const name = "Organizer 1";
    await expect(raceOrganizer.connect(organizer).registerOrganizer(name, { value: ethers.parseEther("0.03") }))
      .to.emit(raceOrganizer, "OrganizerRegistered")
      .withArgs(organizer.address, name);

    const isRegistered = await raceOrganizer.isOrganizerRegistred(organizer.address);
    expect(isRegistered).to.be.true;

    const organizerInfo = await raceOrganizer.getOrganizerById(organizer.address);
    expect(organizerInfo.name).to.equal(name);
  });

  it("Should Get organizer if him ", async function () {
    
    await raceOrganizer.connect(organizer).registerOrganizer("organizer1", { value: ethers.parseEther("0.03") });
    
    const organizerInfo = await raceOrganizer.connect(organizer).getOrganizerById(organizer)
    expect(organizerInfo.name).to.equal("organizer1");
  });

  it("Should not Get organizer if not him or owner", async function () {
    
    await raceOrganizer.connect(organizer).registerOrganizer("organizer1", { value: ethers.parseEther("0.03") });
    
    await expect(raceOrganizer.connect(userx).getOrganizerById(organizer))
      .to.be.revertedWith("You are not authorized");
  });

  it("Should not register an already registered organizer", async function () {
    const name = "Organizer 1";
    await raceOrganizer.connect(organizer).registerOrganizer(name, { value: ethers.parseEther("0.03") });
    
    await expect(raceOrganizer.connect(organizer).registerOrganizer(name, { value: ethers.parseEther("0.03") }))
      .to.be.revertedWith("You are already registered as an organizer");
  });

  it("Should not register an organizer with incorrect value", async function () {
    const name = "Organizer 1";
    await expect(raceOrganizer.connect(organizer).registerOrganizer(name, { value: ethers.parseEther("0.01") }))
      .to.be.revertedWith("Registering as Organizer cost : 0.03 ETH");
  });

  it("Should emit EtherReceived event on receiving Ether", async function () {
    const transaction = {
      to: raceOrganizer.target,
      value: ethers.parseEther("0.1")
    };

    await expect(owner.sendTransaction(transaction))
      .to.emit(raceOrganizer, "EtherReceived")
      .withArgs(owner.address, transaction.value);
  });
  
  it("Should allow the owner to withdraw contract balance", async function () {
    await raceOrganizer.connect(organizer).registerOrganizer("Organizer 1", { value: ethers.parseEther("0.03") });

    const initialBalance = await ethers.provider.getBalance(owner.address);

    await expect(raceOrganizer.connect(owner).withdraw())
      .to.emit(raceOrganizer, "RaceOrganizerBalanceCollected")
      .withArgs(owner.address, ethers.parseEther("0.03"));

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Should NOT allow to withdraw contract balance if not owner", async function () {
    
    await expect(raceOrganizer.connect(organizer).withdraw())
    .to.be.revertedWithCustomError(raceOrganizer,"OwnableUnauthorizedAccount");
  });
  
});