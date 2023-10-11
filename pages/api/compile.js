import { exec } from "child_process";
import fs from "fs";

const CODE_DIR = "pages/api/temp/";
const PUBLIC_CODE_PATH = "./public/code";

const buildWebpackCommand = ({ entryPath, outputFilename, outputPath }) =>
  `npx webpack --entry ${entryPath} --output-path ${outputPath} --config webpack.config.js --output-filename ${outputFilename} --mode production --output-library Widget`;

const generateRandomFilename = (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

const compileCode = (webpackCommand) =>
  new Promise((resolve, reject) => {
    exec(webpackCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during compilation: ${error.message}`);
        reject("Compilation failed");
      } else if (stderr) {
        console.error(`STDERR: ${stderr}`);
        reject("Compilation failed");
      } else {
        console.log(`STDOUT: ${stdout}`);
        resolve();
      }
    });
  });

const deleteFile = (path) =>
  new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
        reject("Error deleting file");
      } else {
        console.log("File deleted successfully");
        resolve();
      }
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { code } = req.body;

  // TODO: Validate and sanitize code before proceeding.

  //   const filename = "toCompileComponent.jsx";
  const filename = `${generateRandomFilename(40)}.js`;
  const entryPath = CODE_DIR + filename;

  const [username, projectName, widgetName] = [
    "user123",
    "project123",
    "widget123",
  ]; //TODO: Retrieve dynamically

  await fs.promises.writeFile(entryPath, code, "utf-8");

  const outputFilename = `${username}_${projectName}_${widgetName}_bundled.js`;

  const webpackCommand = buildWebpackCommand({
    entryPath: `/${entryPath}`,
    outputFilename,
    outputPath: PUBLIC_CODE_PATH,
  });

  try {
    await compileCode(webpackCommand);

    const outputURL = `http://localhost:3000/code/${outputFilename}`; //TODO: Make base URL dynamic

    await deleteFile(entryPath);

    res.status(200).json({ url: outputURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
