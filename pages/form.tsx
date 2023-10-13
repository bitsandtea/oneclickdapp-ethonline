import { useEffect, useState } from "react";
import "../styles/globals.css";
import EditFunction from "../components/EditFunction";
import FooterNavbar from "../components/FooterNavbar";
import ReactDOMServer from "react-dom/server";

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
  const [error, setError] = useState<string | null>(null);
  const [abi, setABI] = useState<string | boolean>(false);
  const [step, setStep] = useState<number>(0);

  const [selectedFunctions, setSelectedFunctions] = useState<[Function]>({});
  const [functions, setFunctions] = useState<[Function] | false>(false);

  useEffect(() => {}, [abi, functions]);

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

  const newABI = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission
    // Get the form and ABI textarea value
    const form = event.currentTarget;
    const abiValue = (form.elements.namedItem("ABI") as HTMLTextAreaElement)
      .value;
    // Validate the ABI value
    try {
      JSON.parse(abiValue);
      setError(null);
      setABI(abiValue);
      //travel through the abi and find the functions
      const abiArray: any = JSON.parse(abiValue);

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
                    <p>
                      Place your EVM, smart contract data ABI here to generate a
                      front end interface in forms of widgets for the functinos
                      of the smart contract that you customize. Then you can
                      import these widgets into your website or application.
                    </p>
                  </div>
                  <form onSubmit={newABI} className="mt-8 space-y-6">
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
