// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { ILido } from "./Interfaces/ILido.sol";

contract Constants {
    address constant public LIDO_ST_ETH         = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84;
    address constant public REFERRAL            = address(69);
    address constant public BENTO_BOX           = 0xF5BCE5077908a1b7370B9ae04AdC565EBd643966;
    address constant public CLAY_MATIC          = 0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905;
    address constant public CS_MATIC_TOKEN      = 0x38b7Bf4eeCF3EB530b1529c9401FC37d2a71a912;
    address constant public MATIC_TOKEN         = 0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0;
    address constant public SUSHISWAP_ROUTER    = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address constant public UNISWAP_ROUTER      = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
}