// pages/api/tableland.js
import Web3 from "web3";

import { Database } from "@tableland/sdk";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end(); // Only allow POST requests.
  }

  const provider = new Web3.providers.HttpProvider(process.env.INFURA_URL);

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  console.log("accs: ", accounts);
  try {
    const { ABI, address, chainID, name, projectID, userID } = req.body;

    const db = new Database(process.env.TABLELAND_AUTH); // Initialize with necessary configurations if needed.

    const allColumns = "ABI, address, chainID, name, projectID, userID";
    const values = [ABI, address, chainID, name, projectID, userID];
    const dbName = process.env.TABLELAND_DB_NAME;

    const { meta: insert } = await db
      .prepare(
        `INSERT INTO ${dbName} (${allColumns}) VALUES (?, ?, ?, ?, ?, ?);`
      )
      .bind(values)
      .run();

    const txRes = await insert.txn?.wait();

    const { results } = await db.prepare(`SELECT * FROM ${dbName};`).all();

    return res.status(200).json({ txRes, results });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
