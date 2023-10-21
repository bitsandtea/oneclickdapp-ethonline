import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import useLocalStorage from "@/utils/useLocalStorage";
import { PKPClient } from "@lit-protocol/pkp-client";
import { ethers, utils } from "ethers";
import { useRouter } from "next/router";
import "../styles/globals.css";
import EditFunction from "../components/EditFunction";
import FooterNavbar from "../components/FooterNavbar";
import ReactDOMServer from "react-dom/server";
import {
  EthWalletProvider,
  GoogleProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";

import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import initLit, { getLitClient } from "@/utils/lit";
import oneClickABI from "@/ABIs/OneClick";
import web3 from "@/utils/web3";
import { ethRequestHandler } from "@lit-protocol/pkp-ethers";

const wizardSteps = [
  {
    id: "ABI",
  },
  {
    id: "Functions",
  },
  {
    id: "EachFunction",
  },
];

const FormPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [abi, setABI] = useState<string | boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [selectedFunctions, setSelectedFunctions] = useState<[Function]>({});
  const [functions, setFunctions] = useState<[Function] | false>(false);
  const [response, setResponse] = useState("");
  const [authProvider, setAuthProvider] = useState<any>(null);
  const [thisAddress, setThisAddress] = useState<string>("");
  const [authMethod, setAuthMethod] = useState<any>(null);
  const [enableSave, setEnableSave] = useState<boolean>(false);
  const [pkpWallet, setPKPWallet] = useState<any>(null);
  const [usersPKP, setUsersPKP] = useState<any>(null);
  const [userSigs, setSessionSigs] = useState<any>(null);

  const moveStep = (forward: boolean): void => {
    setStep((prevStep) => {
      if (forward) {
        if (prevStep < wizardSteps.length - 1) {
          return prevStep + 1;
        } else {
          return prevStep;
        }
      } else {
        if (prevStep > 0) {
          return prevStep - 1;
        } else {
          return prevStep;
        }
      }
    });
  };

  useEffect(() => {}, [abi, functions]);
  // steps for using LIT auth
  // 1. Create a LitAuthClient instance
  useEffect(() => {
    const fetchAuthProvider = async () => {
      const authProvider = await initLit();
      setAuthProvider(authProvider);
    };

    fetchAuthProvider();
  }, []);
  // 2. Create a LitAuthClient instance
  useEffect(() => {
    if (authProvider !== null) {
      // if (authMethod == null) authenticate(); // TODO enable
    }
  }, [authProvider]);

  useEffect(() => {
    if (authMethod !== null) fetchPKPs();
  }, [authMethod]);

  useEffect(() => {
    if (usersPKP !== null) {
      createWallets();
      setEnableSave(true);
    }
  }, [usersPKP]);

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedUsersPKP = localStorage.getItem("LIT_usersPKP");
    const savedUserSigs = localStorage.getItem("LIT_userSigs");
    const savedPkpWallet = localStorage.getItem("LIT_pkpWallet");

    if (savedPkpWallet) {
      setPKPWallet(JSON.parse(savedPkpWallet));
    }
    if (savedUsersPKP) {
      setUsersPKP(JSON.parse(savedUsersPKP));
    }
    if (savedUserSigs) {
      setSessionSigs(JSON.parse(savedUserSigs));
    }
  }, []);

  // Update data in localStorage whenever state changes
  useEffect(() => {
    if (usersPKP) {
      localStorage.setItem("LIT_usersPKP", JSON.stringify(usersPKP));
    }
  }, [usersPKP]);

  useEffect(() => {
    if (userSigs) {
      localStorage.setItem("LIT_userSigs", JSON.stringify(userSigs));
    }
  }, [userSigs]);
  useEffect(() => {
    if (pkpWallet) {
      localStorage.setItem("LIT_pkpWallet", JSON.stringify(pkpWallet));
    }
  }, [pkpWallet]);

  const authenticate = async () => {
    try {
      const fetchedAuthMethod = await authProvider.authenticate();
      setAuthMethod(fetchedAuthMethod);
    } catch (e) {
      // redirectToAuth();
      console.log("error: ", e);
    }
  };
  const redirectToAuth = () => {
    router.push("/auth?message=fail");
  };
  const fetchPKPs = async () => {
    setResponse(`authMethod: ${JSON.stringify(authMethod)}`);
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
    setUsersPKP(pkp);

    setStatus("Getting session sigs...");
    // -- 6. get session sigs
    try {
      const sessionSigs = await authProvider?.getSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethod: authMethod,
        sessionSigsParams: {
          chain: "mumbai",
          resourceAbilityRequests: [
            {
              resource: new LitActionResource("*"),
              ability: LitAbility.PKPSigning,
            },
            {
              resource: new LitActionResource("*"),
              ability: LitAbility.LitActionExecution,
            },
          ],
        },
      });
      setSessionSigs(sessionSigs);
      setResponse(`sessionSigs: ${JSON.stringify(sessionSigs)}`);
    } catch (e) {
      console.log("Failed to get session sigs:", e);
    }
  };

  const createWallets = async () => {
    setStatus("Creating PKP Ethers Wallet...");
    // -- 8. Create a PKPEthersWallet instance //interact with the blockchain.
    const pkpWallet = new PKPEthersWallet({
      pkpPubKey: usersPKP.publicKey,
      controllerSessionSigs: userSigs,
    });
    pkpWallet.setRpc(process.env.NEXT_PUBLIC_INFURA_URL || "");
    await pkpWallet.init();
    setPKPWallet(pkpWallet);

    const address = await pkpWallet.getAddress();
    setThisAddress(address);
    setStatus("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ABIValue = (
      event.currentTarget.elements.namedItem("ABI") as HTMLTextAreaElement
    ).value;
    const address = (
      event.currentTarget.elements.namedItem(
        "contractAddress"
      ) as HTMLInputElement
    ).value;
    const chainID = "155"; //TODO Hardcoded
    const name = (
      event.currentTarget.elements.namedItem("projectName") as HTMLInputElement
    ).value;
    const projectID = `usersPKP.publicKey_${name}`;
    newABI(ABIValue);
    storeDB(ABIValue, address, chainID, name, projectID, usersPKP.ethAddress);
  };

  const storeDB = async (
    ABI: string,
    address: string,
    chainID: string,
    name: string,
    projectID: string,
    userID: string
  ) => {
    console.log(pkpWallet);
    const oneClickContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ONECLICK_ADDRESS || "",
      oneClickABI,
      pkpWallet
    );

    const encABI = (await encrypt(ABI)).ciphertext;
    const encName = (await encrypt(name)).ciphertext;
    const encProjectID = (await encrypt(projectID)).ciphertext;
    const tx = await oneClickContract.insertIntoTable(
      encProjectID,
      encName,
      address,
      chainID,
      encABI
    );

    console.log("Tx sent: ", tx);

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

  async function getGasPricesInHex(percentageIncrease: number) {
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
  }

  const encrypt = async (message: string) => {
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
  // const newABI = (event: React.FormEvent) => {
  const newABI = (ABIValue: string) => {
    // Handle form submission
    // Get the form and ABI textarea value
    // const form = event.currentTarget;
    // const abiValue = (form.elements.namedItem("ABI") as HTMLTextAreaElement)
    // .value;
    // Validate the ABI value
    try {
      JSON.parse(ABIValue);
      setError(null);
      setABI(ABIValue);
      //travel through the abi and find the functions
      const abiArray: any = JSON.parse(ABIValue);

      const functions = abiArray.filter((item) => item.constant === false);
      const constants = abiArray.filter((item) => item.constant === true);
      setFunctions(functions);
      moveStep(true);
    } catch (error) {
      setError("ABI must be valid JSON");
      setABI(false);
      setFunctions(false);
    }
  };
  // const toggleFunctionSelection = (functionName: string) => {
  const toggleFunctionSelection = (
    functionName: string | undefined,
    isChecked: boolean
  ) => {
    if (functionName !== undefined) {
      const selFunction = getFunctionByName(functionName);
      if (isChecked) {
        setSelectedFunctions((prevSelectedFunctions) => ({
          ...prevSelectedFunctions,
          [functionName]: selFunction,
        }));
      } else {
        setSelectedFunctions((prevSelectedFunctions) => {
          const newSelectedFunctions = { ...prevSelectedFunctions };
          delete newSelectedFunctions[functionName];
          return newSelectedFunctions;
        });
      }
    }
  };

  async function getTransactionCount(
    address: string,
    blockNumber: string = "latest",
    plus: number = 0
  ): Promise<string> {
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
  }

  const selectAllFunctions = (select: boolean) => {
    if (functions) {
      const newSelectedFunctions: SelectedFunctions = {};

      functions.forEach((func) => {
        newSelectedFunctions[func.name] = select;
      });
      setSelectedFunctions(newSelectedFunctions);
    }
  };

  const getFunctionByName = (functionName: string) => {
    if (functions) {
      return functions.find((func) => func.name === functionName);
    }
  };

  return (
    <div>
      {(() => {
        switch (step) {
          case 0:
            return (
              <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-md shadow-md">
                  <div>
                    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                      Create a Project
                    </h1>
                    <div className="flex justify-center mt-10">
                      <p className="text-orange-400 italic">{status}</p>
                    </div>
                    <p className="text-gray-900">
                      Place your EVM, smart contract data ABI here to generate a
                      front end interface in forms of widgets for the functinos
                      of the smart contract that you customize. Then you can
                      import these widgets into your website or application.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                      {/* Project Name */}
                      <div className="mb-4">
                        <label
                          htmlFor="projectName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Project Name:
                        </label>
                        <input
                          defaultValue="USDC Token"
                          type="text"
                          id="projectName"
                          required
                          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                      </div>

                      {/* Contract Address */}
                      <div className="mb-4">
                        <label
                          htmlFor="contractAddress"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Contract Address:
                        </label>
                        <input
                          type="text"
                          id="contractAddress"
                          defaultValue="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                          required
                          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="ABI"
                          className="block text-sm font-medium text-gray-700"
                        >
                          ABI:
                        </label>
                        <textarea
                          id="ABI"
                          required
                          className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          rows="4"
                          defaultValue='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"_success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"_totalSupply","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"_success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"isAllowedToMint","outputs":[{"name":"_allowed","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"_balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_reason","type":"string"}],"name":"changeFreezeTransaction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addressToMint","type":"address"}],"name":"changeAllowanceToMint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"_success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenFrozen","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"_remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_atAddress","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mintTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_frozen","type":"bool"},{"indexed":false,"name":"_reason","type":"string"}],"name":"TokenFrozen","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Approval","type":"event"}]'
                        />
                        {error && (
                          <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={!enableSave}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          case 1:
            if (functions) {
              return (
                <div className="bg-white p-6 max-w-md mx-auto rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold mb-4">Functions</h1>
                  <p className="mb-4">
                    Select the functions that you would like to generate widgets
                    for
                  </p>
                  <table className="min-w-full divide-y divide-gray-500">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Select
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Function Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {functions.map((func, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              id={func.name}
                              checked={selectedFunctions[func.name] || false}
                              onChange={(e) =>
                                toggleFunctionSelection(
                                  func.name,
                                  e.target.checked
                                )
                              }
                              className="text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label
                              htmlFor={func.name}
                              className="text-sm text-gray-900"
                            >
                              {func.name}
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mb-2 space-x-2">
                    <button
                      onClick={() => selectAllFunctions(true)}
                      className="py-1 px-3 bg-gray-500 text-white rounded hover:bg-gray-600 active:bg-gray-700 focus:outline-none focus:border-gray-600 focus:ring focus:ring-gray-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => selectAllFunctions(false)}
                      className="py-1 px-3 bg-gray-500 text-white rounded hover:bg-gray-600 active:bg-gray-700 focus:outline-none focus:border-gray-600 focus:ring focus:ring-gray-200"
                    >
                      Clear
                    </button>
                  </div>

                  <FooterNavbar
                    backValue={false}
                    continueValue={2}
                    moveStep={moveStep}
                    setStep={setStep}
                  />
                </div>
              );
            }
          case 2:
            return (
              <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl w-full space-y-8 bg-white p-6 rounded-md shadow-md">
                  <div>
                    <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                      Functions
                    </h1>
                    {Object.entries(selectedFunctions).map(
                      ([funcName, funcDetails], index) => (
                        <EditFunction
                          key={index}
                          thisFunction={funcDetails}
                          code={ReactDOMServer.renderToString(
                            <EditFunction
                              key={index}
                              thisFunction={funcDetails}
                            />
                          )}
                        />
                      )
                    )}

                    <FooterNavbar
                      backValue={false}
                      continueValue={2}
                      moveStep={moveStep}
                      setStep={setStep}
                    />
                  </div>
                </div>
              </div>
            );
          default:
            return (
              <div>
                <h1>Step Not Found</h1>
                <p>Sorry, this step does not exist.</p>
              </div>
            );
        }
      })()}
    </div>
  );
};

export default FormPage;
