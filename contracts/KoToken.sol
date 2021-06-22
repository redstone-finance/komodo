//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract KoToken is ERC20, Ownable {
    
    bytes32 public asset;
    address public broker;

    mapping(address => uint256) public collateral;
    
    
    constructor(bytes32 asset_, string memory name_, string memory symbol_) ERC20(name_, symbol_) {        
        asset = asset_;
    }
    
    
    function mint(address account, uint256 amount) external onlyOwner {
        super._mint(account, amount);
    }


    function burn(address account, uint256 amount) external onlyOwner {
        super._burn(account, amount);
    }

}
