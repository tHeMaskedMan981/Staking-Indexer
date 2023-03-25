// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ILido} from "./Interfaces/ILido.sol";
import {IBentoBoxV1} from "./Interfaces/IBentoBoxV1.sol";
import {IERC20} from "./Interfaces/IERC20.sol";
import {Constants} from "./constants.sol";
import {IClayMatic} from "./Interfaces/IClayMatic.sol";
import {IUniswapV2Router01} from "./Interfaces/IUniswapV2Router01.sol";
import {UniswapV2Library} from "./libraries/UniswapV2Library.sol";
import "hardhat/console.sol";

contract StakingIndexer is Constants {
    IERC20 maticToken = IERC20(MATIC_TOKEN);
    IERC20 csMaticToken = IERC20(CS_MATIC_TOKEN);

    IBentoBoxV1 bentoBox = IBentoBoxV1(BENTO_BOX);
    IClayMatic clayMatic = IClayMatic(CLAY_MATIC);
    ILido lido = ILido(LIDO_ST_ETH);
    IUniswapV2Router01 sushiRouter = IUniswapV2Router01(SUSHISWAP_ROUTER);
    IUniswapV2Router01 uniswapRouter = IUniswapV2Router01(UNISWAP_ROUTER);
    address WETH = IUniswapV2Router01(SUSHISWAP_ROUTER).WETH();

    function depositByEth(
        uint256 clayStackPercentage,
        uint256 amountOutMin,
        uint256 deadline,
        address _to
    ) external payable returns (uint256 csMaticBalance, uint256 stEthBalance) {
        require(
            clayStackPercentage <= 100 && clayStackPercentage >= 0,
            "percentage out of bounds!"
        );
        console.log("ERROR in DepositByEth");
        require(msg.value > 0, "no Eth Supplied");

        if (clayStackPercentage > 0) {
            address[] memory path = new address[](2);
            path[0] = WETH;
            path[1] = MATIC_TOKEN;

            sushiRouter.swapExactETHForTokens{
                value: (msg.value * clayStackPercentage) / 100
            }(amountOutMin, path, address(this), deadline);
        }
        // console.log(maticToken.balanceOf(address(this)));
        uint256 maticBalance = maticToken.balanceOf(address(this));

        (csMaticBalance, stEthBalance) = _deposit(
            address(this).balance,
            maticBalance,
            _to
        );
    }

    function depositByMatic(
        uint256 clayStackPercentage,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline,
        address _to
    ) external returns (uint256 csMaticBalance, uint256 stEthBalance) {
        require(
            clayStackPercentage <= 100 && clayStackPercentage >= 0,
            "percentage out of bounds"
        );

        maticToken.transferFrom(msg.sender, address(this), amountIn);

        if (clayStackPercentage < 100) {
            address[] memory path = new address[](2);
            path[0] = MATIC_TOKEN;
            path[1] = WETH;

            maticToken.approve(
                address(sushiRouter),
                (amountIn * (100 - clayStackPercentage)) / 100
            );
            sushiRouter.swapExactTokensForETH(
                (amountIn * (100 - clayStackPercentage)) / 100,
                amountOutMin,
                path,
                address(this),
                deadline
            );
        }

        (csMaticBalance, stEthBalance) = _deposit(
            address(this).balance,
            (amountIn * clayStackPercentage) / 100,
            _to
        );
    }

    function _deposit(
        uint256 ethAmount,
        uint256 maticAmount,
        address _to
    ) internal returns (uint256 csMaticBalance, uint256 stETHBalance) {
        // Deposit clayMatic
        if (maticAmount > 0) {
            maticToken.approve(CLAY_MATIC, maticAmount);
            clayMatic.deposit(maticAmount);
            csMaticBalance = csMaticToken.balanceOf(address(this));

            csMaticToken.approve(BENTO_BOX, csMaticBalance); // approve bentoBox to pull
            bentoBox.deposit(
                IERC20(CS_MATIC_TOKEN),
                address(this),
                _to,
                csMaticBalance,
                0
            ); // Deposit to bentoBox
        }

        // Deposit Lido
        if (ethAmount > 0) {
            lido.submit{value: ethAmount}(REFERRAL);
            uint256 _lidoBal = lido.balanceOf(address(this));
            lido.approve(BENTO_BOX, _lidoBal); // approve bentoBox to pull
            bentoBox.deposit(
                IERC20(LIDO_ST_ETH),
                address(this),
                _to,
                _lidoBal,
                0
            ); // Deposit to bentoBox
            stETHBalance = bentoBox.balanceOf(IERC20(LIDO_ST_ETH), _to);
        }
    }


    function getDepositByMaticBalances(
        uint256 clayStackPercentage,
        uint256 amountIn
    ) external view returns (uint256 csMaticBalance, uint256 stEthBalance) {
        (uint256 exchangeRate, ) = clayMatic.getExchangeRate();
        csMaticBalance = amountIn*clayStackPercentage*1e18/(100*exchangeRate);
        (uint reserve0, uint reserve1) = UniswapV2Library.getReserves(uniswapRouter.factory(), MATIC_TOKEN, WETH);
        stEthBalance = UniswapV2Library.quote(amountIn*(100-clayStackPercentage)/100, reserve0, reserve1);

    }

    function getDepositByEthBalances(
        uint256 clayStackPercentage,
        uint256 amountIn
    ) external view returns (uint256 csMaticBalance, uint256 stEthBalance) {
        (uint256 exchangeRate, ) = clayMatic.getExchangeRate();
        stEthBalance = amountIn*(100-clayStackPercentage)/100;
        (uint reserve0, uint reserve1) = UniswapV2Library.getReserves(uniswapRouter.factory(), MATIC_TOKEN, WETH);
        uint convertedMaticBalance = UniswapV2Library.getAmountOut(amountIn*clayStackPercentage/100, reserve1, reserve0);
        csMaticBalance = convertedMaticBalance*1e18/exchangeRate;
    }

    // csMatic, stEthBalance of user
    function balanceOf(
        address owner
    ) public view returns (uint256 csMaticBalance, uint256 stEthBalance) { 
        csMaticBalance = bentoBox.toAmount(
            IERC20(CS_MATIC_TOKEN),
            bentoBox.balanceOf(IERC20(CS_MATIC_TOKEN),owner),
            false
        );
        stEthBalance = bentoBox.toAmount(
            IERC20(LIDO_ST_ETH),
            bentoBox.balanceOf(IERC20(LIDO_ST_ETH), owner),
            false
        );
    }

    // corresponding approx native balance of user (what the user will get after unstaking)
    function shareBalanceOf(
        address owner
    ) public view returns (uint256 maticBalance, uint256 ethBalance) {
        maticBalance = bentoBox.balanceOf(IERC20(CS_MATIC_TOKEN), owner);
        ethBalance = bentoBox.balanceOf(IERC20(LIDO_ST_ETH), owner);
    }

    function amtBalanceOf(
        address owner
    ) public view returns (uint256 maticBalance, uint256 ethBalance) {
        (uint256 exchangeRate, ) = clayMatic.getExchangeRate();
        uint256 csMaticSharesInBento = bentoBox.balanceOf(
            IERC20(CS_MATIC_TOKEN),
            owner
        );
        uint256 csMaticBalanceInBento = bentoBox.toAmount(
            IERC20(CS_MATIC_TOKEN),
            csMaticSharesInBento,
            false
        );

        maticBalance = (csMaticBalanceInBento * exchangeRate) / 1e18;
        
        ethBalance = bentoBox.toAmount(
            IERC20(CS_MATIC_TOKEN),
            bentoBox.balanceOf(IERC20(LIDO_ST_ETH), owner),
            false
        );
    }

    // function withdrawFromBentoBoxStaked(
    //     uint256 _amtEth,
    //     uint256 _amtMatic,
    //     address _to
    // ) external payable {
    //     IBentoBoxV1(BENTO_BOX).withdraw(
    //         IERC20(LIDO_ST_ETH),
    //         msg.sender,
    //         _to,
    //         _amtEth,
    //         0
    //     );
    //     IBentoBoxV1(BENTO_BOX).withdraw(
    //         IERC20(CS_MATIC_TOKEN),
    //         msg.sender,
    //         _to,
    //         _amtMatic,
    //         0
    //     );
    // }

    // function withdrawFromBentoBoxUnStaked(
    //     uint256 _amtStEth,
    //     uint256 _amtCSMatic,
    //     uint256 amountOutMinEth,
    //     uint256 amountOutMinMatic,
    //     address _to
    // ) external payable {
    //     IBentoBoxV1(BENTO_BOX).withdraw(
    //         IERC20(LIDO_ST_ETH),
    //         msg.sender,
    //         address(this),
    //         _amtStEth,
    //         0
    //     );

    //     IBentoBoxV1(BENTO_BOX).withdraw(
    //         IERC20(CS_MATIC_TOKEN),
    //         msg.sender,
    //         address(this),
    //         _amtCSMatic,
    //         0
    //     );

    //     address[] memory path = new address[](2);
    //     path[0] = LIDO_ST_ETH;
    //     path[1] = WETH;

    //     IERC20(LIDO_ST_ETH).approve(UNISWAP_ROUTER, type(uint).max);

    //     uniswapRouter.swapExactTokensForETH(
    //         IERC20(LIDO_ST_ETH).balanceOf(address(this)) - 1, // Rounding Bug
    //         0,
    //         path,
    //         _to,
    //         type(uint).max // Hacky
    //     );

    //     // IERC20(CS_MATIC_TOKEN).approve(CLAY_MATIC, type(uint).max);

    //     // console.log(clayMatic.getMaxWithdrawAmountCs());
    //     // console.log();

    //     // clayMatic.instantWithdraw(1000);
    // }

    function rebalance(uint256 _amtStEth, address _to) external {
        console.log("Rebalance");
        IBentoBoxV1(BENTO_BOX).withdraw(
            IERC20(LIDO_ST_ETH),
            msg.sender,
            address(this),
            _amtStEth,
            0
        );
        address[] memory path = new address[](3);
        path[0] = LIDO_ST_ETH;
        path[1] = WETH;
        path[2] = MATIC_TOKEN;

        IERC20(LIDO_ST_ETH).approve(UNISWAP_ROUTER, type(uint).max);

        uniswapRouter.swapExactTokensForTokens(
            IERC20(LIDO_ST_ETH).balanceOf(address(this)) - 1, // Rounding Bug
            0,
            path,
            address(this),
            type(uint).max // Hacky
        );

        uint256 maticBalance = maticToken.balanceOf(address(this));
        _deposit(0, maticBalance, _to);

    }

    function register() external {
        IBentoBoxV1(BENTO_BOX).registerProtocol();
    }

    receive() external payable {}
    fallback() external payable {}
}
