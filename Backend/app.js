"use strict";

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { create } = require("ipfs-http-client"); // Correct import for create function
const upload = multer({ storage: multer.memoryStorage() });
const app = express();

const ipfs = create({
  host: "localhost",
  port: 9001,
  protocol: "http",
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

const channelName = "channel1";
const chaincodeName = "nonPrivateData";
const walletPath = path.join(__dirname, "Org1");
const ccpPath = path.resolve(__dirname, "ReOrg1GatewayConnection.json");
const identity = "Org1 Admin";
const host = "0.0.0.0";
const port = 8952;

let gateway = new Gateway();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

async function initializeHyperledgerNetwork() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  let connectionProfile = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
  await gateway.connect(connectionProfile, {
    wallet,
    identity: identity,
    discovery: { enabled: true, asLocalhost: true },
  });
  const network = await gateway.getNetwork(channelName);
  return network.getContract(chaincodeName);
}

async function main() {
  const contract = await initializeHyperledgerNetwork();

  app.post("/submitPrice", async (req, res) => {
    const { assetId, seller, offerPrice } = req.body;
    try {
      await contract.submitTransaction(
        "createAsset",
        assetId,
        seller,
        offerPrice
      );
      res.status(200).send({
        message: "Asset created successfully",
        assetId: assetId.toString(),
      });
    } catch (error) {
      res.status(500).send(`Server error: ${error.message}`);
    }
  });

  app.post("/getMinimumPrice", async (req, res) => {
    const { assetId } = req.body;
    try {
      const result = await contract.evaluateTransaction(
        "getMinimumPrice",
        assetId
      );
      const minimumPrice = result.toString();
      res.status(200).send({ minimumPrice });
    } catch (error) {
      console.error(`Error fetching minimum price: ${error.message}`);
      res.status(500).send(`Error fetching minimum price: ${error.message}`);
    }
  });

  app.post("/getOfferPrice", async (req, res) => {
    const { assetId } = req.body;
    try {
      const result = await contract.evaluateTransaction(
        "getOfferPrice",
        assetId
      );
      const offerPrice = result.toString();
      res.status(200).send({ offerPrice });
    } catch (error) {
      console.error(`Error fetching offer price: ${error.message}`);
      res.status(500).send(`Error fetching offer price: ${error.message}`);
    }
  });

  app.post("/makeOffer", async (req, res) => {
    const { assetId, buyer, offerPrice } = req.body;
    try {
      await contract.submitTransaction("makeOffer", assetId, buyer, offerPrice);
      res.status(200).send(`Offer made by ${buyer} for ${offerPrice}`);
    } catch (error) {
      res.status(500).send(`Error making offer: ${error.message}`);
    }
  });

  app.post("/acceptOffer", async (req, res) => {
    const { assetId } = req.body;
    try {
      await contract.submitTransaction("acceptOffer", assetId);
      res.status(200).send("Offer Accepted. Phase 1 Complete. ");
    } catch (error) {
      res.status(500).send(`Error accepting offer: ${error.message}`);
    }
  });

  app.post("/rejectOffer", async (req, res) => {
    const { assetId } = req.body;
    try {
      await contract.submitTransaction("rejectOffer", assetId);
      res.status(200).send("Offer Rejected. Values are Reset.");
    } catch (error) {
      res.status(500).send(`Error rejecting offer: ${error.message}`);
    }
  });

  app.post(
    "/submitInspectionReport",
    upload.single("report"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).send("No report file uploaded.");
      }

      const { assetId, inspector } = req.body;

      try {
        console.log("Writing file to IPFS MFS...");
        // Define the MFS path where the file will be stored
        const mfsPath = `/reports/${Date.now()}_${req.file.originalname}`;

        // Write the file to IPFS MFS
        await ipfs.files.write(mfsPath, req.file.buffer, {
          create: true,
          parents: true,
        });

        // Get the CID of the file
        const stats = await ipfs.files.stat(mfsPath);
        const cid = stats.cid.toString();

        // Log the CID
        console.log(`File written to IPFS MFS with CID: ${cid}`);

        // Submit the transaction with the CID
        await contract.submitTransaction(
          "submitInspectionReport",
          assetId,
          inspector,
          cid
        );
        res.send(`Inspection report submitted with IPFS hash: ${cid}`);
      } catch (error) {
        res
          .status(500)
          .send(`Error submitting inspection report: ${error.message}`);
      }
    }
  );

  app.get("/getInspectionReport", async (req, res) => {
    const { assetId } = req.query;

    try {
      // Get the CID associated with the assetId from the ledger
      const result = await contract.evaluateTransaction(
        "getInspectionReport",
        assetId
      );
      const cid = result.toString();

      // Fetch the file from IPFS using the CID
      const fileBuffer = [];
      for await (const chunk of ipfs.cat(cid)) {
        fileBuffer.push(chunk);
      }

      const fileContent = Buffer.concat(fileBuffer);

      // Set headers and send the file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${assetId}_inspection_report"`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.send(fileContent);
    } catch (error) {
      console.error(`Error fetching inspection report: ${error.message}`);
      res
        .status(500)
        .send(`Error fetching inspection report: ${error.message}`);
    }
  });

  app.post("/fundEscrow", async (req, res) => {
    const { assetId } = req.body;
    try {
      await contract.submitTransaction("fundEscrow", assetId);
      res
        .status(200)
        .send(
          "Phase 1 and Phase 2 Validated Successfully.\nEscrow funded by Buyer Successfully "
        );
    } catch (error) {
      res
        .status(500)
        .send(
          `Error funding escrow: ${error.message}\nPhase 1 and Phase 2 must be completed first.`
        );
    }
  });

  app.post("/propertyTransfer", async (req, res) => {
    const { assetId } = req.body;
    try {
      await contract.submitTransaction("propertyTransfer", assetId);
      res
        .status(200)
        .send("Property Transferred from Seller to Buyer Successfully.");
    } catch (error) {
      res.status(500).send(`Error transferring property: ${error.message}`);
    }
  });

  app.post("/releaseEscrow", async (req, res) => {
    const { assetId } = req.body;
    try {
      await contract.submitTransaction("releaseEscrow", assetId);
      res
        .status(200)
        .send(
          "Escrow Funds Released to Seller Successfully.\nTransaction completed."
        );
    } catch (error) {
      res.status(500).send(`Error releasing escrow: ${error.message}`);
    }
  });

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
}

main().catch((error) => {
  console.error(`Failed to start application: ${error}`);
  process.exit(1);
});
