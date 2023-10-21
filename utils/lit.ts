import { GoogleProvider, LitAuthClient } from "@lit-protocol/lit-auth-client";
import { ProviderType } from "@lit-protocol/constants";
// import { LitNodeClient } from "@lit-protocol/lit-node-client";

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

export default initLit;
