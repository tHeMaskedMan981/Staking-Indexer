import React from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
  useContractRead,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import ABI from "../config/ERC20.json";

export function ApproveMatic(props: {
  percentage: number;
  maticValue: number;
}) {
  const { percentage, maticValue } = props;
  const { address, isConnecting, isDisconnected } = useAccount();

  const { config } = usePrepareContractWrite({
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    abi: ABI,
    functionName: "approve",
    args: [
      "0xB468647B04bF657C9ee2de65252037d781eABafD",
      // ethers.utils.parseEther(String(maticValue)),
      ethers.constants.MaxUint256
    ],
  });
  console.log("approve matic config: ", config)
  const { write } = useContractWrite(config);

  return (
    <div>
      <button
        className="bg-white w-[40vh] px-6 rounded-lg shadow-lg text-black shadow-black my-4"
        style={{ margin: 8 }}
        onClick={() => write?.()}
        disabled={!write}
      >
        Approve Matic
      </button>
    </div>
  );
}
