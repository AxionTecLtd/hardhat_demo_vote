// ==========================
// Ballot 合约增强版单元测试（Two Accounts, assert + console.log）
// 说明：
// 完整覆盖部署、授权、投票、重复投票、无权投票、委托、循环委托、获胜提案等逻辑。
// 只使用 assert，不依赖 expect。
// 添加 console.log，便于在 npx hardhat coverage 或 npx hardhat test 时观察状态。
// 仅两个账户，避免多账户复杂化。
// ==========================

const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("Ballot Contract - Enhanced Tests (Two Accounts, assert + console.log)", function () {
    let Ballot, ballot;
    let account_1, account_2;

    beforeEach(async function () {
        Ballot = await ethers.getContractFactory("Ballot");
        [account_1, account_2] = await ethers.getSigners();

        // 部署合约
        ballot = await Ballot.deploy(["Support", "Oppose", "Neutral"]);
        await ballot.waitForDeployment();

        console.log("部署完成，合约地址:", ballot.target);
        console.log("主席地址:", account_1.address);
    });

    // ----------------------------
    // 部署测试
    // ----------------------------
    it("部署后应该有 3 个提案", async function () {
        const p0 = await ballot.proposals(0);
        const p1 = await ballot.proposals(1);
        const p2 = await ballot.proposals(2);

        console.log("提案列表:", p0.name, p1.name, p2.name);
        assert.equal(p0.name, "Support");
        assert.equal(p1.name, "Oppose");
        assert.equal(p2.name, "Neutral");
    });

    it("部署后主席应该是部署者", async function () {
        const chairperson = await ballot.chairperson();
        console.log("chairperson:", chairperson);
        assert.equal(chairperson, account_1.address);
    });

    // ----------------------------
    // giveRightToVote 测试
    // ----------------------------
    it("主席可以授权投票权", async function () {
        await ballot.giveRightToVote(account_2.address);
        const voter = await ballot.Voters(account_2.address);
        console.log("account_2 权重:", voter.weight);
        assert.equal(voter.weight, 1);
    });

    it("非主席授权投票权应该失败", async function () {
        let reverted = false;
        try {
            await ballot.connect(account_2).giveRightToVote(account_1.address);
        } catch (e) {
            reverted = e.message.includes("Only chairperson can give right to vote");
        }
        console.log("非主席授权是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    it("重复授权投票权应该失败", async function () {
        await ballot.giveRightToVote(account_2.address);
        let reverted = false;
        try {
            await ballot.giveRightToVote(account_2.address);
        } catch (e) {
            reverted = e.message.includes("The voter already has voting rights");
        }
        console.log("重复授权是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    it("给已投票的用户授权应该失败", async function () {
        await ballot.giveRightToVote(account_2.address);
        await ballot.connect(account_2).vote(0);
        let reverted = false;
        try {
            await ballot.giveRightToVote(account_2.address);
        } catch (e) {
            reverted = e.message.includes("The voter has already voted");
        }
        console.log("已投票用户授权是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    // ----------------------------
    // vote 投票测试
    // ----------------------------
    it("授权后可以正常投票", async function () {
        await ballot.giveRightToVote(account_2.address);
        await ballot.connect(account_2).vote(0);
        const p0 = await ballot.proposals(0);
        console.log("proposal0.voteCount:", p0.voteCount);
        assert.equal(p0.voteCount, 1n);
    });

    it("重复投票应该失败", async function () {
        await ballot.giveRightToVote(account_2.address);
        await ballot.connect(account_2).vote(0);

        let reverted = false;
        try {
            await ballot.connect(account_2).vote(1);
        } catch (e) {
            reverted = e.message.includes("You have no right to vote");
        }
        console.log("重复投票是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    it("无投票权投票应该失败", async function () {
        let reverted = false;
        try {
            await ballot.connect(account_2).vote(0);
        } catch (e) {
            reverted = e.message.includes("You have no right to vote");
        }
        console.log("无投票权投票是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    // ----------------------------
    // delegate 委托测试
    // ----------------------------
    it("可以成功委托投票权给主席", async function () {
        await ballot.giveRightToVote(account_2.address);

        await ballot.connect(account_2).delegate(account_1.address);

        const voter2 = await ballot.Voters(account_2.address);
        assert.equal(voter2.voted, true);
        assert.equal(voter2.delegate, account_1.address);

        await ballot.vote(0); // 主席投票

        const p0 = await ballot.proposals(0);
        console.log("proposal0.voteCount (累计 account_1 + account_2):", p0.voteCount);
        assert.equal(p0.voteCount, 2n);
    });

    it("循环委托应该失败", async function () {
        await ballot.giveRightToVote(account_2.address);
        await ballot.connect(account_2).delegate(account_1.address);

        let reverted = false;
        try {
            await ballot.delegate(account_2.address);
        } catch (e) {
            reverted = e.message.includes("found loop in delegation");
        }
        console.log("循环委托是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    it("委托给无投票权用户应该失败", async function () {
        let reverted = false;
        try {
            await ballot.connect(account_2).delegate(account_1.address);
        } catch (e) {
            reverted = e.message.includes("You have no right to vote");
        }
        console.log("委托给无投票权用户是否 revert:", reverted);
        assert.equal(reverted, true);
    });

    // ----------------------------
    // winningProposal / winningProposalName 测试
    // ----------------------------
    it("正确返回获胜提案索引", async function () {
        await ballot.giveRightToVote(account_2.address);

        // account_2 投提案1
        await ballot.connect(account_2).vote(1);

        // 主席投提案1，再加一票，确保提案1票数最大
        await ballot.vote(1);

        const winnerIndex = await ballot.winningProposal();
        console.log("winningProposal index:", winnerIndex);
        assert.equal(winnerIndex, 1); // 现在断言通过
    });


    it("正确返回获胜提案名字", async function () {
        await ballot.vote(2);
        await ballot.giveRightToVote(account_2.address);
        await ballot.connect(account_2).vote(2);

        const winnerName = await ballot.winningProposalName();
        console.log("winningProposalName:", winnerName);
        assert.equal(winnerName, "Neutral");
    });
});
