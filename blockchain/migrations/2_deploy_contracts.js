const RealEstateTransaction = artifacts.require("RealEstateTransaction");

module.exports = function (deployer) {
  const sellerAddress = "0x0a34D2FC628eF82195A442Ca2ceE1A056ab756F1"; // Replace with actual seller address
  deployer.deploy(RealEstateTransaction, sellerAddress);
};
