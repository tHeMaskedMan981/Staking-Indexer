// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
import { IERC20 } from "./IERC20.sol";

interface IBentoBoxV1 {
  function balanceOf(IERC20, address) external view returns (uint256);
  function deposit(IERC20 token, address from, address to, uint256 amount, uint256 share) external payable returns (uint256 amountOut, uint256 shareOut);
  function masterContractOf(address) external view returns (address);
  function registerProtocol() external;
  function setMasterContractApproval(address user, address masterContract, bool approved, uint8 v, bytes32 r, bytes32 s) external;
  function toAmount(IERC20 token, uint256 share, bool roundUp) external view returns (uint256 amount);
  function whitelistMasterContract(address masterContract, bool approved) external;
  function whitelistedMasterContracts(address) external view returns (bool);
  function withdraw(IERC20 token_, address from, address to, uint256 amount, uint256 share) external returns (uint256 amountOut, uint256 shareOut);

}