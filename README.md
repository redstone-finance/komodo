[LIVE DEMO](https://komodo.redstone.finance) on the Kovan testnet

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
<p align="center">
  <img src="https://github.com/redstone-finance/komodo/blob/master/public/desc/komodo-collateral.png" width="400">
</p>
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

The most challenging part of our development was providing the real-world pricing data to our synthetic smart-contracts.

<p align="center">
  <img src="https://github.com/redstone-finance/komodo/blob/master/public/desc/komodo-prices.png" width="600">
</p>

We've been considering multiple oracle solutions. Chainlink offers the most convenient way of accessing the data directly from on-chain storage with Price Reference Data. However, the list of supported tokens is controlled by the sponsors and it's not easy to add new positions. On the other hand, UMA is very efficient with the priceless model but the data is not available on-chain and the process of getting actual feeds requires multiple transactions. 

We decided to hack our own solution that could match the convenience of Chainlink with the efficiency of UMA. We called it "flash storage" as the data is available within a context of a single transaction. When a user sends a transaction, it’s supplemented with signed pricing data and directed to a proxy contract. The proxy contract strips the data out of the transaction. It verifies its integrity by checking the signature and saves the data on-chain. 
The raw transaction is forwarded to the commodity token contract which may conveniently access information from on-chain storage. The data may be erased afterwards to save the costs or kept for others.  


The following diagram shows how we provide data to Komodo Token contract:

<p align="center">
  <img src="https://github.com/redstone-finance/komodo/blob/master/public/desc/komodo-flash-storage.png" width="800">
</p>

1. We fetch the data from [Redstone API](https://redstone.finance/)
2. We attach the data to a transaction sent by a user
3. The transaction is intercepted by a proxy contract, which separates the data piece and the original transaction content
4. The data part is verified on-chain by ECDSA signature check and put into on-chain storage
5. The original transaction is forwarded to the Komodo token contract and executed in a context that could conveniently access the data on-chain
 

## Leveraging DeFi composability

### Uniswap
We automatically generate uniswap V3 pools for every token pair (>60 pools in total).
The initial price is based on the real-world market price and set automatically during the deployment process.  
We also integrate token matadata via the [token list](https://uniswap.org/blog/token-lists/) standard that is generated by our deployment scripts. 
Here you can find the token lists pinned on IPFS:
* [ETH backed](https://gateway.pinata.cloud/ipfs/QmVS8vLZZwdqKf5z2V9QaBbhXFk47vpfR3GYoRzwwLhpCo) (QmVS8vLZZwdqKf5z2V9QaBbhXFk47vpfR3GYoRzwwLhpCo)
* [USDC backed](https://gateway.pinata.cloud/ipfs/QmUQrQ7bxfUTw91GKm1Z5FR3s7gP5Tyk8TE5dDy7JeAsE1) (QmUQrQ7bxfUTw91GKm1Z5FR3s7gP5Tyk8TE5dDy7JeAsE1)

<p align="center">
  <img src="https://github.com/redstone-finance/komodo/blob/master/public/desc/komodo-uniswap.png" width="400">
</p>


### Aave
The collateral is automatically deposited on Aave to generate additional profit for token sponsors. 
We integrated with both the ETH and the USD lending pools on Kovan. 
We also use the real-time value of the deposited collateral in the calculation of account solvency and our interface. 

<p align="center">
  <img src="https://github.com/redstone-finance/komodo/blob/master/public/desc/komodo-aave.gif" width="600">
</p>


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
