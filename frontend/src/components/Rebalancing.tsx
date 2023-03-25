import React from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { BigNumber, ethers } from "ethers";
import ABI from "../config/Staking.json";
import BENTO_BOX_ABI from "../config/BentoBox.json";
export function Rebalancing(props: { value: number }) {
  const { address, isConnecting, isDisconnected } = useAccount();

 const functionCall = async() => {
  const config = await prepareWriteContract({
    address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
    abi: ABI,
    functionName: "rebalance",
    args: [BigNumber.from((props.value.toString())).toString(), address],
    overrides: {
      from: address,
    },
  });
  console.log(BigNumber.from((props.value.toString())).toString(), address);
  
  const data = await writeContract(config)

  console.log("completed")
 }

  return (
    <div>
      <button
        className="bg-white w-[40vh] px-6 rounded-lg shadow-lg text-black shadow-black my-4"
        style={{ margin: 8 }}
        onClick={() => functionCall()}
      >
        Rebalance
      </button>
    </div>
  );
}

