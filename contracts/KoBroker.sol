//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "redstone-flash-storage/lib/contracts/MockPriceFeed.sol"; //to generate Typechain proxy
import "redstone-flash-storage/lib/contracts/PriceVerifier.sol"; //to generate Typechain proxy
import "redstone-flash-storage/lib/contracts/RedstoneUpgradeableProxy.sol"; //to generate Typechain proxy


//TODO: Rethink if having a broker would be too centralised

contract KoBroker {

    mapping(bytes32 => address) public koTokens;
    mapping(address => uint256) public collateral;


    


}
