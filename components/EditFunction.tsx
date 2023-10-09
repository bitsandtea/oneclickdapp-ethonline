// editFunction.tsx

import React from "react";

interface EditFunctionProps {
  thisFunction: Function;
}
const EditFunction: React.FC<EditFunctionProps> = ({ thisFunction }) => {
  return (
    <div>
      <h1>{thisFunction.name}</h1>
    </div>
  );
};

export default EditFunction;
