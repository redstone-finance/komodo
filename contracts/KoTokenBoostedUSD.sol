//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./KoTokenUSD.sol";
import "./ILendingPool.sol";


contract KoTokenBoostedUSD is KoTokenUSD {

    bool private bInitialized;

    ILendingPool public lendingPool;
    ERC20 public aUSD;

    function bInitialize(
        bytes32 asset_,
        ERC20 usd_,
        string memory name_,
        string memory symbol_,
        ILendingPool lendingPool_,        
        ERC20 aUSD_
    ) external {
        require(!bInitialized);

        this.initialize(asset_, usd_, name_, symbol_);

        lendingPool = lendingPool_;
        aUSD = aUSD_;

        bInitialized = true;
    }


    /**
     * @dev Adds collateral to user account
     * It could be done to increase the solvency ratio
     */
    function addCollateral(uint256 collateralAmount) override public {
        collateral[msg.sender] += collateralAmount;
        usd.transferFrom(msg.sender, address(this), collateralAmount);
        
        usd.approve(address(lendingPool), collateralAmount);
        lendingPool.deposit(address(usd), collateralAmount, address(this), 0);

        emit CollateralAdded(msg.sender, collateralAmount, block.timestamp);
    }


    /**
     * @dev Removes outstanding collateral by paying out funds to depositor
     * The account must remain solvent after the operation
     */
    function removeCollateral(uint amount) override public remainsSolvent {
        require(collateral[msg.sender] >= amount, "Cannot remove more collateral than deposited");
        collateral[msg.sender] -= amount;
        lendingPool.withdraw(address(usd), amount, msg.sender);
        emit CollateralRemoved(msg.sender, amount, block.timestamp);
    }


}
