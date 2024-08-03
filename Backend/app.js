'use strict';

const express = require('express');
const multer = require('multer');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { create } = require('ipfs-http-client');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const axios = require('axios');
const FormData = require('form-data'); 

const ipfs = create({
    host: '0.0.0.0',
    port: 5001,
    protocol: 'http',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
  
const channelName = 'channel1';
const chaincodeName = 'nonPrivateData3';
const walletPath = path.join(__dirname, 'Org1');
// const walletPath = path.join(__dirname, 'wallet');
const ccpPath = path.resolve(__dirname, 'RealEstateProjectOrg1GatewayConnection.json');
// const mspOrg1 = 'Org1MSP';
// const org1UserId = 'appUser';
const identity='Org1 Admin';
const host = '0.0.0.0';
const port = 8952;

let gateway = new Gateway();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initializeHyperledgerNetwork() {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    let connectionProfile = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    await gateway.connect(connectionProfile, {
        wallet,
        identity: identity,
        discovery: { enabled: true, asLocalhost: true }
    });
    const network = await gateway.getNetwork(channelName);
    return network.getContract(chaincodeName);
}

async function main() {
    const contract = await initializeHyperledgerNetwork();

    app.post('/createAsset', async (req, res) => {
        const { seller, offerPrice } = req.body;
        try {
            const assetId = await contract.submitTransaction('createAsset', seller, offerPrice);
            res.status(200).send({ message: 'Asset created successfully', assetId: assetId.toString() });
        } catch (error) {
            res.status(500).send(`Server error: ${error.message}`);
        }
    });

    app.post('/makeOffer', async (req, res) => {
        const { assetId, buyer, offerPrice } = req.body;
        try {
            await contract.submitTransaction('makeOffer', assetId, buyer, offerPrice);
            res.status(200).send(`Offer made by ${buyer} for ${offerPrice}`);
        } catch (error) {
            res.status(500).send(`Error making offer: ${error.message}`);
        }
    });

    app.post('/acceptOffer', async (req, res) => {
        const { assetId } = req.body;
        try {
            await contract.submitTransaction('acceptOffer', assetId);
            res.status(200).send('Offer accepted, moving to inspection phase');
        } catch (error) {
            res.status(500).send(`Error accepting offer: ${error.message}`);
        }
    });

    app.post('/rejectOffer', async (req, res) => {
        const { assetId } = req.body;
        try {
            await contract.submitTransaction('rejectOffer', assetId);
            res.status(200).send('Offer rejected, back to negotiation');
        } catch (error) {
            res.status(500).send(`Error rejecting offer: ${error.message}`);
        }
    });

    app.post('/submitInspectionReport', upload.single('report'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('No report file uploaded.');
        }
    
        const { assetId, inspector} = req.body; 
    
        try {
            // Upload the file to IPFS using ipfs-http-client
            const { cid } = await ipfs.add(req.file.buffer);
    
            // Submit the transaction with the CID
            await contract.submitTransaction('submitInspectionReport', assetId, inspector, cid.toString());
            res.send(`Inspection report submitted with IPFS hash: ${cid.toString()}`);
        } catch (error) {
            res.status(500).send(`Error submitting inspection report: ${error.message}`);
        }
    });
    

    app.post('/fundEscrow', async (req, res) => {
        const { assetId } = req.body;
        try {
            await contract.submitTransaction('fundEscrow', assetId);
            res.status(200).send('Escrow funded, ready for property transfer');
        } catch (error) {
            res.status(500).send(`Error funding escrow: ${error.message}`);
        }
    });

    app.post('/propertyTransfer', async (req, res) => {
        const { assetId } = req.body;
        try {
            await contract.submitTransaction('propertyTransfer', assetId);
            res.status(200).send('Property transferred');
        } catch (error) {
            res.status(500).send(`Error transferring property: ${error.message}`);
        }
    });

    app.post('/releaseEscrow', async (req, res) => {
        const { assetId } = req.body;
        try {
            await contract.submitTransaction('releaseEscrow', assetId);
            res.status(200).send('Escrow released, transaction completed');
        } catch (error) {
            res.status(500).send(`Error releasing escrow: ${error.message}`);
        }
    });

    app.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port}/`);
    });
}

main().catch(error => {
    console.error(`Failed to start application: ${error}`);
    process.exit(1);
});

