import React, { FC, useState } from "react";

const EthereumAddress: FC = () => {
  const [address, setAddress] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Basic validation for Ethereum address
    if (/^0x[a-fA-F0-9]{40}$/.test(inputValue) || inputValue === "") {
      setAddress(inputValue);
    } else {
      console.error("Invalid Ethereum address");
    }
  };

  return (
    <div className="max-w-xl w-full space-y-6 bg-white p-6 rounded-md shadow-md">
      <div className="space-y-2">
        <label
          htmlFor="ethereumAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Ethereum Address
        </label>
        <input
          type="text"
          id="ethereumAddress"
          name="ethereumAddress"
          maxLength={42}
          value={address}
          onChange={handleChange}
          className="mt-1 p-2 block w-full border-2 border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 transition duration-150 ease-in-out placeholder-gray-500"
          placeholder="0x..."
        />
      </div>
    </div>
  );
};

export default EthereumAddress;
