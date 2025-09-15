// 注意每个都有分号
require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("solidity-coverage");
require("hardhat-gas-reporter");

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
      // accounts 数组里要传字符串私钥（带 0x 前缀）
      accounts: [SEPOLIA_KEY,SEPOLIA_KEY_2], // 确保是字符串
      chainId:11155111
    }
  },

    // Obtain one at https://etherscan.io/
    // 用于自动合约验证。
   etherscan: {
    apiKey:{
        sepolia:ETHERSCAN_API_KEY
      }
    },
  gasReporter: {
    enabled: true,        // 启用 Gas 报告
    currency: "USD",      // 显示美元
    showTimeSpent: true,  // 显示执行时间
    gasPrice: 20,         // 可选：默认 Gwei
    coinmarketcap: null   // 可选：如果填入 CoinMarketCap API Key，会自动获取 ETH 实时价格
  },

};
