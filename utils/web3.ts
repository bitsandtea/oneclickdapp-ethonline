import { utils } from "ethers";

export const getGasPricesInHex = async (percentageIncrease: number) => {
  try {
    const response = await fetch(
      "https://gasstation-testnet.polygon.technology/v2"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const gasData = await response.json();
    const increaseFactor = 1 + percentageIncrease / 100;

    const gasPricesHex = {
      low: utils.hexlify(
        BigInt(Math.round(gasData.safeLow.maxFee * 1e9 * increaseFactor))
      ),
      average: utils.hexlify(
        BigInt(Math.round(gasData.standard.maxFee * 1e9 * increaseFactor))
      ),
      high: utils.hexlify(
        BigInt(Math.round(gasData.fast.maxFee * 1e9 * increaseFactor))
      ),
    };

    return gasPricesHex;
  } catch (error) {
    console.error("Error fetching gas prices:", error);
    throw error; // Re-throw the error so it can be handled by the caller if necessary
  }
};

export const getTransactionCount = async (
  address: string,
  blockNumber: string = "latest",
  plus: number = 0
): Promise<string> => {
  const url =
    "https://polygon-mumbai.infura.io/v3/80429791d64d4372aaabdf37945b5b43";
  const headers = {
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [address, blockNumber],
    id: 1,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    const nonce = parseInt(data.result, 16); // Convert nonce from hex to decimal
    const adjustedNonce = nonce + plus; // Add plus to the nonce
    return `0x${adjustedNonce.toString(16)}`; // Convert adjusted nonce back to hex
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    throw error;
  }
};
