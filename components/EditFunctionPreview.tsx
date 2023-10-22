// editFunction.tsx

import React, { useEffect, useState } from "react";
import EthereumAddress from "./inputs/EthereumAddress";
import AmountInput from "./inputs/Amount";
import SubmitButton from "./inputs/SubmitButton";
import GetWidgetButton from "./inputs/GetWidgetButton";
import axios from "axios";

export interface EditFunctionPreviewProps {
  thisFunction: Function;

  funcName: string;
}

const EditFunctionPreview: React.FC<EditFunctionPreviewProps> = ({
  thisFunction,
  funcName,
}) => {
  //   const [widgetURLs, setWidgetURLs] = useState<{any}>({});
  const [widgetURLs, setWidgetURLs] = useState<{ [funcName: string]: string }>(
    {}
  );

  useEffect(() => {
    const getWidgetCode = async () => {
      try {
        console.log("getting widget code");
        const response = await fetch("http://localhost:3000/api/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ functionData: thisFunction }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        const data = await response.json();
        const newWidgetURLs = {
          ...widgetURLs,
          [thisFunction.name]: data.url, // Assume the URL you want is at response.data.url
        };
        setWidgetURLs(newWidgetURLs);
      } catch (error) {
        console.error("Compilation failed", error);
      }
    };
    getWidgetCode();
  }, [thisFunction]);
  //   const getWidgetCode = async (
  //     event: React.MouseEvent<HTMLButtonElement>,
  //     thisFunction: Function
  //   ) => {
  //     console.log("Event: , ", event);
  //     event.preventDefault();

  //     try {
  //       const response = await fetch("http://localhost:3000/api/compile", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ functionData: thisFunction }),
  //       });
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok " + response.statusText);
  //       }
  //       const data = await response.json();
  //       console.log("response is: ", data);
  //       // setWidgetURL(data);
  //       // return data;
  //     } catch (error) {
  //       console.error("Compilation failed", error);
  //     }
  //   };

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
          <div>
            <p>JS To Import URL: {widgetURLs[funcName]}</p>
          </div>
          <SubmitButton name={thisFunction.name} />
          {/* <button
            type="button"
            onClick={(event) => getWidgetCode(event, thisFunction)}
          >
            {" "}
            Get Widget
          </button> */}
        </div>
      </div>
    </div>
  );
};
export default EditFunctionPreview;
