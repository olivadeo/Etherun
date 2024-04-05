const { parseEther } = require("ethers");
const hre = require("hardhat");
const { task } = require("hardhat/config");

//const JAN_1ST_2030 = 1893456000;
//const ONE_GWEI = 1_000_000_000n;



task("verify-contract", "Vérify sur Etherscan")
  .addParam("contract", "address")
  .addOptionalParam("args", "args")
  .setAction(async ({ contract, args }, hre) => {
    await hre.run("verify:verify", {
      address: contract,
      constructorArguments: args.split(",") || [],
    });
  });



async function main() {

  const netw = hre.network.name

  const medicNFT = await hre.ethers.deployContract("MedicalCertificateNFT");
  await medicNFT.waitForDeployment();
  console.log("MedicalCertificateNFT address : " + medicNFT.target);

  if (netw == "sepolia") {
    await run("verify-contract", {
      contract: medicNFT.target,
      args: "",
    });
  }

  const raceOrganizer = await hre.ethers.deployContract("RaceOrganizer");
  await raceOrganizer.waitForDeployment();
  console.log("RaceOrganizer address : " + raceOrganizer.target);

  if (netw == "sepolia") {
    await run("verify-contract", {
      contract: raceOrganizer.target,
      args: "",
    });
  }
  const Runners = await ethers.getContractFactory("Runners");
  const runners = await Runners.deploy(medicNFT.target);

  await runners.waitForDeployment();
  console.log("Runners address : " + runners.target);

  if (netw == "sepolia") {
    await run("verify-contract", {
      contract: runners.target,
      args: medicNFT.target,
    });
  }
  const Race = await ethers.getContractFactory("Race");
  const race = await Race.deploy(raceOrganizer.target, runners.target);

  await race.waitForDeployment();
  console.log("Race address : " + race.target);

  if (netw == "sepolia") {
    await run("verify-contract", {
      contract: race.target,
      args: raceOrganizer.target + "," + runners.target,
    });
  }
  const Market = await ethers.getContractFactory("TicketMarket");
  const market = await Market.deploy(race.target, runners.target);

  await market.waitForDeployment();
  console.log("TicketMarket address : " + market.target);

  if (netw == "sepolia") {
    await run("verify-contract", {
      contract: market.target,
      args: race.target + "," + runners.target,
    });
  }

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
