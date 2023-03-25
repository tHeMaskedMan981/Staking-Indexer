import { ethers } from "ethers";
import React from "react";
import { useContractRead, useAccount } from "wagmi";
import ABI from "../config/Staking.json";
export interface StakedBalance {
  stEthBalance: number;
  csMaticBalance: number;
}
export function StakedTokenBalances() {
  const { address } = useAccount();

  const { data, isError, isLoading, isSuccess } = useContractRead({
    address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
    abi: ABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data && (
        <div className="bg-gray-300 text-black">
          <br />
          <p>Balance of Liquid Staking Tokens :</p> 
          (deposited in BentoBox)
          <div>
            stEth Balance :
            {/* @ts-ignore */}
            {parseFloat(ethers.utils.formatEther(data.stEthBalance)).toFixed(
              4
            )}{" "}
            stETH
          </div>
          <div>
            csMatic Balance :
            {/* @ts-ignore */}
            {parseFloat(ethers.utils.formatEther(data.csMaticBalance)).toFixed(
              4
            )}{" "}
            csMATIC
          </div>
        </div>
      )}
    </>
  );
}
