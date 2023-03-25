import { ethers, network } from "hardhat";
import { BENTO_BOX, CLAY_MATIC, CS_MATIC_TOKEN, LIDO_ST_ETH, MATIC_TOKEN } from "./constants";
import { IBentoBoxV1__factory, ILido__factory } from "../typechain-types";

async function main() {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  const user = null;
  const maticOwnerAccount = "0xB72B8c812376B5F8436d6854d41646A88aA88422";
  const bentoBoxOwnerAddress = "0x19B3Eb3Af5D93b77a5619b047De0EED7115A19e7";

  // const lido_st_eth = ILido__factory.connect(LIDO_ST_ETH, owner)
  const bento_box = IBentoBoxV1__factory.connect(BENTO_BOX, owner)
  // const DepositLido = await ethers.getContractFactory("DepositLido");
  // const depositLido = await DepositLido.deploy();
  
  // const depositClay = await (await ethers.getContractFactory("DepositClay")).deploy();
  const stakingIndexer = await (await ethers.getContractFactory("StakingIndexer")).deploy();
  console.log("staking indexer deployed:", stakingIndexer.address);
  const matic = await ethers.getContractAt("IERC20", MATIC_TOKEN);
  const csMatic = await ethers.getContractAt("IERC20", CS_MATIC_TOKEN);
  const clayMatic = await ethers.getContractAt("IClayMatic", CLAY_MATIC);
  

  await owner.sendTransaction({to:maticOwnerAccount, value:parse("10")});
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
  await bento_box.setMasterContractApproval(owner.address, stakingIndexer.address, true, 0, ethers.constants.HashZero, ethers.constants.HashZero)
  await matic.connect(maticOwner).transfer(owner.address, parse("10000"));
  console.log("deployment complete");
  await stakingIndexer.register();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


function format(value: any, decimals: number = 18) {
  return ethers.utils.formatUnits(value, decimals);
}

function parse(value: any, decimals: number = 18) {
return String(ethers.utils.parseUnits(value, decimals));
}
