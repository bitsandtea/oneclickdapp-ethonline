interface FooterNavbarProps {
  backValue: boolean | number;
  continueValue: boolean | number;
  moveStep: (value: boolean | number) => void;
  setStep: (value: boolean | number) => void;
}

const FooterNavbar: React.FC<FooterNavbarProps> = ({
  backValue,
  continueValue,
  moveStep,
  setStep,
}) => {
  return (
    <div className="mt-4 space-x-4">
      <button
        onClick={() => moveStep(backValue)}
        className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 active:bg-red-800 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200"
      >
        Back
      </button>
      <button
        onClick={() => setStep(continueValue)}
        className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 focus:outline-none focus:border-green-700 focus:ring focus:ring-green-200"
      >
        Continue
      </button>
    </div>
  );
};

export default FooterNavbar;
