import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { useAccount } from "wagmi";
import { Account } from "./Account";

export function Navbar() {
  const { isConnected } = useAccount();
  return (
    <div className="bg-transparent flex justify-between p-6">
      <div>Staking Indexer - ETH Dubai </div>
      <div>
        <ConnectButton />
        {isConnected && <Account />}
      </div>
    </div>
  );
}

