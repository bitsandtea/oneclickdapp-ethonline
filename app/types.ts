export type FunctionInput = {
  name: string;
  type: string;
  indexed: boolean;
};

export type Function = {
  name: string;
  constant: boolean;
  inputs: FunctionInput[];
  outputs: FunctionInput[];
  stateMutability: string;
  type: string;
  gas: number;
};
