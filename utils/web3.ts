// utils/web3.ts
import Web3 from "web3";

const provider = new Web3.providers.HttpProvider(
  process.env.ETHEREUM_RPC_URL as string
);

const web3 = new Web3(provider);

export default web3;
