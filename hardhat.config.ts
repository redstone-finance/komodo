import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-gas-reporter"

export default {
  solidity: "0.8.2",
  networks: {
    hardhat: {
      chainId: 7
    }
  }
};

