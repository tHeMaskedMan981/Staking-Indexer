import { ethers } from "ethers";
import React from "react";
import { useContractRead, useAccount } from "wagmi";
import ABI from "../config/Staking.json";
export interface StakedBalance {
  stEthBalance: number;
  csMaticBalance: number;
}
export function StakedTokenBalancesNative(props: {
  percentage: number;
  amountIn: number | string;
}) {
  const { address } = useAccount();

  const { data, isError, isLoading } = useContractRead({
    address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
    abi: ABI,
    functionName: "getDepositByEthBalances",
    args: [props.percentage, ethers.utils.parseEther(String(props.amountIn))],
    watch: true,
  });

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data && (
        <div>
          Approx. Staking Tokens Received:
          <div>
            stEth Balance :{/* @ts-ignore */}
            {parseFloat(ethers.utils.formatEther(data.stEthBalance)).toFixed(
              4
            )}{" "}
            stETH
          </div>
          <div>
            csMatic Balance :{/* @ts-ignore */}
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
