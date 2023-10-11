module.exports = {
  output: {
    libraryTarget: "var", // This will expose your component as a global object when imported in the browser
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Regex to select all JS and JSX files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  externals: {
    react: "react", // This will avoid bundling React in your component if the consumer already has React
    "react-dom": "reactDOM",
  },
};
