module.exports = {
  output: {
    libraryTarget: "var", // This will expose your component as a global object when imported in the browser
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/, // Updated this line to include ts and tsx
        exclude: /node_modules/,
        exclude: /smartcontracts/,
        use: {
          loader: "babel-loader",
          // loader: "ts-loader",
          options: {
            presets: [
              "@babel/preset-typescript", // Added this line for TypeScript
              "@babel/preset-react", // For React
            ],
          },
        },
      },
      // {
      //   test: /\.(ts|tsx)$/,
      //   use: "ts-loader",
      //   exclude: /node_modules/,
      //   exclude: /smartcontracts/,
      // },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"], // Added .tsx and .ts extensions
  },
  externals: {
    react: "React", // This will avoid bundling React in your component if the consumer already has React
    "react-dom": "ReactDOM",
  },
};
