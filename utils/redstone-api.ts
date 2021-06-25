import { Wallet, utils } from "ethers";
import axios from "axios";
import {PriceDataType, SignedPriceDataType} from "./price-signer";
import EvmPriceSigner from "./evm-signer";


const PRIV = "0xae2b81c1fe9e3b01f060362f03abd0c80a6447cfe00ff7fc7fcf000000000000";

const signer: Wallet = new Wallet(PRIV);

export async function getSignedPrice(): Promise<SignedPriceDataType> {
  const response = await axios.get("https://api-v2.redstone.finance/packages/latest?provider=Yba8IVc_01bFxutKNJAZ7CmTD5AVi2GcWXf1NajPAsc");

  const pricePackage = {
    prices: response.data.prices,
    timestamp: response.data.timestamp
  }

  const priceSigner = new EvmPriceSigner();
  const serialized = priceSigner.serializeToMessage(pricePackage);
  
  
  const priceData: PriceDataType = serialized as PriceDataType;
  
  const signedPriceData:SignedPriceDataType = {
    priceData: priceData,
    signer: response.data.signer,
    signature: response.data.signature
  };



  console.log(signedPriceData);
  
  //
  // response.data.prices.forEach((price:any) => {
  //   signedPriceData.priceData.symbols.push(price.symbol);
  //   signedPriceData.priceData.prices.push(price.value);
  // });

  //const currentTime = Math.round(new Date().getTime()/1000) - 60;
  //const priceSigner = new PriceSigner("1.0.0", 7);

  // const priceData : PriceDataType = {
  //   symbols: ["ETH", "AVAX", "OIL"].map(utils.formatBytes32String),
  //   prices: [1900, 5, 73],
  //   timestamp: currentTime
  // };
  
  return signedPriceData;
}
