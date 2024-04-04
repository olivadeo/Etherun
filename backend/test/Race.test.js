

const { expect } = require("chai");
const { ethers } = require("hardhat");

require('chai').assert

describe("Race tests", function () {
  let Race;
  let race;
  let owner;
  let addr1;
  let runner1;
  let runner2;


  beforeEach(async function () {
    [owner, runner1, runner2, runner3, organizer] = await ethers.getSigners();

    const RaceOrganizer = await ethers.getContractFactory("RaceOrganizer");
    raceOrganizer = await RaceOrganizer.deploy();

    const Medic = await ethers.getContractFactory("MedicalCertificateNFT");
    medicalCertificateNFT = await Medic.deploy();

    const Runners = await ethers.getContractFactory("Runners");
    runners = await Runners.deploy(medicalCertificateNFT.target);

    const Race = await ethers.getContractFactory("Race");
    race = await Race.deploy(raceOrganizer.target, runners.target);

    await medicalCertificateNFT.authorizeContract(runners.target);

    await runners.connect(runner1).registerRunner('nom', 'Prenom', 25, { value: ethers.parseEther('0.01') });
    await runners.connect(runner2).registerRunner('nom2', 'Prenom2', 25, { value: ethers.parseEther('0.01') });
    await runners.connect(runner1).setMedicalCertificate(runner1.address, 'ipfs_hash', 'nft_url');
    await runners.connect(runner2).setMedicalCertificate(runner2.address, 'ipfs_hash', 'nft_url');
    await runners.connect(owner).validatePendingMedicalCertificates();

    await runners.connect(runner3).registerRunner('nom3', 'Prenom3', 25, { value: ethers.parseEther('0.01') });


    /*
        await raceOrganizer.connect(organizer).registerOrganizer("Organizer 1", { value: ethers.parseEther("0.03") });
        await race.connect(organizer).createRace("race 1", 10, ethers.parseEther("0.03"), organizer,'',Math.floor(Date.now() / 1000));
        
        await runners.connect(runner1).registerRunner('nom', 'Prenom', 25, { value: ethers.parseEther('0.01') });
        await runners.connect(runner2).registerRunner('nom2', 'Prenom2', 25, { value: ethers.parseEther('0.01') });
        await runners.connect(runner1).setMedicalCertificate(runner1.address, 'ipfs_hash', 'nft_url');
        await runners.connect(runner2).setMedicalCertificate(runner2.address, 'ipfs_hash', 'nft_url');
    
        await runners.connect(owner).validatePendingMedicalCertificates();
        
        await race.connect(runner1).registerRunner(0,'metadata', { value: ethers.parseEther("0.03")});
    */
  });


  it('should create a race', async function () {
    // Create a race
    await expect(race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000)))
    .to.emit(race,"RaceCreated")
    .withArgs(0,100,ethers.parseEther("0.01"));
   
  });

  it('should not create a race due to not Owner / Organizer', async function () {
    // Create a race
    await expect(race.connect(organizer).createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000)))
    .to.be.revertedWith("Not a registered organizer");
  });
  
  
  it('should register a runner for a race', async function () {
    // Create a race  
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") })
    
    const tickets = await (race.getTicketsByRunner(runner1));
    
    await expect(tickets[0][2]).to.equals(0); // race id
    await expect(tickets[0][0]).to.equals(0); //ticket Id

  });

  it('should not register a runner due to no ticket left to sale', async function () {
    // Create a race  
    await race.createRace("Race", 1, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") })

    await expect(race.connect(runner2).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))
    .to.be.revertedWith("No more tickets available");
  });

  it('should not register a runner due to wrong sent price', async function () {
    // Create a race  
    await race.createRace("Race", 10, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") })

    await expect(race.connect(runner2).registerRunner(0, "metadata", { value: ethers.parseEther("0.02") }))
    .to.be.revertedWith("Please provide the right ticket price ");
  });

  it('should not register a runner due to already has a ticket', async function () {
    // Create a race  
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") })

    await expect(race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))
    .to.be.revertedWith("You already have a ticket for the race")

  });

  it('should not register a runner due to already NO medical certificate', async function () {
    // Create a race  
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));

    await expect(race.connect(runner3).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))
    .to.be.revertedWith("You must be registered and have a medical certificate NFT to register for the race")

  });

  it("Should allow the owner to withdraw contract balance", async function () {
    
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") })
    
    const initialBalance = await ethers.provider.getBalance(owner.address)

    await expect(race.connect(owner).withdraw())
      .to.emit(race, "RaceBalanceCollected")
      .withArgs(owner.address, ethers.parseEther("0.001")); 

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("Should not get Ticket if not runner ", async function () {
      await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
      await (race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))

      await expect(race.connect(runner2).getTicketsByRunner(runner1))
      .to.be.revertedWith("You are not authorized");
    
  });
  
  it("should not send ticket to market due to not owner", async function () {
   
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await (race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))

    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; 

    await expect(race.connect(runner2).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01")))
    .to.be.revertedWith("Not owner or not found or already to sale on market");

  });

  it("should not send ticket to market due no price set", async function () {
   
    await race.createRace("Race", 100, ethers.parseEther("0.01"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000));
    await (race.connect(runner1).registerRunner(0, "metadata", { value: ethers.parseEther("0.01") }))

    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; 

    await expect(race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0")))
    .to.be.revertedWith("No price provided");

  });





/*
  it('should put a ticket on market for sale', async function () {
    // Create a race
    await race.createRace("My Race", 100, ethers.utils.parseEther("0.1"), owner.address, "ipfsLogoHash", Math.floor(Date.now() / 1000) + 3600);
    // Register a runner
    await race.connect(addr1).registerRunner(0, "metadata", { value: ethers.utils.parseEther("0.1") });
    // Put a ticket on market for sale
    await race.connect(addr1).putTicketOnMarketForSale(0, 0, ethers.utils.parseEther("0.2"));
    // Check if the ticket is put on market for sale
    expect(await race.runnerTickets(addr1.address, 0)).to.equal();
    // Add more checks if needed
  });
*/




});