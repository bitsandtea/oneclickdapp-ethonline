"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import {
  EthWalletProvider,
  GoogleProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { AuthMethodType, ProviderType } from "@lit-protocol/constants";
import { ethers } from "ethers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export default function Auth() {
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const router = useRouter();

  async function go() {
    setStatus("Creating a LitAuthClient instance...");

    // -- 1. Create a LitAuthClient instance
    const litNodeClient = new LitNodeClient({
      litNetwork: "cayenne",
      debug: true,
    });

    await litNodeClient.connect();

    setStatus("Creating a LitAuthClient instance...");
    // -- 2. Create a LitAuthClient instance
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY,
      },
      litNodeClient: litNodeClient,
    });

    setStatus("Creating an auth provider...");
    // -- 3. Create an auth provider
    const authProvider = litAuthClient.initProvider<GoogleProvider>(
      ProviderType.Google,
      {
        redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/form`, // window.location.href,
        // redirectUri: window.location.href,
      }
    );

    setStatus("Checking if user is already signed in...");
    // -- 4. Check if user is already signed in
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("provider");

    // -- 4a. redirect to sign in if no provider
    if (!provider) {
      setStatus("Redirecting to sign in...");
      await authProvider.signIn();
      return;
    }

    setStatus("Authenticating...");
    // -- 4b. authenticate
    const authMethod = await authProvider.authenticate();
    setResponse(`authMethod: ${JSON.stringify(authMethod)}`);
    console.log("authMethod", authMethod);

    setStatus("Fetching user pkps...");
    // -- 5. fetch user pkps, if none, create one, and use it
    let pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);

    if (pkps.length <= 0) {
      try {
        setStatus("Creating PKP, it will take a while (up to a minute)...");
        await authProvider.mintPKPThroughRelayer(authMethod);
        // do timeout
        await new Promise((resolve) => setTimeout(resolve, 30000));
        //wait 30 seconds
      } catch (e) {
        setStatus("Failed to mint PKP");
        return;
      }
      setStatus("Fetching user pkps...");
      pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
    }

    const pkp = pkps[pkps.length - 1];
    setResponse(`pkp: ${JSON.stringify(pkp)}`);

    setStatus("Getting session sigs...");
    // -- 6. get session sigs
    const sessionSigs = await authProvider?.getSessionSigs({
      pkpPublicKey: pkp.publicKey,
      authMethod: authMethod,
      sessionSigsParams: {
        chain: "ethereum",
        resourceAbilityRequests: [
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.PKPSigning,
          },
        ],
      },
    });
    setResponse(`sessionSigs: ${JSON.stringify(sessionSigs)}`);

    setStatus("Using pkpSign with the session sigs...");
    // -- 7. Try to use pkpSign with the session sigs
    const TO_SIGN = ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    );

    const pkpSignRes = await litNodeClient?.pkpSign({
      toSign: TO_SIGN,
      pubKey: pkp.publicKey,
      sessionSigs: sessionSigs,
    });
    setResponse(`pkpSignRes: ${JSON.stringify(pkpSignRes)}`);

    setStatus("Creating a PKPEthersWallet instance...");
    // -- 8. Create a PKPEthersWallet instance //interact with the blockchain.
    const pkpWallet = new PKPEthersWallet({
      pkpPubKey: pkp.publicKey,
      controllerSessionSigs: sessionSigs,
    });

    setStatus("Using the PKPEthersWallet instance to sign a message...");
    // -- 9. Use the PKPEthersWallet instance to sign a message
    const signature = await pkpWallet.signMessage(TO_SIGN);
    setResponse(`signature: ${JSON.stringify(signature)}`);
  }

  return (
    <main>
      <div className="flex justify-center mt-10">
        <h1 className="text-5xl font-bold">Welcome!</h1>
        {router.query.message ? <p>Authentication Failed</p> : null}
        <p>
          Welcome to OneClickDapp, to use the dApp, authenticate with Google use
          the button below:
        </p>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={go}
          style={{
            backgroundColor: "#4285F4",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google Logo"
            style={{ width: "20px", marginRight: "10px" }}
          />
          Sign in with Google
        </button>
      </div>

      <div className="flex justify-center mt-10 text-white">
        <p>{status}</p>
      </div>

      <div className="flex justify-center mt-10 text-white">
        <p>{response}</p>
      </div>
    </main>
  );
}
