import * as dotenv from "dotenv";

import { HardhatUserConfig, subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

dotenv.config();

import { deployBookLibrary } from "./scripts/deploy";

task(
  "deploy-book-library",
  "Deploy the contract to a specified network"
).setAction(async (_, hre, runSuper) => {
  const address = await deployBookLibrary(hre);
});

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs, hre, runSuper) => {
    console.log(taskArgs.message);
  });

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY as string],
      allowUnlimitedContractSize: true,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYSCAN || "",
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

export default config;
