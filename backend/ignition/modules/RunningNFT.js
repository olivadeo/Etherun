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
  await race.setTicketMarket(market.target)


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
