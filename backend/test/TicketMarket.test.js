

  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  
  require('chai').assert
  
  describe("Ticket Market tests", function () {
    let ticketMarket;
    let owner;
    let runner1;
    let runner2;
    let race;
    let raceOrganizer;
    let runners;
    let medicalCertificateNFT;


  beforeEach(async function () {
    [owner, runner1, runner2, organizer] = await ethers.getSigners();

    const RaceOrganizer = await ethers.getContractFactory("RaceOrganizer");
    raceOrganizer = await RaceOrganizer.deploy();

    const Medic = await ethers.getContractFactory("MedicalCertificateNFT");
    medicalCertificateNFT = await Medic.deploy();

    const Runners = await ethers.getContractFactory("Runners");
    runners = await Runners.deploy(medicalCertificateNFT.target);

    const Race = await ethers.getContractFactory("Race");
    race = await Race.deploy(raceOrganizer.target,runners.target);
    
    const TicketMarket = await ethers.getContractFactory("TicketMarket");
    ticketMarket = await TicketMarket.deploy(race.target, runners.target);

    await medicalCertificateNFT.authorizeContract(runners.target);
    await race.authorizeContract(ticketMarket.target);
    await race.setTicketMarket(ticketMarket.target);

    await raceOrganizer.connect(organizer).registerOrganizer("Organizer 1", { value: ethers.parseEther("0.03") });
    await race.connect(organizer).createRace("race 1", 10, ethers.parseEther("0.03"), organizer,'',Math.floor(Date.now() / 1000));
    
    await runners.connect(runner1).registerRunner('nom', 'Prenom', 25, { value: ethers.parseEther('0.01') });
    await runners.connect(runner2).registerRunner('nom2', 'Prenom2', 25, { value: ethers.parseEther('0.01') });
    await runners.connect(runner1).setMedicalCertificate(runner1.address, 'ipfs_hash', 'nft_url');
    await runners.connect(runner2).setMedicalCertificate(runner2.address, 'ipfs_hash', 'nft_url');

    await runners.connect(owner).validatePendingMedicalCertificates();
    
    await race.connect(runner1).registerRunner(0,'metadata', { value: ethers.parseEther("0.03")});

  });

  it("should emit event and send a ticket on the market from race contract", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; //token créé dans l'init

    await expect(race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01")))
    .to.emit(race,"TicketPutOnMarketForSale")
    .withArgs(0,tokenId, runner1, ethers.parseEther("0.01"));
  });

  it("should emit event in TicketMarket after transfert from race contract", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; //token créé dans l'init

    await expect(race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01")))
    .to.emit(ticketMarket,"TicketReceivedOnMarket")
    .withArgs(0,0,tokenId,runner1,ethers.parseEther("0.01"),1);

  });

  it("should revert (OnReceive ERC721) if trying to put on market an already ticket on sale", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; //token créé dans l'init
    
    race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01"))

    await expect(ticketMarket.connect(runner1).onERC721Received(runner1,ticketMarket,tokenId,"0x012345"))
    .to.be.revertedWith("Ticket is already to sale");
  });

  it("should revert (OnReceive ERC721) if trying to put on market a false token Id ", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; //token créé dans l'init
    
    race.connect(runner1).putTicketOnMarketForSale(0,1,ethers.parseEther("0.01"))

    await expect(ticketMarket.connect(runner1).onERC721Received(runner1,ticketMarket,1,"0x012345"))
    .to.be.revertedWith("No selling price");
  });

  it("should emit event a Ticket sold on market message after a purchase of ticket", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; //token créé dans l'init

    await expect(race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01")))
    .to.emit(race,"TicketPutOnMarketForSale")
    .withArgs(0,tokenId, runner1, ethers.parseEther("0.01"));

    await expect(ticketMarket.connect(runner2).buyTicket(0, { value: ethers.parseEther('0.01') }))
    .to.emit(ticketMarket,"TicketSoldOnMarket")
    .withArgs(0,0, tokenId, runner1, ethers.parseEther("0.01"),runner2);

  });

  it("should revert the purchase if wrong price sent", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; 

    race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01"))

    await expect(ticketMarket.connect(runner2).buyTicket(0, { value: ethers.parseEther('0.02') }))
    .to.be.revertedWith("please provide the expected amount");

  });

  it("should returns the seller address for a ticket", async function () {
   
    const tick = await race.getTicketsByRunner(runner1);
    const tokenId = tick[0][1]; 

    await race.connect(runner1).putTicketOnMarketForSale(0,tokenId,ethers.parseEther("0.01"))
    const seller = await ticketMarket.connect(runner2).getTicketOnSaleSeller(0)
   
    expect(seller).to.equals(runner1.address)

  });



 


});