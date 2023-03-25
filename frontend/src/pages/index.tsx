import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import {
  Account,
  NativeBalance,
  MaticBalance,
  Navbar,
  Tabs,
  StakedTokenBalances,
} from "../components";

function Page() {
  const { isConnected } = useAccount();
  return (
    <div className="bg-black h-[100vh]">
      <Navbar />
      <div className="flex justify-center items-center text-white">
        <div className="w-full text-center">
          <NativeBalance />
          <MaticBalance />
          <StakedTokenBalances />
        </div>
        <Tabs />
      </div>
    </div>
  );
}

export default Page;
