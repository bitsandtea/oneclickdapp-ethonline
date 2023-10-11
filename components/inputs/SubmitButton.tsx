import React from "react";

const SubmitButton: React.FC<SubmitButtonProps> = ({ name }) => {
  return (
    <div className="flex justify-between items-center space-x-2">
      <button
        //   onClick={submit}
        className="w-full bg-yellow-900 hover:bg-orange-700 text-white font-normal py-2 px-4 rounded transition duration-300 ease-in-out"
      >
        {name}
      </button>
    </div>
  );
};

export default SubmitButton;
