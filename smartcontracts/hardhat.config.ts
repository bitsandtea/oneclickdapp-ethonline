import { HardhatUserConfig } from "hardhat/config";

import { config as dotenvConfig } from "dotenv";

import "@nomicfoundation/hardhat-toolbox";
import "@tableland/hardhat";
import "@nomicfoundation/hardhat-verify";

dotenvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    // Existing network configurations...
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}` || "",
      chainId: 11155111, // Replace with your desired chain ID
      accounts: [process.env.TABLELAND_AUTH || ""], // Replace with your mnemonic phrase
    },
    mumbai: {
      url:
        `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY}` || "",
      chainId: 80001,
      accounts: [process.env.TABLELAND_AUTH || ""],
    },
  },
  etherscan: {
    // apiKey: process.env.ETHERSCAN_API,
    apiKey: process.env.POLYGONSCAN_API,
  },
};

export default config;
