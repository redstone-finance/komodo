# Komodo - Commodities trading protocol

DeFi is known for its lucrative yield farming and liquidity mining possibilities. However, the newly created derivatives are becoming more and more leveraged and the trading activity is contained in a bubble detached from the real economy. We want to bridge the DeFi infrastructure to the real world and encourage DeFi users to invest in the traditional form of mining and farming by allowing them to trade commodities.  

The commodity trading sector is a large and growing market estimated at $20 trillion. It faces many challenges that hamper its growth. High brokerage and clearing fees are causing friction for traders. The market is also fragmented and less accessible from areas lacking proper financial services infrastructure. 

Komodo is aiming to solve the problems by building a global and distributed infrastructure for commodities trading. Our solution is based on an open, smart-contract protocol that enables anyone to create synthetic commodities which creates the opportunity for investors and helps miners and farmers hedge their business risk. 

## How we built synthetic commodities

We decided to base our architecture on the popular and battle-tested **CDP** (collateralized debt position) pattern.
Minting synthetic commodities could be viewed as increasing the debt that needs to be backed by adequate collateral.
The collateral of every user is kept in a segregated account limiting personal risk. 
We calculate the value of collateral and debt in real-time and the ratio is called a solvency score. 
All the parameters could be actively controlled by users in the interface:



We automatically enforce that every user action must leave the system in a solvent state:

```
modifier remainsSolvent() {
  _;
  require(solvencyOf(msg.sender) >= MIN_SOLVENCY, "The account must remain solvent");        
}
```

When it drops below a safe level (currently 120%), everyone can liquidate part of the position, forcibly exchanging commodity tokens for collateral at a discounted rate:

```
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
```

Currently, we support both **ETH** and **USDC** as collateral. 


## Data access

 

## Leveraging DeFi composability




# Project setup & deployment



## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```
