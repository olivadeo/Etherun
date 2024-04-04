//const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { parseEther } = require("ethers");
const hre = require("hardhat");

//const JAN_1ST_2030 = 1893456000;
//const ONE_GWEI = 1_000_000_000n;


async function main() {
  
  
  const raceOrganizer = await ethers.getContractFactory("RaceOrganizer");
  const tx = await raceOrganizer.registerOrganizerBackDoorforFree("0x70997970C51812dc3A010C7d01b50e0d17dc79C8","oliv");
  await tx.wait();

  await raceOrganizer.waitForDeployment();
  console.log("RaceOrganizer address : "+ raceOrganizer.target);





  //function createRace(uint _maxTickets, uint _ticketPrice, address payable _organizer, string memory _ipfsLogo, uint _raceDate) external  {
//    function registerOrganizer(string memory _name) external payable {

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
/*
module.exports = buildModule("RunningNFTModule", (m) => {
 // const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  //const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  const medicNFT = m.contract("MedicalCertificateNFT");
  m.contract.
  console.log(medicNFT);

  await hre.ethers.deployContract("Voting");

  await voting.waitForDeployment();

  console.log(
    `Voting with deployed to ${voting.target}`
  );
  

});*/
