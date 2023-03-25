import React from 'react'
import {
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    useAccount
  } from "wagmi";
  import { ethers } from "ethers";
  import ABI from "../config/Staking.json";

export function DepositEth(props : {
    percentage: number;
    ethValue: number
}) {

    const {percentage, ethValue} = props
    const { address, isConnecting, isDisconnected } = useAccount();


    const { config } = usePrepareContractWrite({
        address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
        abi: ABI,
        functionName: "depositByEth",
        args: [
          Number(percentage), // clayStackPercentage
          0, // amountOutMin
          ethers.constants.MaxUint256, // deadline
          address, // useAddress() // _to
        ],
        overrides: {
          from: address,
          value: ethers.utils.parseEther(String(ethValue)),
        },
      });

      const { data, isLoading, isSuccess, write } = useContractWrite(config);
      const execute = () => {
        write?.()
      }

  return (
    <div>
        <button
        className="bg-white w-[40vh] px-6 rounded-lg shadow-lg text-black shadow-black my-4"
        style={{ margin: 8 }}
        onClick={execute}
        disabled={!write}
      >
        Deposit Eth
      </button>
    </div>
  )
}
