import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // Modern DApp browsers
  web3 = new Web3(window.ethereum);
  window.ethereum.enable(); // Request user permission to connect
} else if (
  typeof window !== "undefined" &&
  typeof window.web3 !== "undefined"
) {
  // Legacy DApp browsers
  web3 = new Web3(window.web3.currentProvider);
} else {
  // Fallback: Use Infura or another provider
  const provider = new Web3.providers.HttpProvider(process.env.INFURA_URL);
  web3 = new Web3(provider);
}

export default web3;
