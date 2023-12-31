import { GoogleProvider, LitAuthClient } from "@lit-protocol/lit-auth-client";
import { ProviderType } from "@lit-protocol/constants";
import * as LitJsSdk from "@lit-protocol/lit-node-client";

//create exportable function
const initLit = async () => {
  // -- 1. Create a LitAuthClient instance
  const litNodeClient = new LitNodeClient({
    litNetwork: "cayenne",
    debug: true,
  });

  await litNodeClient.connect();

  // -- 2. Create a LitAuthClient instance
  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
    },
    litNodeClient: litNodeClient,
  });

  const authProvider = litAuthClient.initProvider<GoogleProvider>(
    ProviderType.Google,
    {
      redirectUri: window.location.href,
    }
  );
  return authProvider;
};

export const getLitClient = async () => {
  // -- 1. Create a LitAuthClient instance
  const litNodeClient = new LitNodeClient({
    litNetwork: "cayenne",
    debug: true,
  });

  await litNodeClient.connect();

  return litNodeClient;
};
export const encrypt = async (message: string, userSigs: any) => {
  const litClient = await getLitClient();

  const chain = "mumbai";

  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "1000000000000", // 0.000001 ETH
      },
    },
  ];

  const encryptable = {
    accessControlConditions,
    sessionSigs: userSigs,
    chain: "mumbai",
    dataToEncrypt: message,
  };
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    encryptable,
    litClient
  );
  return {
    ciphertext,
    dataToEncryptHash,
  };
};

export const decrypt = async (ciphertext: string, userSigs: any) => {
  // const decryptedString = await LitJsSdk.decryptToString(
  //   {
  //     accessControlConditions,
  //     ciphertext,
  //     dataToEncryptHash,
  //     authSig,
  //     chain,
  //   },
  //   client
  // );
  // console.log("decryptedString", decryptedString);
};

export default initLit;
