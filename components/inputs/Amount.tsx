import React, { useState } from "react";

interface AmountInputProps {
  maxAmount: number;
  name: string;
}

const AmountInput: React.FC<AmountInputProps> = ({ maxAmount, name }) => {
  const [amount, setAmount] = useState<number>(0);
  const [percent, setPercent] = useState<number>(0);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(event.target.value) || 0;
    setAmount(newAmount);
    setPercent((newAmount / maxAmount) * 100);
  };

  const handlePercentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseInt(event.target.value, 10);
    setPercent(newPercent);
    setAmount((newPercent / 100) * maxAmount);
  };

  const handleMaxClick = () => {
    setAmount(maxAmount);
    setPercent(100);
  };

  const reset = () => {
    setAmount(0);
    setPercent(0);
  };

  return (
    <div className="max-w-xl w-full space-y-6 bg-white p-6 rounded-md shadow-md">
      <div className="space-y-2">
        <label
          htmlFor="amountInput"
          className="block text-sm font-medium text-gray-700"
        >
          Amount:
        </label>
        <input
          type="number"
          id="amountInput"
          value={amount}
          onChange={handleAmountChange}
          step="any"
          min="0"
          max={maxAmount}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div className="space-y-2">
        <input
          type="range"
          id="percentInput"
          value={percent}
          onChange={handlePercentChange}
          step="1"
          min="0"
          max="100"
          className="slider w-full rounded-full h-2 bg-blue-200 focus:outline-none focus:ring focus:border-blue-300"
        />
        <p className="text-gray-800">
          {percent}% of {maxAmount}
        </p>
      </div>
      <div className="flex justify-between items-center space-x-2">
        <button
          onClick={reset}
          className="bg-green-900 hover:bg-green-700 text-white font-normal py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          Reset
        </button>

        <button
          onClick={handleMaxClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          MAX
        </button>
        <span className="text-sm text-gray-500">Maximum: {maxAmount}</span>
      </div>
    </div>
  );
};

export default AmountInput;
