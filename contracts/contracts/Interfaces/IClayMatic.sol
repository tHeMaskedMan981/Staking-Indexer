// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
import { IERC20 } from "./IERC20.sol";

interface IClayMatic {
    function getExchangeRate() external view returns (uint256, bool);
    function deposit(uint256 amountToken) external returns (bool);
    function instantWithdraw(uint256 amountCs) external returns (bool);
    function getMaxWithdrawAmountCs() external view returns (uint256);
}