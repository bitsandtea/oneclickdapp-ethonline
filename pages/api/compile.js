import { exec } from "child_process";
import fs from "fs";
import uploadFile from "@/utils/web3storage";
import { getFilesFromPath } from "web3.storage";

import { Web3Storage } from "web3.storage";

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY,
});

const CODE_DIR = "temp/";
const PUBLIC_CODE_PATH = "./public/code";

const buildWebpackCommand = ({ entryPath, outputFilename, outputPath }) =>
  `npx webpack --entry ${entryPath} --output-path ${outputPath} --config webpack.config.js --output-filename ${outputFilename} --mode production --output-library Widget`;

function makeStorageClient() {
  return new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY });
}

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

async function getFiles(path) {
  const files = await getFilesFromPath(path);
  console.log(`read ${files.length} file(s) from ${path}`);
  return files;
}

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

async function storeFiles(files) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  console.log("stored files with cid:", cid);
  return cid;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { code } = req.body;
  const { functionData } = req.body;

  // TODO: Validate and sanitize code before proceeding.

  const filename = `${generateRandomFilename(40)}`;

  const entryPath = `${CODE_DIR + filename}_entry.tsx`;
  const entryFileContents = `
  import React from "react";
  import ReactDOM from "react-dom";
  import EditFunction from "../components/EditFunction";
  import "../styles/globals.css";
  const fData = ${JSON.stringify(functionData)}


  ReactDOM.render(
    <EditFunction thisFunction={fData} />,
    document.getElementById("root")
  );

  export default EditFunction;`;
  await fs.promises.writeFile(entryPath, entryFileContents, "utf-8");

  const outputFilename = `${generateRandomFilename(40)}_bundled.js`;

  const webpackCommand = buildWebpackCommand({
    entryPath: `/${entryPath}`,
    outputFilename,
    outputPath: PUBLIC_CODE_PATH,
  });
  try {
    await compileCode(webpackCommand);
    console.log(
      "compiled and stored at: ",
      `${PUBLIC_CODE_PATH}/${outputFilename}`
    );

    const files = await getFiles(`${PUBLIC_CODE_PATH}/${outputFilename}`);
    const stored = await storeFiles(files);

    await deleteFile(entryPath);

    const fullLink = `https://${stored}.ipfs.dweb.link/${outputFilename}`;

    https: res.status(200).json({ url: fullLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}
