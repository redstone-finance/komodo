import { Wallet, utils } from "ethers";
import {PriceDataType, SignedPriceDataType, PriceSigner} from './price-signer';
import redstone from 'redstone-api';
import _ from "lodash";


const PRIV = "z internal";

const signer: Wallet = new Wallet(PRIV);

const serializePriceValue = (value: any) => Math.round(value * (10 ** 8));

export async function getSignedPrice(): Promise<SignedPriceDataType> {

  const prices = await redstone.getAllPrices({provider: "redstone-stocks"});
  //console.log(prices); // Example output below

  // const pricePackage = {
  //   timestamp: prices[0].timestamp,
  //   prices: prices.map(p => _.pick(p, ["symbol", "value"])),
  // };
  //
  // console.log(pricePackage);
  
  
  
  let symbols:string[] = [];
  let values:number[] = [];
  Object.keys(prices).sort().forEach( symbol => {
    symbols.push(utils.formatBytes32String(symbol));
    values.push(serializePriceValue(prices[symbol].value));
    console.log(symbol);
    console.log(prices[symbol].value);
  });
  

  const currentTime = Math.round(new Date().getTime()/1000) - 60;
  const priceSigner = new PriceSigner();

  const priceData : PriceDataType = {
    //symbols: ["ETH", "AVAX", "OIL"].map(utils.formatBytes32String),
    symbols: symbols,
    //prices: [1900, 5, 73],
    prices: values,
    //timestamp: currentTime
    timestamp: prices["IBM"].timestamp
  };
  
  console.log(priceData);

  let signed =  priceSigner.signPriceData(priceData, signer.privateKey);
  console.log(signed);
  return signed;
}
