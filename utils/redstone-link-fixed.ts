import { Wallet, utils } from "ethers";
import {PriceDataType, SignedPriceDataType, PriceSigner} from './price-signer';
import EvmPriceSigner  from './evm-signer';
import {PricePackage, ShortSinglePrice}  from './evm-signer';
import redstone from 'redstone-api';
import _ from "lodash";
import axios from "axios";


const PRIV = "0xb113f80f8df7330f724d5aa8a630bbbefd7799a819e6866113e2b05be4003857";

const signer: Wallet = new Wallet(PRIV);



export async function getSignedPrice2(): Promise<any> {
  const response = await axios.get("https://api-v2.redstone.finance/packages/latest?provider=Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc");

  console.log(response);
  
  response.data.prices.forEach((price:any): any => console.log(price));
  
  //const prices = await redstone.getAllPrices({provider: "redstone-stocks"});
  //console.log(prices); // Example output below
  
  const pricePackage = {
    prices: response.data.prices,
    timestamp: response.data.timestamp
  }

  // const pricePackage = {
  //   timestamp: prices[0].timestamp,
  //   prices: prices.map(p => _.pick(p, ["symbol", "value"])),
  // };
  //
  // console.log(pricePackage);



  // let ssPrices:ShortSinglePrice[] = []
  // Object.keys(prices).sort().forEach( symbol => {
  //   ssPrices.push({symbol: symbol, value: prices[symbol].value});
  // });
  //
  //
  // const currentTime = Math.round(new Date().getTime()/1000) - 60;
  // 
  //
  // const pricePackage : PricePackage = {
  //   prices: ssPrices,
  //   timestamp: prices["IBM"].timestamp
  // };
  //
  // console.log(pricePackage);
  //
  const priceSigner = new EvmPriceSigner();
  let signed =  priceSigner.signPricePackage(pricePackage, signer.privateKey);
  console.log("Signature local: " + signed.signature);
  console.log("Signature remote: " + response.data.signature);
  return signed;
}
