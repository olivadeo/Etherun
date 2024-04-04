const { parseEther } = require("ethers");
const hre = require("hardhat");

//const JAN_1ST_2030 = 1893456000;
//const ONE_GWEI = 1_000_000_000n;

async function main() {
  
  const medicNFT = await hre.ethers.deployContract("MedicalCertificateNFT");
  await medicNFT.waitForDeployment();
  console.log("MedicalCertificateNFT address : "+medicNFT.target);

  const raceOrganizer = await hre.ethers.deployContract("RaceOrganizer");
  await raceOrganizer.waitForDeployment();
  console.log("RaceOrganizer address : "+ raceOrganizer.target);
/*
  try {
    const tx = await raceOrganizer.registerOrganizerBackDoorforFree("0x70997970C51812dc3A010C7d01b50e0d17dc79C8","oliv");
    await tx.wait();
    console.log('Transaction successful');
  } catch (error) {
    console.error('Transaction failed:', error);
  }
*/
  const Runners = await ethers.getContractFactory("Runners");
  const runners = await Runners.deploy(medicNFT.target); 

  await runners.waitForDeployment();
  console.log("Runners address : "+ runners.target);

  const Race = await ethers.getContractFactory("Race");
  const race = await Race.deploy(raceOrganizer.target,runners.target); 

  await race.waitForDeployment();
  console.log("Race address : "+ race.target);

  const Market = await ethers.getContractFactory("TicketMarket");
  const market = await Market.deploy(race.target, runners.target); 

  await market.waitForDeployment();
  console.log("TicketMarket address : "+ market.target);

  await medicNFT.authorizeContract(runners.target);
  await race.authorizeContract(market.target);
  await race.setTicketMarket(market.target);


/*
ADMIN #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
ORGANIZER #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
RUNNER #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
*/


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
