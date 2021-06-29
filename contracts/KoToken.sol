//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "evm-relayer/contracts/IPriceFeed.sol";
import "evm-relayer/contracts/MockPriceFeed.sol"; //to generate Typechain proxy



contract KoToken is ERC20, Ownable {
    
    bytes32 public asset;
    address public broker;
    IPriceFeed priceFeed;

    uint256 constant public MAX_SOLVENCY = 2**256 - 1;
    bytes32 constant public COLLATERAL_TOKEN  = "ETH"; 
    uint256 constant public SOLVENCY_PRECISION  = 1000; // 1 unit = 0.1% 
    uint256 constant public MIN_SOLVENCY  = 1200; // 1 unit = 0.1% 

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;
    
    
    constructor(bytes32 asset_, string memory name_, string memory symbol_, IPriceFeed priceFeed_) ERC20(name_, symbol_) {        
        asset = asset_;
        priceFeed = priceFeed_;
    }
    
    
    function mint(uint256 amount) payable external remainsSolvent {
        super._mint(msg.sender, amount);
        debt[msg.sender] += amount;
        collateral[msg.sender] += msg.value;
    }


    function burn(uint256 amount) external {
        require(debt[msg.sender] >= amount, "Cannot burn more than minted");
        debt[msg.sender] -= amount;
        super._burn(msg.sender, amount);
    }
    

    function addCollateral() payable external {
        collateral[msg.sender] += msg.value;
        emit CollateralAdded(msg.sender, msg.value, block.timestamp);
    }
    

    function removeCollateral(uint amount) payable external remainsSolvent {
        require(collateral[msg.sender] >= amount, "Cannot remove more collateral than deposited");
        collateral[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit CollateralRemoved(msg.sender, amount, block.timestamp);
    }
    
    
    function collateralOf(address account) public view returns(uint256) {
        return collateral[account];
    }
    

    function collateralValueOf(address account) public view returns(uint256) {
        return collateralOf(account) * priceFeed.getPrice(COLLATERAL_TOKEN);
    }
    

    function debtOf(address account) public view returns(uint256) {
        return debt[account];
    }


    function debtValueOf(address account) public view returns(uint256) {
        return debt[account] * priceFeed.getPrice(asset);
    }
    
    
    function solvencyOf(address account) public view returns(uint256) {
        if (debtValueOf(account) == 0) {
            return MAX_SOLVENCY;
        } else {
            return collateralValueOf(account) * SOLVENCY_PRECISION / debtValueOf(account);
        }
    }
    
    modifier remainsSolvent() {
        _;
        require(solvencyOf(msg.sender) >= MIN_SOLVENCY, "The account must remain solvent");        
    }
    
    


    //EVENTS

    event CollateralAdded(address account, uint256 val, uint256 time);
    event CollateralRemoved(address account, uint256 val, uint256 time);

}