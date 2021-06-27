//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "./ERC20Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "redstone-flash-storage/lib/contracts/IPriceFeed.sol";




contract KoTokenETH is ERC20Initializable, Ownable {

    bool private initialized;
    bytes32 public asset;
    address public broker;
    IPriceFeed priceFeed;

    uint256 constant public MAX_SOLVENCY = 2**256 - 1;
    bytes32 constant public COLLATERAL_TOKEN  = "ETH"; 
    uint256 constant public SOLVENCY_PRECISION  = 1000; // 1 unit = 0.1% 
    uint256 constant public MIN_SOLVENCY  = 1200; // 1 unit = 0.1% 

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    function initialize(bytes32 asset_, string memory name_, string memory symbol_, IPriceFeed priceFeed_) external {
        require(!initialized);

        super.initialize(name_, symbol_);
        
        asset = asset_;
        priceFeed = priceFeed_;
        
        initialized = true;
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


    /**
     * @dev Value of komodo tokens held by given account at the current market price
     */
    function balanceValueOf(address account) public view returns(uint256) {
        return balanceOf(account) * priceFeed.getPrice(asset); 
    }


    /**
     * @dev Total value of all minted komodo tokens at the current market price
     */
    function totalValue() public view returns(uint256) {
        return totalSupply() * priceFeed.getPrice(asset);
    }
    
    
    modifier remainsSolvent() {
        _;
        require(solvencyOf(msg.sender) >= MIN_SOLVENCY, "The account must remain solvent");        
    }
    
    


    //EVENTS

    event CollateralAdded(address account, uint256 val, uint256 time);
    event CollateralRemoved(address account, uint256 val, uint256 time);

}
