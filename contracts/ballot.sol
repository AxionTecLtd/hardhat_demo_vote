
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/// @title 模拟投票系统  委托投票
/// @author Lang
/// @notice 您只能将此合约用于最基本的模拟演示
/// @dev 本章主要内容的实战练习
/// @custom:experimental 这是实验的合约。
/**
每个选票创建一个合约，为每个选项提供一个简短的名称。
然后，作为主席的合约创建者将逐个地址授予投票权。
地址背后的人可以选择自己投票或将他们的投票委托给他们信任的人。
在投票时间结束时，winningProposal() 将返回获得最多票数的提案。
如果写了 tie-break（平票决策规则），会返回特定的赢家；如果没写，就取第一个最大值。
*/
contract Ballot {
    /*
     * ========================================
     * TYpe Declaration    声明类型
     * ========================================
     */
    // 用struct 声明新的复合类型(Type) 以存储之后的变量
    // 1. struct 声明一个选民类型 Voter
    struct Voter{
        uint        weight        ;  // 权重
        bool        voted         ;  // 是否投票
        address     delegate      ;  // 委托人
        uint        vote          ;  // 投票提案的索引  
    }
   // 2. struct 声明一个提案类型
   struct Proposal {
        string      name           ;  // 提案的简称
        uint         voteCount      ;  // 提案的得票数
   }

    /*
     * ============================================================================
     * State Variables    创建状态变量：主席、选民表 Voters 、提案表 proposals
     * ============================================================================
     */
     // 主席
     address public chairperson;
     //  选民表 Voters 
     /// @notice 通过mapping映射表，绑定每个投票人（地址类型）adress和选民类型Voter，创建一个状态变量——选民表 Voters 
     /// @dev 为每个可能的地址存储一个 `Voter`，绑定关联关系，方便快速查询
     mapping (address=>Voter) public Voters;
     // 提案表 proposals
     /// @notice 通过引用数据类型 proposal[] ,创建一个proposal类型的动态数组——提案表 proposals
     /// @dev 存储提案和得票数数据  注意 结构体大写 Proposal
     Proposal[] public proposals;
    /**
    * =======================================================
    * Events    事件声明
    * =======================================================
    */
    // 事件声明（Events）← 将 event 移动至此处
    event VoterRightGranted(address voter);

    /**
    * =======================================================
    * Constructor    构造函数
    * =======================================================
    */
    /// @notice 用于初始化准备设置
    /// @dev 只会在合约部署时自动执行，只运行一次。后续不可修改
    // 为每个提案设定一个新的投票表决
    // proposalNames参数：是一个 string[]数组，用来存放所有候选提案 
    constructor (string[] memory proposalNames){ // 用string[]  而不是string 是为了节省存储和gas 
        // 设置部署合约的地址（人）为主席
        chairperson = msg.sender;
        // 在选民表中，将主席的投票权重设为1，用来确保主席一开始就有投票权
        Voters[chairperson].weight = 1;
        // 遍历所有传入的提案名称，一个一个处理
        for (uint i = 0;i<proposalNames.length;i++){
            // 以传入的proposalNames参数 作为内容，创建一个 proposal 类型的对象
            // 并把它添加到数组 proposals 的 
            //  Proposal({...})：创建一个临时的 提案结构体，包含2个字段
            //  proposal.push() 把新提案追加到 proposals 动态数组中末尾
            proposals.push(
                // ! 显式指定结构体类型 Proposal，Solidity 0.8.x 要求明确类型。
               Proposal( {
                    name:proposalNames[i],
                    voteCount:0
                }));
            }
    }
    /**
     * ========================================
     * Functions    CEI 模式
     * ========================================
     */
    /// @notice 函数giveRightToVote用于主席授权投票权
    /// @param voter 被授权人地址
    /// @dev 最终效果：把投票权重（weight）设为 1，赋予投票资格
    /// @dev 函数保护条件：1.必须是主席调用。2.不能重复授权。3.不能给已经投过票的人授权。
    
    function giveRightToVote(address voter) external  {
        // 一、Check 事先检查
        // 条件1.要求必须是主席调用。
        require(chairperson == msg.sender,"Only chairperson can give right to vote");
        // 条件2.要求不能重复授权。
        require(Voters[voter].weight == 0,"The voter already has voting rights");
        // 条件3.要求不能给已经投过票的人授权。
        require(Voters[voter].voted == false,"The voter has already voted");
        //或者  require(!Voters[voter].voted,"The voter has already voted");
        // 二、Effect 执行处理效果
        // 交互最终效果：把投票权重（weight）设为 1，赋予投票资格
        Voters[voter].weight = 1;
        // 三、Intera 交互
        // 事件日志记录
        emit VoterRightGranted(voter);
    }
/// @notice 委托授权delegate ,用来把投票权转让给别人，甚至可以链式委托
/// @dev 禁止循环委托可能卡死、以及耗光gas费用
/// @dev 注意 CEI 模式
/// @dev voter storage sender = voters[msg.sender]作用：方便操作当前投票人的数据，同时修改直接作用在链上
function delegate(address to ) public {
    //先检查调用者（发起委托的人）Voters[msg.sender] 的必须满足的条件.
    // 从 Voters 映射里取出当前调用者对应的 Voter 结构体，
    // 并创建绑定一个 存储引用 sender，对 sender 的修改会直接反映到链上的 voters[msg.sender]。
    Voter storage sender = Voters[msg.sender];
    //Check require"必须...否则错误信息"
   // 调用者投票权,必须不能为0
    require(sender.weight != 0,"You have no right to vote");
   // 调用者 voted,必须没有投过
    require(!sender.voted ,"You already voted");
    // 调用者 不能委托投票权给自己 to，必须不是自己
    require(to != msg.sender,"Self-delegation is disallowed." );
    // while循环 表示只要...就一直进行下去
    // 如果 to 已经把票委托给别人，就继续往下找，直到找到最终的接受者。
    // 只要 to 还有委托人（不是空地址），就继续沿着委托链查找最终投票人
    // 当 delegate = address(0) 时，说明这个人 没有再委托给别人，找到最终接收人了
    while(Voters[to].delegate != address(0)){
        // 链式查询出最终的委托人
        to = Voters[to].delegate;
        // 防止出现循环委托（A → B → C → A 这种闭环）
        //检查条件 退出条件 防止出现循环委托，合约卡住
        require(to != msg.sender,"found loop in delegation.");
    }
    // 经过上面的循环，找到最终的被委托人 to
    // 从Voters表中，取出 最终被委托人 to 的 struct 结构体Voter,赋值为 _delegate
    Voter storage _delegate  = Voters[to];
    // check 确保被委托人有投票权
require(_delegate.weight >= 1, "Delegate has no voting rights.");  
  // effect 标记更新被委托人已经投票，并标记记录委托关系——调用者的委托人是谁（to)
    sender.voted = true; // 标记委托人已经投票（实际上是把票交出去了）
    sender.delegate = to ;// 记录委托关系
    // interact 处理委托票 根据被委托人的状态，处理委托的票
    if(_delegate.voted){ 
        // 情况 1：被委托人已经投票 → 票数直接加到提案上。
         proposals[_delegate.vote].voteCount += sender.weight;
    }else{
        // 情况 2：被委托人未投票 → 增加被委托人的权重（等他投票时一并计票）
        _delegate.weight += sender.weight;
    }
}
        
// 直接投票函数
function vote( uint proposal) public {
    // CEI 模式
    // 1.check 常规检查 必须确保调用者 有权投票weight>=1,并且 还没投票 voted =false
require(Voters[msg.sender].weight>=1,"You have no right to vote.");
require(!Voters[msg.sender].voted,"You already voted.");
// 2. Effect 最终效果 更新状态
// Voters[msg.sender].weight = 0; 投票者的权重在计票后被重置为 0 导致投票无效。
Voters[msg.sender].voted = true;
Voters[msg.sender].vote = proposal;
// 易错
 uint weight = Voters[msg.sender].weight;  // 先缓存权重
Voters[msg.sender].weight = 0;            // 后重置
// 3.Interact 更新交互效果
proposals[proposal].voteCount += weight;  // 使用缓存的权重
}

// 不断比较每个提案的票数，找到最大值对应的提案的索引 winningProposal_
function winningProposal() public view returns(uint winningProposal_){
    // 初始化 假设最大票数 winningVoteCount 为0票
    uint winningVoteCount = 0;
    // 遍历比较 从索引0 开始 
    for (uint p = 0 ;p<proposals.length;p++){
        // 根据每个提案的票数的多少，跟新最大值
        if(proposals[p].voteCount>winningVoteCount){
            winningVoteCount = proposals[p].voteCount;
            winningProposal_ = p;
        }
    }
    return winningProposal_ ; 
}
        
  // 调用 winningProposal() 函数以获取提案数组中获胜者的索引，并以此返回,获胜者的名称
// 返回值 name 为string，类似string
function winningProposalName() external  view returns(string memory ){
    // win = winningProposal() 未声明变量win 建议
    uint win = winningProposal();
// 返回值错误（winningProposalName）
// 应返回 name 字段，而非整个结构体：return proposals[win].name;。
    return proposals[win].name;
    }


}
