// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { IERC20 } from "./IERC20.sol";


interface ILido is IERC20 {
    function getTotalShares() external view returns (uint256);
    function submit(address _referral) external payable returns (uint256 StETH);
}