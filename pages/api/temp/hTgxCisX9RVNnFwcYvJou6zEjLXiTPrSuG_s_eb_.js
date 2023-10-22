import React from "react";
import ReactDOM from "react-dom";
import EditFunction from "../../../../components/EditFunction";
import "../../styles/style.scss";
const fData = {
  constant: false,
  inputs: [
    { name: "_to", type: "address" },
    { name: "_amount", type: "uint256" },
  ],
  name: "transfer",
  outputs: [{ name: "_success", type: "bool" }],
  payable: false,
  stateMutability: "nonpayable",
  type: "function",
};

ReactDOM.render(
  <EditFunction thisFunction={fData} />,
  document.getElementById("root")
);
