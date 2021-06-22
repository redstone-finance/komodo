//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract KoBroker {

    mapping(bytes32 => address) public koTokens;
    mapping(address => uint256) public collateral;


    function addCollateral() payable external {
        collateral[msg.sender] += msg.value;
        emit CollateralAdded(msg.sender, msg.value, block.timestamp);
    }


    //EVENTS

    event CollateralAdded(address account, uint256 val, uint256 time);


}
