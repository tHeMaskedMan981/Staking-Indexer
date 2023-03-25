import React, { useState, useEffect } from "react";
import { MaticBalance } from "./MaticBalance";
import { NativeBalance } from "./NativeBalance";
import ABI from "../config/Staking.json";
import { StakedTokenBalancesNative } from "./getStakingPrediction";
import { StakedTokenBalancesMatic } from "./getStakingPredictionMatic";
import { DepositEth } from "./DepositEth";
import { DepositMatic } from "./DepositMatic";
import { Rebalancing } from "./Rebalancing";
import { useAccount, useContractRead } from "wagmi";
import { ethers } from "ethers";
import { ApproveMasterContract } from "./ApproveContract";
export function Tabs() {
  const [tab, setTab] = useState<Number>(1);
  const [amountIn, setAmountIn] = useState<number>(0);
  const [token, setToken] = useState<string>("ETH");
  const [percent, setPercent] = useState<number>(0);
  useEffect(() => {}, []);
  const Stake = () => {
    return (
      <div className="bg-gray-300 w-full text-black rounded-xl h-[60vh] text-left px-8 pt-6">
        <div>
          <div className="text-black">Select Your Token to Invest</div>
          <select
            onChange={(e) => {
              setToken(e.target.value);
            }}
            value={token}
            defaultValue={"ETH"}
            className="text-black px-6 py-2 mt-4 rounded-lg"
          >
            <option value={"ETH"}>Eth</option>
            <option value={"MATIC"}>Matic</option>
          </select>
          
        </div>
        <br />
        <div>{token === "ETH" ? <NativeBalance /> : <MaticBalance />}</div>
        <div>
          <br />
          <div>Enter the Amount you want to stake</div>
          <input
            value={amountIn}
            onChange={(e) => setAmountIn(Number(e.target.value))}
            className="outline-none border-none bg-white rounded-lg px-4 py-1"
          />
        </div>

        <div>
          <br />
          <div>Percentage to deposit in ClayStack(Rest deposited in Lido)</div>
          {/* <Slider
            min={0}
            max={100}
            value={percent}
            onChangeStart={() => {
              console.log("first");
            }}
            onChange={(value) => setPercent(value)}
          /> */}
          <input
            type="text"
            value={percent.toString()}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="outline-none border-none text-black bg-white rounded-lg px-4 py-1"
          />
        </div>
        <p>The input tokens will be divided in this ratio, deposited in ClayStack and Lido, </p>
        and stETH and csMatic received will be deposited in BentoBox to earn extra yields
        <br />
        <br />
        <div>
          {percent > 0 && amountIn > 0 ? (
            token === "ETH" ? (
              <StakedTokenBalancesNative
                percentage={percent}
                amountIn={amountIn}
              />
            ) : (
              <StakedTokenBalancesMatic
                percentage={percent}
                amountIn={amountIn}
              />
            )
          ) : null}
        </div>
        <div>
          {token === "ETH" ? (
            <DepositEth percentage={percent} ethValue={amountIn} />
          ) : (
            <DepositMatic percentage={percent} maticValue={amountIn} />
          )}
        </div>
      </div>
    );
  };
  const Rebalance = () => {
    const { address } = useAccount();
    const { data, isError, isLoading, isSuccess } = useContractRead({
      address: "0xB468647B04bF657C9ee2de65252037d781eABafD",
      abi: ABI,
      functionName: "balanceOf",
      args: [address],
      watch: true,
    });

    const [value, setValue] = useState(0);
    return (
      <div className="bg-gray-300 text-black w-full rounded-xl h-[60vh]">
        <div className="text-lg font-medium">
          Enter amount of stETH
          <br />
        </div>
        <br />
        <input
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="outline-none border-none bg-white rounded-lg px-4 py-1"
        />
        <div>
          {
            //  @ts-ignore
            data?.stEthBalance < value ? (
              <div className="text-red-600">Error enter right amount</div>
            ) : null
          }
          <br />
          <p>(The stETH will be swapped to ETH to Matic, staked in ClayStack,</p> 
          and the resulting csMatic will be deposited in BentoBox)
          {/* <ApproveMasterContract /> */}
          <br />
          <br />
          <Rebalancing
            value={Number(ethers.utils.parseEther(value.toString()))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="text-white flex flex-col items-center w-full text-center px-6 gap-y-16">
      <div className="flex justify-around w-full items-center ease-in bg-gray-300 text-black px-36 py-3 rounded-xl">
        <div
          className={`cursor-pointer w-full font-semibold text-xl text-center rounded-xl ${
            tab === 1 ? "bg-white" : "bg-transparent"
          }`}
          onClick={() => setTab(1)}
        >
          Stake
        </div>
        <div
          className={`cursor-pointer w-full font-semibold text-xl text-center rounded-xl ${
            tab === 2 ? "bg-white" : "bg-transparent"
          }`}
          onClick={() => setTab(2)}
        >
          Rebalance
        </div>
      </div>
      {tab === 1 ? <Stake /> : <Rebalance />}
    </div>
  );
}
