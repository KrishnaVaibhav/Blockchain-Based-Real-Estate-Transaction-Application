/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { RealEstateContract } = require('..');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

chai.should();
chai.use(chaiAsPromised);

class TestContext {
    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify({
            assetId: '123456',
            buyer: 'buyerId',
            seller: 'sellerId',
            offerPrice: 100000,
            ipfsHash: 'ipfsHashExample',
            status: 'available'  // Default status for initial tests
        })));
        this.stub.getState.withArgs('999999').resolves(Buffer.from(''));
    }
}

describe('RealEstateContract', () => {
    let contract;
    let ctx;

    beforeEach(() => {
        contract = new RealEstateContract();
        ctx = new TestContext();
    });

    describe('#createAsset', () => {
        it('should create an asset successfully', async () => {
            await contract.createAsset(ctx, 'sellerId', 200000);
            sinon.assert.calledOnce(ctx.stub.putState);
        });
    });

    describe('#makeOffer', () => {
        it('should make an offer on an asset', async () => {
            await contract.makeOffer(ctx, '123456', 'buyerId', 95000);
            sinon.assert.calledOnce(ctx.stub.putState);
        });
    });

    describe('#acceptOffer', () => {
        it('should accept an offer', async () => {
            // Setup the state as if an offer has been made
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'offerMade';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.acceptOffer(ctx, '123456');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should not accept an offer if no offer made', async () => {
            // No state change needed, the default is 'available'
            await contract.acceptOffer(ctx, '123456').should.be.rejectedWith(/No valid offer made to accept/);
        });
    });

    describe('#rejectOffer', () => {
        it('should reject an offer and reset status', async () => {
            // Setup the state as if an offer has been made
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'offerMade';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.rejectOffer(ctx, '123456');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should not reject an offer if no offer made', async () => {
            // No state change needed, the default is 'available'
            await contract.rejectOffer(ctx, '123456').should.be.rejectedWith(/No valid offer to reject/);
        });
    });

    describe('#submitInspectionReport', () => {
        it('should submit an inspection report', async () => {
            // Setup the state as if the offer has been accepted
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'inspectionPending';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.submitInspectionReport(ctx, '123456', 'inspectorId', 'newIpfsHash');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should throw an error if inspection is submitted without pending offer', async () => {
            // No state change needed, the default is 'available'
            await contract.submitInspectionReport(ctx, '123456', 'inspectorId', 'newIpfsHash').should.be.rejectedWith(/Inspection cannot proceed before offer acceptance/);
        });
    });

    describe('#fundEscrow', () => {
        it('should fund escrow after inspection is complete', async () => {
            // Setup the state as if inspection is complete
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'inspectionComplete';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.fundEscrow(ctx, '123456');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should not fund escrow before inspection', async () => {
            // No state change needed, the default is 'available'
            await contract.fundEscrow(ctx, '123456').should.be.rejectedWith(/Escrow cannot be funded before inspection completion/);
        });
    });

    describe('#propertyTransfer', () => {
        it('should transfer property after escrow is funded', async () => {
            // Setup the state as if escrow has been funded
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'escrowFunded';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.propertyTransfer(ctx, '123456');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should not transfer property before escrow funding', async () => {
            // No state change needed, the default is 'available'
            await contract.propertyTransfer(ctx, '123456').should.be.rejectedWith(/Property cannot be transferred before escrow funding/);
        });
    });

    describe('#releaseEscrow', () => {
        it('should release escrow after property is transferred', async () => {
            // Setup the state as if the property has been transferred
            const asset = JSON.parse(await ctx.stub.getState('123456'));
            asset.status = 'propertyTransferred';
            ctx.stub.getState.withArgs('123456').resolves(Buffer.from(JSON.stringify(asset)));

            await contract.releaseEscrow(ctx, '123456');
            sinon.assert.calledOnce(ctx.stub.putState);
        });

        it('should not release escrow before property transfer', async () => {
            // No state change needed, the default is 'available'
            await contract.releaseEscrow(ctx, '123456').should.be.rejectedWith(/Escrow cannot be released before property transfer/);
        });
    });
});
