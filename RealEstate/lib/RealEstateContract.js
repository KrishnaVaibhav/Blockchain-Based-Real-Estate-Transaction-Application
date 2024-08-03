'use strict';

const { Contract } = require('fabric-contract-api');
const { v4: uuidv4 } = require('uuid'); // Include UUID library for generating unique identifiers

class RealEstateAsset {
    constructor(obj) {
        Object.assign(this, obj);
    }

    static createInstance(buyer, seller, offerPrice, ipfsHash) {
        // Generate a unique assetId using UUID and initialize with status 'available'
        return new RealEstateAsset({
            assetId: uuidv4(),
            buyer: buyer,
            seller: seller,
            offerPrice: offerPrice,
            ipfsHash: ipfsHash,
            status: 'available'  // Set initial status as available
        });
    }

    serialize() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        const json = JSON.parse(data.toString());
        return new RealEstateAsset(json);
    }
}

class RealEstateContract extends Contract {

    async createAsset(ctx, seller, offerPrice) {
        const asset = RealEstateAsset.createInstance('', seller, offerPrice, '');
        await ctx.stub.putState(asset.assetId, asset.serialize());
        return asset.assetId; // Return the newly generated assetId
    }

    async getAsset(ctx, assetId) {
        const buffer = await ctx.stub.getState(assetId);
        if (!buffer || buffer.length === 0) {
            throw new Error(`The asset ${assetId} does not exist`);
        }
        return RealEstateAsset.deserialize(buffer);
    }

    async makeOffer(ctx, assetId, buyer, offerPrice) {
        const asset = await this.getAsset(ctx, assetId);
        asset.buyer = buyer;
        asset.offerPrice = offerPrice;
        asset.status = 'offerMade';
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async acceptOffer(ctx, assetId) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'offerMade') {
            throw new Error('No valid offer made to accept');
        }
        asset.status = 'inspectionPending';
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async rejectOffer(ctx, assetId) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'offerMade') {
            throw new Error('No valid offer to reject');
        }
        asset.status = 'available'; // Revert status to 'available' when offer is rejected
        asset.buyer = '';
        asset.offerPrice = 0;
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async submitInspectionReport(ctx, assetId, inspector, ipfsHash) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'inspectionPending') {
            throw new Error('Inspection cannot proceed before offer acceptance');
        }
        asset.inspector = inspector;
        asset.ipfsHash = ipfsHash;
        asset.status = 'inspectionComplete';
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async fundEscrow(ctx, assetId) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'inspectionComplete') {
            throw new Error('Escrow cannot be funded before inspection completion');
        }
        asset.status = 'escrowFunded';
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async propertyTransfer(ctx, assetId) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'escrowFunded') {
            throw new Error('Property cannot be transferred before escrow funding');
        }
        asset.status = 'propertyTransferred';
        await ctx.stub.putState(assetId, asset.serialize());
    }

    async releaseEscrow(ctx, assetId) {
        const asset = await this.getAsset(ctx, assetId);
        if (asset.status !== 'propertyTransferred') {
            throw new Error('Escrow cannot be released before property transfer');
        }
        asset.status = 'completed';
        await ctx.stub.putState(assetId, asset.serialize());
    }
}

module.exports = RealEstateContract;
