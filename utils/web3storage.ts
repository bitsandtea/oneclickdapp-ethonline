import { Web3Storage } from "web3.storage";

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY,
});

const uploadFile = async (
  dataString: string,
  filename: string = "data.txt"
): Promise<string> => {
  try {
    console.log("Uploading file...", dataString, filename);
    // Convert the string to a Blob
    const blob = new Blob([dataString], { type: "text/plain" });

    // Create a File object with a name
    const file = new File([blob], filename);

    // Upload the file to Web3.Storage
    const rootCid = await client.put([file]); // The array contains a single File object

    // Optionally, check the status of the upload
    // const info = await client.status(rootCid);

    // Return the root CID as a string
    return rootCid.toString();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export default uploadFile;
