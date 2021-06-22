//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//TODO: Rethink if having a broker would be too centralised

contract KoBroker {

    mapping(bytes32 => address) public koTokens;
    mapping(address => uint256) public collateral;


    


}
