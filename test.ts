// const redstone = require('redstone-api');
//
// async function fetchPrices() {
//   const prices = await redstone.getAllPrices({provider: "redstone-stocks"});
//
//   console.log(prices); // Example output below
// }
//
// fetchPrices();

const { getSignedPrice } = require("./utils/redstone-link");

async function t() {
  await getSignedPrice();  
}

t();

