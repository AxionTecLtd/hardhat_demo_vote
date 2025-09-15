# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
# 注意 scripts\DeployBallot.js  VS  test 文件夹下的东西
scripts\DeployBallot.js是 部署 + 演示交互 的流程，主要作用是：
    1.真正把合约部署到某个网络（本地/测试网/主网）
    2.演示“上链调用”的效果（授权、投票、查询）
    3.可以配合 .env 来控制私钥、API KEY
⚡️ 但 test 文件夹下的东西完全不一样，它是 单元测试 / 集成测试