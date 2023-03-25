import React from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useAccount,
} from "wagmi";
import { ethers } from "ethers";
import ABI from "../config/Staking.json";
import BENTO_BOX_ABI from "../config/BentoBox.json";

export function ApproveMasterContract() {
  const { address, isConnecting, isDisconnected } = useAccount();

  const masterContractApproval = usePrepareContractWrite({
    address: "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
    abi: BENTO_BOX_ABI,
    functionName: "setMasterContractApproval",
    args: [
      address,
      "0xb468647b04bf657c9ee2de65252037d781eabafd",
      true,
      "0",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ],
  });

  const writerMasterContract = useContractWrite(masterContractApproval.config);

  return (
    <div>
      <button
        className="bg-white w-[40vh] px-6 rounded-lg shadow-lg text-black shadow-black my-4"
        style={{ margin: 8 }}
        onClick={() => writerMasterContract.write?.()}
      >
        Approve Contract
      </button>
    </div>
  );
}
