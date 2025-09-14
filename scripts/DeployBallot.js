const { ethers } = require("hardhat");
const hre = require("hardhat"); //避免有些版本的 Hardhat 不支持隐式 hre

// 主函数
async function main() {
    // 0.实例化
    const BallotFactory = await ethers.getContractFactory("Ballot");
    // 0.构造器入参
    const proposalNames = ["Support", "Oppose", "Neutral"] ;
    // 1.1 开始部署
    console.log(`Ballot is deploying...`);
    const Ballot = await BallotFactory.deploy(proposalNames);
    //1.2 等待部署完成
    await Ballot.waitForDeployment();
    console.log(`Ballot has been deployed successfully ,the contract adress is ${Ballot.target}`);

    // 合约验证 本地或者线上测试网
    if (hre.network.config.chainId == 11155111 &&process.env.ETHERSCAN_API_KEY ){
            // 等待3个矿工确认交易 
            console.log(`Waiting for 3 confirm...`);
            await Ballot.deploymentTransaction().wait(3);// 有些版本的 Hardhat 的合约对象里没有 .deploymentTransaction
            // 线上验证合约
            // await verifyBallot(Ballot.target,proposalNames);
            await verifyBallot(Ballot.target, [proposalNames]);
           
    }else{
        console.log('Varifications kipped.')
    }
     

    // 合约交互
    // 授权给第二个账户
    // 0. 初始化账户地址名 
 const [account_1,account_2] = await ethers.getSigners();

  // 1.用部署账户授权给第二个账户 投票授权操作-交易
 const right2 = await Ballot.giveRightToVote(account_2)
 // 等待授权操作-交易完成
  await right2.wait();


  // 2.投票
  // 2.1 第一个账户投票 给第2个提案
  const tx_1 = await Ballot.connect(account_1).vote(0);
  await tx_1.wait();
  // 第一个账户投票后，查看第2个提案总票数
   const firstProposalsNum = await Ballot.connect(account_1).proposals(1)
   console.log(`第一个提案总票数为:${firstProposalsNum.voteCount}`)
  
   
  // 2.2 基于已经有合约实例 `Ballot`
    const tx_2 = await Ballot.connect(account_2).vote(0);
    await tx_2.wait();
    console.log("Voted from second account");
 // 第二个账户投票后，查看第2个提案总票数 异步 必须先拿到结构体 再解析字段
//    const firstProposalsNum = await Ballot.connect(account_2).proposals(1).voteCount
    const secondProposalsNum = await Ballot.connect(account_2).proposals(1)
   console.log(`第一个提案总票数为:${secondProposalsNum.voteCount}`)

// 2.3 任一账户查看获胜提案名
const  winningProposalName = await Ballot.connect(account_1).winningProposalName()
console.log(`获胜提案名为:${winningProposalName}`)

//  任一账户查看获胜提案票数
const  winningProposalNum = await Ballot.connect(account_1).winningProposal()
console.log(`获胜提案票数:${winningProposalNum}`)

}



// 附：验证函数内容定义
 async function verifyBallot(_ballotAdress,_args) {
        await hre.run(
            "verify:verify",
            {
                address: _ballotAdress,
                constructorArguments: _args,
            } )
        }



// 执行
main()
    .then(() => process.exit(0))
    .catch(
        (error) => {
            console.error(error);
            process.exit(1)

        }
    )