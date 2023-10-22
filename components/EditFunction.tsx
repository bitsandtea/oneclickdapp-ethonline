// editFunction.tsx

import React, { useState } from "react";
import EthereumAddress from "./inputs/EthereumAddress";
import AmountInput from "./inputs/Amount";
import SubmitButton from "./inputs/SubmitButton";

export interface EditFunctionProps {
  thisFunction: Function;
  code?: string;
}

const EditFunction: React.FC<EditFunctionProps> = ({ thisFunction }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-6 rounded-md shadow-md">
        <div>
          <h1 className="mt-6 text-center text-2xl font-bold text-blue-900">
            {thisFunction.name}
          </h1>
          {thisFunction.inputs &&
            thisFunction.inputs.map((input, index) =>
              (() => {
                // let Component;
                switch (input.type) {
                  case "address":
                    return <EthereumAddress key={index} />;
                  case "uint256":
                    return (
                      <AmountInput
                        key={index}
                        name={input.name}
                        maxAmount={1000}
                      />
                    );
                  default:
                    return null;
                }
              })()
            )}
          <SubmitButton name={thisFunction.name} />
        </div>
      </div>
    </div>
  );
};
export default EditFunction;
