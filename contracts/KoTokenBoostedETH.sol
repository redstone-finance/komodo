//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ILendingPool.sol";
import "./KoTokenETH.sol";
import "./IWethGateway.sol";


contract KoTokenBoostedETH is KoTokenETH {

    bool private bInitialized;

    IWETHGateway public wethGateway;
    address public ethLendingPool;
    ERC20 public aETH;

    function bInitialize(
        bytes32 asset_,
        string memory name_,
        string memory symbol_,
        IPriceFeed priceFeed_,
        IWETHGateway wethGateway_,
        address ethLendingPool_,
        ERC20 aETH_
    ) external {
        require(!bInitialized);

        this.initialize(asset_, name_, symbol_, priceFeed_);

        wethGateway = wethGateway_;
        ethLendingPool = ethLendingPool_;
        aETH = aETH_;

        aETH.approve(address(wethGateway), 2**256 - 1);
        
        bInitialized = true;
    }


    /**
     * @dev Adds collateral to user account
     * It could be done to increase the solvency ratio
     */
    function addCollateral() payable override public {
        collateral[msg.sender] += msg.value;
        wethGateway.depositETH{value:msg.value}(ethLendingPool, address(this), 0);
        emit CollateralAdded(msg.sender, msg.value, block.timestamp);
    }


    /**
     * @dev Removes outstanding collateral by paying out funds to depositor
     * The account must remain solvent after the operation
     */
    function removeCollateral(uint amount) override public remainsSolvent {
        require(collateral[msg.sender] >= amount, "Cannot remove more collateral than deposited");
        collateral[msg.sender] -= amount;
        wethGateway.withdrawETH(ethLendingPool, amount, address(this));
        payable(msg.sender).transfer(amount);
        emit CollateralRemoved(msg.sender, amount, block.timestamp);
    }

    receive() external payable {}

}
