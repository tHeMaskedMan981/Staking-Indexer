import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BENTO_BOX, CLAY_MATIC, CS_MATIC_TOKEN, LIDO_ST_ETH, MATIC_TOKEN, SUSHI_ROUTER } from "./constants";
import { ethers, network } from "hardhat";
import { IBentoBoxV1__factory, ILido__factory } from "../typechain-types";
import { expect } from "chai";


function format(value: any, decimals: number = 18) {
    return ethers.utils.formatUnits(value, decimals);
}

function parse(value: any, decimals: number = 18) {
    return String(ethers.utils.parseUnits(value, decimals));
}

describe("Deposit Lido", function () {

    const maticOwnerAccount = "0xB72B8c812376B5F8436d6854d41646A88aA88422";
    const bentoBoxOwnerAddress = "0x19B3Eb3Af5D93b77a5619b047De0EED7115A19e7";
    const maticDepositAmount = "1000";
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployDepositer() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const lido_st_eth = ILido__factory.connect(LIDO_ST_ETH, owner)
        const bento_box = IBentoBoxV1__factory.connect(BENTO_BOX, owner)
        const DepositLido = await ethers.getContractFactory("DepositLido");
        const depositLido = await DepositLido.deploy();

        const depositClay = await (await ethers.getContractFactory("DepositClay")).deploy();
        const stakingIndexer = await (await ethers.getContractFactory("StakingIndexer")).deploy();
        await stakingIndexer.register()

        const matic = await ethers.getContractAt("IERC20", MATIC_TOKEN);
        const csMatic = await ethers.getContractAt("IERC20", CS_MATIC_TOKEN);
        const clayMatic = await ethers.getContractAt("IClayMatic", CLAY_MATIC);


        await owner.sendTransaction({ to: maticOwnerAccount, value: parse("10") });
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [maticOwnerAccount],
        });
        const maticOwner = await ethers.getSigner(maticOwnerAccount);
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [bentoBoxOwnerAddress],
        });
        const bentoBoxOwner = await ethers.getSigner(bentoBoxOwnerAddress);
        await bento_box.connect(bentoBoxOwner).whitelistMasterContract(stakingIndexer.address, true)


        return { maticOwner, stakingIndexer, depositClay, clayMatic, csMatic, matic, depositLido, lido_st_eth, owner, otherAccount, bento_box, bentoBoxOwner };
    }

    describe("Deployment", function () {
        it("Should deposit to BentoBox", async function () {
            const { depositLido, owner, lido_st_eth, bento_box } = await loadFixture(deployDepositer);
            await depositLido.depositLidoStEth(owner.address, { value: ethers.utils.parseEther("1") })
            expect(await bento_box.balanceOf(lido_st_eth.address, owner.address)).to.equal("999999999999999999"); // Rounding Error
            expect(await depositLido.getUserBentoBoxBal(lido_st_eth.address, owner.address)).to.equal("999999999999999999"); // Rounding Error
            expect(await lido_st_eth.balanceOf(BENTO_BOX)).to.equal("999999999999999998"); // Rounding Erro    
        });



        it("Should deposit to clayMatic and then to BentoBox", async function () {
            const { maticOwner, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box } = await loadFixture(deployDepositer);

            console.log(await clayMatic.getExchangeRate())
            await matic.connect(maticOwner).approve(depositClay.address, parse(maticDepositAmount), { gasLimit: 100000 });
            await depositClay.connect(maticOwner).deposit(parse(maticDepositAmount));
            console.log("csMatic balance deposit contract: ", format(await csMatic.balanceOf(depositClay.address)));
            console.log("csMatic balance bento box contract: ", format(await csMatic.balanceOf(BENTO_BOX)));
            console.log("csMatic balance matic owner: ", format(await csMatic.balanceOf(maticOwner.address)));
            console.log("bento box balance: ", format(await bento_box.balanceOf(csMatic.address, maticOwner.address)));

            // expect(await bento_box.balanceOf(lido_st_eth.address, owner.address)).to.equal("999999999999999999"); // Rounding Error
            // expect(await lido_st_eth.balanceOf(BENTO_BOX)).to.equal("999999999999999998"); // Rounding Error

        });

        it("deposit by matic balances", async function () {

            const { stakingIndexer, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box } = await loadFixture(deployDepositer);
            let result = await stakingIndexer.getDepositByMaticBalances(50, parse("100"));
            console.log("get deposit by matic balances: csMatic: ",format(result.csMaticBalance), "stEth: ", format(result.stEthBalance) );
        });

        it("deposit by eth balances", async function () {

            const { stakingIndexer, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box } = await loadFixture(deployDepositer);
            let result = await stakingIndexer.getDepositByEthBalances(50, parse("100"));
            console.log("get deposit by eth balances: csMatic: ",format(result.csMaticBalance), "stEth: ", format(result.stEthBalance) );
        });

        it("Should deposit LST to BentoBox by ETH", async function () {

            const { stakingIndexer, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box } = await loadFixture(deployDepositer);

            let deadline = (await ethers.provider.getBlock("latest")).timestamp * 2;
            await stakingIndexer.connect(owner).depositByEth(0, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(50, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(100, 0, deadline, owner.address, { value: parse("10") });

            console.log("stEth owner bento box balance: ", format(await bento_box.balanceOf(lido_st_eth.address, owner.address)));
            console.log("cs Matic owner bento box balance: ", format(await bento_box.balanceOf(csMatic.address, owner.address)));

        });

        it("Should deposit liquid staking tokens to BentoBox by Matic", async function () {

            const { stakingIndexer, matic, maticOwner, owner, csMatic, lido_st_eth, bento_box } = await loadFixture(deployDepositer);

            let deadline = (await ethers.provider.getBlock("latest")).timestamp * 2;

            await matic.connect(maticOwner).approve(stakingIndexer.address, parse(maticDepositAmount), { gasLimit: 100000 });

            await stakingIndexer.connect(maticOwner).depositByMatic(
                50,
                parse(maticDepositAmount),
                0,
                deadline,
                maticOwner.address
            );
            console.log("stEth owner bento box balance: ", format(await bento_box.balanceOf(lido_st_eth.address, maticOwner.address)));
            console.log("cs Matic owner bento box balance: ", format(await bento_box.balanceOf(csMatic.address, maticOwner.address)));

            console.log("LST balances: ", await stakingIndexer.balanceOf(maticOwner.address));
            console.log("approx native balances: ", await stakingIndexer.shareBalanceOf(maticOwner.address));
        });

        it("Should withdraw", async function () {

            const { stakingIndexer, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box, bentoBoxOwner } = await loadFixture(deployDepositer);

            let deadline = (await ethers.provider.getBlock("latest")).timestamp * 2;
            await stakingIndexer.connect(owner).depositByEth(0, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(50, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(100, 0, deadline, owner.address, { value: parse("10") });
            // Deposited

            const x = await stakingIndexer.amtBalanceOf(owner.address);
            console.log(x);
            await bento_box.connect(owner).setMasterContractApproval(owner.address, stakingIndexer.address, true, "0", "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000")
            await stakingIndexer.connect(owner).withdrawFromBentoBoxUnStaked(x[1].div(4), x[0].div(2), 0, 0, owner.address)
        });


        it("Should rebalance", async function () {

            const { stakingIndexer, owner, clayMatic, matic, csMatic, depositClay, lido_st_eth, bento_box, bentoBoxOwner } = await loadFixture(deployDepositer);

            let deadline = (await ethers.provider.getBlock("latest")).timestamp * 2;
            await stakingIndexer.connect(owner).depositByEth(0, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(50, 0, deadline, owner.address, { value: parse("10") });
            await stakingIndexer.connect(owner).depositByEth(100, 0, deadline, owner.address, { value: parse("10") });
            // Deposited
            await bento_box.connect(owner).setMasterContractApproval(owner.address, stakingIndexer.address, true, "0", "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000")

            const _amt = await stakingIndexer.amtBalanceOf(owner.address);
            await stakingIndexer.rebalance(_amt[1].div(3), owner.address)
            
        });

    });

});
