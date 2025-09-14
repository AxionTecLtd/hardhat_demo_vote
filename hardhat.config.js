require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config()

// const { ProxyAgent, setGlobalDispatcher } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);


/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_URL = process.env.SEPOLIA_URL
const SEPOLIA_KEY = process.env.SEPOLIA_KEY
const SEPOLIA_KEY_2 = process.env.SEPOLIA_KEY_2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [SEPOLIA_KEY,SEPOLIA_KEY_2],
      chainId:11155111
    }
  },

      // Obtain one at https://etherscan.io/
   etherscan: {
    apiKey:{
        sepolia:ETHERSCAN_API_KEY
      }
    }
    

};
