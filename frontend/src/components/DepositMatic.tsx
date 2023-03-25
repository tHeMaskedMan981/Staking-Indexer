import React from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
  useContractRead,
} from "wagmi";
import { BigNumber, ethers } from "ethers";
import ABI from "../config/Staking.json";
import ERC20 from "../config/ERC20.json"
import { ApproveMatic } from "./ApproveMatic";

export function DepositMatic(props: {
  percentage: number;
  maticValue: number;
}) {
  const { percentage, maticValue } = props;
  const { address, isConnecting, isDisconnected } = useAccount();
  console.log("address: ", address);
  const { data } = useContractRead({
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    abi: ERC20,
    functionName: "allowance",
    args: [ address, "0xB468647B04bF657C9ee2de65252037d781eABafD"],
  });

  const { config } = usePrepareContractWrite({
    address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
    abi: ABI,
    functionName: "depositByMatic",
    args: [
      Number(percentage), // clayStackPercentage
      ethers.utils.parseEther(String(maticValue)).toString(), // amount in matic
      0, // amountOutMin
      ethers.constants.MaxUint256, // deadline
      address, // useAddress() // _to
    ],
    overrides: {
      from: address,
    },
  });

  const { isLoading, isSuccess, write } = useContractWrite(config);

  console.log(isSuccess,data, "xxx data", percentage, maticValue);
  return (
    <div>
      {(data as BigNumber)?.toString() > ethers.utils.parseEther(String(maticValue))?.toString() ? (
        <button
          className="bg-white w-[40vh] px-6 rounded-lg shadow-lg text-black shadow-black my-4"
          style={{ margin: 8 }}
          onClick={() => {console.log("write") ; write?.(); }}
          disabled={!write}
        >
          Deposit Matic
        </button>
      ) : (
        <ApproveMatic percentage={percentage} maticValue={maticValue} />
      )}
    </div>
  );
}
