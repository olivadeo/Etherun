require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

require('hardhat-docgen');

const PK = process.env.PK || "";
const RPC_URL=process.env.RPC_URL || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia : {
      url: RPC_URL ,
      chainId: 11155111,
      accounts: [`0x${PK}`]
    }
  },
  //solidity: "0.8.20",
  etherscan:{
    apiKey:{
      sepolia:ETHERSCAN
    }
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  }
 
};