import { ethers } from "hardhat";

const toBytes32 = ethers.utils.formatBytes32String;
const fromBytes32 = ethers.utils.parseBytes32String;

function mockPrices(values: { [symbol: string]: number }) {
  return (forTime: number) => ({
    prices: Object.entries(values).map(([symbol, value]) => ({
      symbol,
      value,
    })),
    timestamp: forTime - 5000,
  });
}

async function syncTime() {
  const now = Math.ceil(new Date().getTime() / 1000);
  try {
    await ethers.provider.send('evm_setNextBlockTimestamp', [now]);
  } catch (error) {
    // Skipping time sync - block is ahead of current time
  }
};

export default {
  toBytes32,
  fromBytes32,
  mockPrices,
  syncTime,
};
