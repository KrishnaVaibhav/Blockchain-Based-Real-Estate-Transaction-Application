// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract RealEstateTransaction {
    address payable public seller;
    address public buyer;
    uint256 public minPrice;
    uint256 public offerPrice;
    bool public offerAccepted;
    bool public propertyTransferred;
    bool public fundsReleased;

    // Events to log actions
    event MinPriceSet(address indexed seller, uint256 minPrice);
    event OfferMade(address indexed buyer, uint256 offerPrice);
    event OfferAccepted(address indexed seller, address indexed buyer, uint256 offerPrice);
    event OfferRejected(address indexed seller, address indexed buyer, uint256 offerPrice);
    event PropertyTransferred(address indexed seller, address indexed buyer);
    event FundsReleased(address indexed seller, uint256 amount);

    constructor(address payable _seller) {
        seller = _seller;
    }

    // Function for seller to set minimum asking price
    function setMinPrice(uint256 _minPrice) external {
        require(msg.sender == seller, "Only the seller can set the minimum price.");
        minPrice = _minPrice;
        emit MinPriceSet(seller, _minPrice);
    }

    // Function to get minimum asking price
    function getMinPrice() external view returns (uint256) {
        return minPrice;
    }

    // Function for buyer to make an offer
    function makeOffer() external payable {
        require(msg.value >= minPrice, "Offer price must be at least the minimum price.");
        buyer = msg.sender;
        offerPrice = msg.value;
        emit OfferMade(msg.sender, msg.value);
    }

    // Function for seller to get the offer details
    function getOffer() external view returns (address, uint256) {
        require(msg.sender == seller, "Only the seller can call this.");
        return (buyer, offerPrice);
    }

    // Function for seller to accept the offer
    function acceptOffer() external {
        require(msg.sender == seller, "Only the seller can accept the offer.");
        require(buyer != address(0), "No offer made.");
        offerAccepted = true;
        emit OfferAccepted(seller, buyer, offerPrice);
    }

    // Function for seller to reject the offer
    function rejectOffer() external {
        require(msg.sender == seller, "Only the seller can reject the offer.");
        require(buyer != address(0), "No offer made.");
        payable(buyer).transfer(offerPrice); // Refund the buyer
        buyer = address(0);
        offerPrice = 0;
        emit OfferRejected(seller, buyer, offerPrice);
    }

    // Function for seller to confirm property transfer
    function transferProperty() external {
        require(msg.sender == seller, "Only the seller can transfer the property.");
        require(offerAccepted, "Offer must be accepted first.");
        propertyTransferred = true;
        emit PropertyTransferred(seller, buyer);
    }

    // Function to release escrow funds to seller
    function releaseFunds() external {
        require(propertyTransferred, "Property must be transferred first.");
        require(msg.sender == seller || msg.sender == buyer, "Only buyer or seller can release funds.");
        payable(seller).transfer(offerPrice);
        fundsReleased = true;
        emit FundsReleased(seller, offerPrice);
    }
}
