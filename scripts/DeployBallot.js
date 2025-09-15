const { ethers } = require("hardhat"); // 从 Hardhat 框架里引入 ethers.js，用于与以太坊链交互
const hre = require("hardhat"); // 显式引入 hre（Hardhat Runtime Environment），防止有些版本不能隐式使用
require("dotenv").config(); // 加载 .env 文件里的环境变量（比如 Etherscan API key、私钥）

// 主函数
async function main() {
    // 0.实例化合约工厂
    const BallotFactory = await ethers.getContractFactory("Ballot");
    
    // 1.合约部署 
    // 构造器入参准备
    const proposalNames = ["Support", "Oppose", "Neutral"] ;
    // 部署正式开始
    console.log(`Ballot is deploying...`);
    const Ballot = await BallotFactory.deploy(proposalNames);
    // 等待部署完成 合约真正上链
    await Ballot.waitForDeployment();
    // 打印合约地址
    console.log(`Ballot has been deployed successfully ,the contract adress is ${Ballot.target}`);


    // 2.验证合约（可选) 当前网络（本地 or 测试网）
    /*
    如果网络是 Sepolia (chainId == 11155111) 并且 .env 里有 ETHERSCAN_API_KEY：
    等待 3 个区块确认
    调用 Hardhat 的 verify:verify 插件，自动在 Etherscan 上验证合约。
    否则跳过验证。
    */
    if (hre.network.config.chainId == 11155111 &&process.env.ETHERSCAN_API_KEY ){
            console.log(`Waiting for 3 confirm...`); 
            await Ballot.deploymentTransaction().wait(3); // 等待3个矿工确认交易 
            // 执行验证函数 入参为合约地址 和 构造器入参
            await verifyBallot(Ballot.target, [proposalNames]);
           
    }else{
        // 本地测试网 或者 没有etherscan api key ，则跳过验证
        console.log('Varifications kipped.')
    }
     


    // 3.合约交互（核心部分） ：账户初始化-授权账户投票-投票-提案总票数
    // 0. 获取账户  默认是第一个部署者
    const [account_1,account_2] = await ethers.getSigners();

    // 3.1 account_1
    // 链上交互示例1：授权投票权  部署账户调用函数，给 account_2 授权投票权。
    // 调用合约函数，执行链上交互，用部署账户授权给第二个账户投票授权操作
    const right2 = await Ballot.giveRightToVote(account_2)
    // 等待授权操作,链上交互完成
    await right2.wait();


    // 链上交互示例2：投票
    // account_1 调用 vote(0) 给第 1 个提案投票
    const tx_1 = await Ballot.connect(account_1).vote(0);
    await tx_1.wait();
    console.log("Voted from first account");

    // 链上交互示例3：查看第 2 个提案的当前总票数
    // account_1 调用合约的proposals构造体，查看第2个提案总票数 voteCount 字段
    // ！异步 必须先拿到结构体 再解析字段
    const firstProposalsNum = await Ballot.connect(account_1).proposals(1)
    console.log(`第一个提案总票数:${firstProposalsNum.voteCount}`)
  
   

    // 3.2 account_2
    // 账户切换到 account_2，account_2 调用 vote(0) 给第 1 个提案投票
    const tx_2 = await Ballot.connect(account_2).vote(0);
    await tx_2.wait();
    console.log("Voted from second account");

    // 第二个账户投票后，查看第2个提案总票数 异步 必须先拿到结构体 再解析字段
    // const firstProposalsNum = await Ballot.connect(account_2).proposals(1).voteCount
    const secondProposalsNum = await Ballot.connect(account_2).proposals(1)
    console.log(`第一个提案当前总票数:${secondProposalsNum.voteCount}`)



    // 3.3 链上交互示例3：获胜提案的名字（任一账户）
    const  winningProposalName = await Ballot.connect(account_1).winningProposalName()
    console.log(`获胜提案名为:${winningProposalName}`)

    // 获胜提案的票数（任一账户）
    const  winningProposalNum = await Ballot.connect(account_1).winningProposal()
    console.log(`获胜提案票数:${winningProposalNum}`)


}



// 附：定义验证函数内容
async function verifyBallot(_ballotAdress, _args) {
    await hre.run(
        "verify:verify",
        {
            address: _ballotAdress,
            constructorArguments: _args,
        })
}



// 执行主函数，捕获异常
main()
    // 成功退出
    .then(() => process.exit(0)) 
    // 捕获异常，打印错误信息，退出进程
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }
    )