//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "./ERC20Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "redstone-flash-storage/lib/contracts/IPriceFeed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";




contract KoTokenUSD is ERC20Initializable, Ownable {

    bool private initialized;
    bytes32 public asset;
    ERC20 public usd;
    address public broker;
    IPriceFeed priceFeed;

    uint256 constant public MAX_SOLVENCY = 2**256 - 1;
    uint256 constant public SOLVENCY_PRECISION  = 1000; // 100%, 1 unit = 0.1% 
    uint256 constant public MIN_SOLVENCY  = 1200; // 120%, 1 unit = 0.1% 
    uint256 constant public LIQUIDATION_BONUS = 50; // 5%, 1 unit = 0.1% 

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    function initialize(bytes32 asset_, ERC20 usd_, string memory name_, string memory symbol_, IPriceFeed priceFeed_) external {
        require(!initialized);

        super.initialize(name_, symbol_);

        asset = asset_;
        usd = usd_;
        priceFeed = priceFeed_;

        initialized = true;
    }


    /**
     * @dev Mints koTokens increasing user's debt
     */
    function mint(uint256 amount, uint256 collateralAmount) remainsSolvent external {
        super._mint(msg.sender, amount);
        debt[msg.sender] += amount;
        
        usd.transferFrom(msg.sender, address(this), collateralAmount);
        collateral[msg.sender] += collateralAmount;
    }


    /**
     * @dev Burns koTokens to reduce user debt
     */
    function burn(uint256 amount) external {
        require(debt[msg.sender] >= amount, "Cannot burn more than minted");
        debt[msg.sender] -= amount;
        super._burn(msg.sender, amount);
    }


    /**
     * @dev Adds collateral to user account
     * It could be done to increase the solvency ratio
     */
    function addCollateral(uint256 collateralAmount) external {
        collateral[msg.sender] += collateralAmount;
        usd.transferFrom(msg.sender, address(this), collateralAmount);
        
        emit CollateralAdded(msg.sender, collateralAmount, block.timestamp);
    }


    /**
     * @dev Removes outstanding collateral by paying out funds to depositor
     * The account must remain solvent after the operation
     */
    function removeCollateral(uint amount) external remainsSolvent {
        require(collateral[msg.sender] >= amount, "Cannot remove more collateral than deposited");
        collateral[msg.sender] -= amount;
        usd.transfer(msg.sender, amount);
        emit CollateralRemoved(msg.sender, amount, block.timestamp);
    }


    /**
     * @dev Collateral amount in USDC stable coins
     */
    function collateralOf(address account) public view returns(uint256) {
        return collateral[account];
    }


    /**
     * @dev Collateral value expressed with 10^18 precision
     */
    function collateralValueOf(address account) public view returns(uint256) {
        //USDC usded 6 digits precision ( * 10**12)
        //Prices from redstone use 8 digits precision ( * 10**8) 
        return collateralOf(account) * 10**20;
    }


    /**
     * @dev Debt of the account (number of koTokens minted)
     */
    function debtOf(address account) public view returns(uint256) {
        return debt[account];
    }


    /**
     * @dev Debt of the account expressed in USD
     */
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


    function liquidate(address account, uint256 amount) public {
        require(solvencyOf(account) < MIN_SOLVENCY, "Cannot liquidate a solvent account");
        this.transferFrom(msg.sender, account, amount);
        super._burn(account, amount);
        debt[account] -= amount;

        //Liquidator reward
        uint256 collateralRepayment = amount * priceFeed.getPrice(asset);
        uint256 bonus = collateralRepayment * LIQUIDATION_BONUS / SOLVENCY_PRECISION;

        uint256 repaymentWithBonus = collateralRepayment + bonus;
        collateral[account] -= repaymentWithBonus;
        usd.transfer(msg.sender, repaymentWithBonus);

        require(solvencyOf(account) >= MIN_SOLVENCY, "Account must be solvent after liquidation");
    }


    modifier remainsSolvent() {
        _;
        require(solvencyOf(msg.sender) >= MIN_SOLVENCY, "The account must remain solvent");
    }




    //EVENTS

    event CollateralAdded(address account, uint256 val, uint256 time);
    event CollateralRemoved(address account, uint256 val, uint256 time);

}
