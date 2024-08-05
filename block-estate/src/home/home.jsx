import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css";

const Home = () => {
  const [minPrice, setMinPrice] = useState("");
  const [fetchedMinPrice, setFetchedMinPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDetails, setOfferDetails] = useState(null);
  const [phase1Completed, setPhase1Completed] = useState(false);
  const [phase1Logs, setPhase1Logs] = useState("");
  const [phase2Logs, setPhase2Logs] = useState("");
  const [phase3Logs, setPhase3Logs] = useState("");
  const [inspectionReportFile, setInspectionReportFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [assetId, setAssetId] = useState("780800"); // Example assetId
  const [inspector, setInspector] = useState("Akku"); // Example inspector

  const handleFileChange = (event) => {
    setInspectionReportFile(event.target.files[0]);
  };

  const handleSetMinPrice = async () => {
    try {
      const response = await axios.post("http://localhost:8952/submitPrice", {
        assetId: assetId,
        seller: "seller1", // Example seller
        offerPrice: minPrice,
      });
      setPhase1Logs(response.data.message);
    } catch (error) {
      console.error("Error setting minimum price:", error);
      setPhase1Logs("Error setting minimum price.");
    }
  };

  const handleGetMinPrice = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8952/getMinimumPrice",
        {
          assetId: assetId,
        }
      );
      setFetchedMinPrice(response.data.minimumPrice);
      setPhase1Logs("Minimum price fetched successfully!");
    } catch (error) {
      console.error("Error fetching minimum price:", error);
      setPhase1Logs("Error fetching minimum price.");
    }
  };

  const handleMakeOffer = async () => {
    try {
      const response = await axios.post("http://localhost:8952/makeOffer", {
        assetId: assetId,
        buyer: "buyer1", // Example buyer
        offerPrice: offerPrice,
      });
      setPhase1Logs(response.data);
    } catch (error) {
      console.error("Error making offer:", error);
      setPhase1Logs("Error making offer.");
    }
  };

  const handleGetOffer = async () => {
    try {
      const response = await axios.post("http://localhost:8952/getOfferPrice", {
        assetId: assetId,
      });
      setOfferDetails(response.data);
      setPhase1Logs("Offer details fetched successfully!");
    } catch (error) {
      console.error("Error getting offer details:", error);
      setPhase1Logs("Error getting offer details.");
    }
  };

  const handleAcceptOffer = async () => {
    try {
      const response = await axios.post("http://localhost:8952/acceptOffer", {
        assetId: assetId,
      });
      setPhase1Completed(true);
      setPhase1Logs(response.data);
    } catch (error) {
      console.error("Error accepting offer:", error);
      setPhase1Logs("Error accepting offer.");
    }
  };

  const handleRejectOffer = async () => {
    try {
      const response = await axios.post("http://localhost:8952/rejectOffer", {
        assetId: assetId,
      });
      setOfferDetails(null);
      setMinPrice("");
      setFetchedMinPrice("");
      setOfferPrice("");
      setFetchedMinPrice("");
      setPhase1Logs(response.data);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setPhase1Logs("Error rejecting offer.");
    }
  };

  const handleUploadInspectionReport = async () => {
    try {
      if (!inspectionReportFile) {
        setPhase2Logs("Please select a file first.");
        return;
      }

      const formData = new FormData();
      formData.append("report", inspectionReportFile);
      formData.append("assetId", assetId);
      formData.append("inspector", inspector);

      const response = await axios.post(
        "http://localhost:8952/submitInspectionReport",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPhase2Logs(response.data);
    } catch (error) {
      console.error("Error uploading inspection report:", error);
      setPhase2Logs("Error uploading inspection report.");
    }
  };

  const handleGetInspectionReport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8952/getInspectionReport",
        {
          params: { assetId },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setPhase2Logs("Inspection report fetched successfully!");
    } catch (error) {
      console.error("Error fetching inspection report:", error);
      setPhase2Logs("Error fetching inspection report.");
    }
  };

  const handleSendFundsToEscrow = async () => {
    try {
      const response = await axios.post("http://localhost:8952/fundEscrow", {
        assetId,
      });
      setPhase3Logs(response.data);
    } catch (error) {
      console.error("Error sending funds to escrow:", error);
      setPhase3Logs("Error sending funds to escrow.");
    }
  };

  const handleTransferProperty = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8952/propertyTransfer",
        { assetId }
      );
      setPhase3Logs(response.data);
    } catch (error) {
      console.error("Error transferring property:", error);
      setPhase3Logs("Error transferring property.");
    }
  };

  const handleReleaseFunds = async () => {
    try {
      const response = await axios.post("http://localhost:8952/releaseEscrow", {
        assetId,
      });
      setPhase3Logs(response.data);
    } catch (error) {
      console.error("Error releasing funds:", error);
      setPhase3Logs("Error releasing funds.");
    }
  };

  return (
    <div>
      <div className="container">
        <h2 className="my-3">
          Blockchain Based Real Estate Transaction Application
        </h2>
        <div className="row">
          <div className="section mx-5 col-5">
            <h2>Phase 1 : Quote Negotiation</h2>
            <div className="mt-5">
              <h2>Seller</h2>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  step="0.01"
                  placeholder="Enter Minimum Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <button onClick={handleSetMinPrice} className="btn btn-primary">
                  Submit Price
                </button>
              </div>
              <h2>Buyer</h2>
              <div className="input-group mb-3">
                <button onClick={handleGetMinPrice} className="btn btn-primary">
                  Get Minimum Price
                </button>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="0.00 $"
                  value={fetchedMinPrice}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="Enter Quote Value"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                <button onClick={handleMakeOffer} className="btn btn-primary">
                  Submit Quote
                </button>
              </div>
              <h2>Seller</h2>
              <div className="input-group mb-3">
                <button onClick={handleGetOffer} className="btn btn-primary">
                  Get Quote Value
                </button>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="0.00 $"
                  disabled
                  value={offerDetails && offerDetails.offerPrice}
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={handleAcceptOffer}
                  className="btn btn-success mx-3"
                >
                  Accept Quote
                </button>
                <button
                  onClick={handleRejectOffer}
                  className="btn btn-danger mx-3"
                >
                  Reject Quote
                </button>
              </div>
              <div className="my-5">
                <h5>Phase 1 Logs</h5>
                <textarea
                  className="p-4 form-control"
                  rows="5"
                  placeholder="Print logs here"
                  disabled
                  value={phase1Logs}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="section mx-5 col-5">
            <div className="mt-5">
              <h2>Phase 2 : Inspection Report</h2>
              <div className="mb-3">
                <label
                  title="Inspector Uploads a Report Here"
                  htmlFor="fileUpload"
                  className="my-5 mx-2 form-label"
                >
                  <input
                    type="file"
                    className="form-control"
                    id="fileUpload"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  onClick={handleUploadInspectionReport}
                  className="btn btn-primary mx-2"
                >
                  Upload
                </button>
              </div>
              <div>
                <button
                  onClick={handleGetInspectionReport}
                  className="btn btn-primary my-2 mx-5"
                >
                  Get File
                </button>
              </div>
              <div className="my-5">
                <h5>Phase 2 Logs</h5>
                <textarea
                  className="p-4 form-control"
                  rows="5"
                  placeholder="Print logs here"
                  disabled
                  value={phase2Logs}
                ></textarea>
              </div>
              {fileUrl && (
                <div>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    View Inspection Report
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="section mt-5">
          <h2>Phase 3 : Escrow Transaction </h2>
          <button
            className="btn btn-primary my-2 mx-5"
            onClick={handleSendFundsToEscrow}
          >
            Start Escrow Process
          </button>
          <button
            className="btn btn-primary my-2 mx-5"
            onClick={handleTransferProperty}
          >
            Seller Transfer Property to Buyer
          </button>
          <button
            className="btn btn-primary my-2 mx-5"
            onClick={handleReleaseFunds}
          >
            Escrow Pays Seller
          </button>
          <div className="my-5">
            <h5>Phase 3 Logs</h5>
            <textarea
              className="p-4 form-control"
              rows="5"
              placeholder="Print logs here"
              disabled
              value={phase3Logs}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
