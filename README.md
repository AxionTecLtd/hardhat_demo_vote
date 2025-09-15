# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

---

# Hardhat Demo Vote

这是一个使用 Hardhat 框架开发的简单投票合约示例项目，旨在展示如何在以太坊测试网络（如 Sepolia）上部署和交互智能合约。
关联兴趣小站：https://www.axion.website/
---

## 🚀 项目结构

```
hardhat_demo_vote/
├── contracts/            # Solidity 合约源码
│   └── Ballot.sol        # 投票合约
├── scripts/              # 部署脚本
│   └── DeployBallot.js   # 部署投票合约脚本
├── test/                 # 测试用例
├── .env.enc              # 加密的环境变量文件
├── hardhat.config.js     # Hardhat 配置文件
├── package.json          # 项目依赖与脚本
└── README.md             # 项目说明文档
```

---

## 🛠️ 环境要求

* Node.js ≥ 18.x
* npm ≥ 8.x
* Hardhat ≥ 2.x
* Solidity ≥ 0.8.x

---

## 📦 安装依赖

首先，克隆本仓库并安装项目依赖：

```bash
git clone https://github.com/AxionTecLtd/hardhat_demo_vote.git
cd hardhat_demo_vote
npm install
```

---

## 🔐 配置环境变量

将 `.env.enc` 文件解密为 `.env`，并填入以下内容：

```ini
ALCHEMY_API_KEY=你的Alchemy API密钥
PRIVATE_KEY=你的钱包私钥
```

**注意**：请确保私钥仅用于测试网络，切勿在生产环境中使用。

---

## 🔧 部署合约

使用 Hardhat 部署投票合约到 Sepolia 测试网络：

```bash
npx hardhat run scripts/DeployBallot.js --network sepolia
```

部署成功后，合约地址将显示在控制台输出中。

---

## 🧪 测试合约

运行 Hardhat 测试：

```bash
npx hardhat test
```

测试用例位于 `test/` 目录中，使用 Mocha 和 Chai 进行编写。

---

## 🌐 访问合约

部署后，您可以通过以下方式与合约交互：

* 使用 Hardhat 控制台：

  ```bash
  npx hardhat console --network sepolia
  ```
* 使用 Remix IDE 连接到 Sepolia 网络，输入合约地址和 ABI 进行交互。

---

## 📄 许可证

本项目使用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

---

如果您有任何问题或建议，欢迎在 [Issues](https://github.com/AxionTecLtd/hardhat_demo_vote/issues) 中提出。

---

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
---