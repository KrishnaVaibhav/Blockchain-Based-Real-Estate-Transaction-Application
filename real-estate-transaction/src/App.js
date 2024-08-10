import React, { useState, useEffect } from "react";
import { getWeb3, getContract } from "./RealEstateTransaction";
import { create } from "ipfs-http-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css";
 
const ipfs = create({ url: "http://localhost:9002/api/v0" });
 
const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [fetchedMinPrice, setFetchedMinPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDetails, setOfferDetails] = useState(null);
  const [phase1Completed, setPhase1Completed] = useState(false);
  const [propertyTransferred, setPropertyTransferred] = useState(false);
  const [fundsReleased, setFundsReleased] = useState(false);
  const [message, setMessage] = useState("");
  const [showEscrowButtons, setShowEscrowButtons] = useState(false);
  const [showTransferButton, setShowTransferButton] = useState(false);
  const [showReleaseFundsButton, setShowReleaseFundsButton] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [inspectionReport, setInspectionReport] = useState("");
  const [fetchedInspectionReport, setFetchedInspectionReport] = useState("");
  const [inspectionReportFile, setInspectionReportFile] = useState(null);
  const [inspectionReportCid, setInspectionReportCid] = useState("");
  const [fileUrl, setFileUrl] = useState("");
 
  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const contract = await getContract(web3);
 
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
    };
    init();
  }, []);
 
  const handleSetMinPrice = async () => {
    try {
      await contract.methods
        .setMinPrice(web3.utils.toWei(minPrice, "ether"))
        .send({ from: accounts[0], gas: 500000 });
      setMessage("Minimum price set successfully!");
    } catch (error) {
      console.error("Error setting minimum price:", error);
      setMessage("Error setting minimum price.");
    }
  };
 
  const handleGetMinPrice = async () => {
    try {
      const price = await contract.methods.getMinPrice().call();
      setFetchedMinPrice(web3.utils.fromWei(price, "ether"));
      setMessage("Minimum price fetched successfully!");
    } catch (error) {
      console.error("Error fetching minimum price:", error);
      setMessage("Error fetching minimum price.");
    }
  };
 
  const handleMakeOffer = async () => {
    try {
      await contract.methods
        .makeOffer()
        .send({
          from: accounts[1],
          value: web3.utils.toWei(offerPrice, "ether"),
          gas: 500000,
        });
      setMessage("Offer made successfully!");
    } catch (error) {
      console.error("Error making offer:", error);
      setMessage("Error making offer.");
    }
  };
 
  const handleGetOffer = async () => {
    try {
      const details = await contract.methods
        .getOffer()
        .call({ from: accounts[0] });
      setOfferDetails(details);
      setMessage("Offer details fetched successfully!");
    } catch (error) {
      console.error("Error getting offer details:", error);
      setMessage("Error getting offer details.");
    }
  };
 
  const handleAcceptOffer = async () => {
    try {
      await contract.methods
        .acceptOffer()
        .send({ from: accounts[0], gas: 500000 });
      setPhase1Completed(true);
      setMessage("Offer accepted successfully! Phase 1 completed.");
    } catch (error) {
      console.error("Error accepting offer:", error);
      setMessage("Error accepting offer.");
    }
  };
 
  const handleRejectOffer = async () => {
    try {
      await contract.methods
        .rejectOffer()
        .send({ from: accounts[0], gas: 500000 });
      setOfferDetails(null);
      setOfferPrice("");
      setMessage("Offer rejected.");
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setMessage("Error rejecting offer.");
    }
  };
 
  const handleStartEscrow = () => {
    setShowEscrowButtons(true);
    setLogMessages([
      ...logMessages,
      "Escrow started. Buyer needs to send funds to escrow.",
    ]);
  };
 
  const handleSendFundsToEscrow = async () => {
    try {
      await contract.methods
        .makeOffer()
        .send({
          from: accounts[1],
          value: web3.utils.toWei(offerPrice, "ether"),
          gas: 500000,
        });
      setLogMessages([...logMessages, "Funds sent to escrow."]);
      setShowTransferButton(true);
    } catch (error) {
      console.error("Error sending funds to escrow:", error);
      setLogMessages([...logMessages, "Error sending funds to escrow."]);
    }
  };
 
  const handleTransferProperty = async () => {
    try {
      setLogMessages([...logMessages, "Transferring property..."]);
      await contract.methods
        .transferProperty()
        .send({ from: accounts[0], gas: 500000 });
      setPropertyTransferred(true);
      setLogMessages([...logMessages, "Property transferred successfully!"]);
      setShowReleaseFundsButton(true);
    } catch (error) {
      console.error("Error transferring property:", error);
      setLogMessages([...logMessages, "Error transferring property."]);
    }
  };
 
  const handleReleaseFunds = async () => {
    try {
      await contract.methods
        .releaseFunds()
        .send({ from: accounts[0], gas: 500000 });
      setFundsReleased(true);
      setLogMessages([
        ...logMessages,
        "Funds released to seller successfully!",
      ]);
    } catch (error) {
      console.error("Error releasing funds:", error);
      setLogMessages([...logMessages, "Error releasing funds."]);
    }
  };
 
  // Function to handle file input change
  const handleFileChange = (event) => {
    setInspectionReportFile(event.target.files[0]);
  };
 
  // Function to handle uploading the inspection report to IPFS and storing the hash on the blockchain
  const handleUploadInspectionReport = async () => {
    try {
      if (!inspectionReportFile) {
        setMessage("Please select a file first.");
        return;
      }
 
      // Read the file content
      const reader = new FileReader();
      reader.readAsArrayBuffer(inspectionReportFile);
      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const buffer = new Uint8Array(arrayBuffer);
        // Add the file content to IPFS
        const added = await ipfs.add(buffer);
        const cid = added.path;
        setInspectionReportCid(cid);
 
        // Store the IPFS hash on the blockchain
        await contract.methods
          .uploadInspectionReport(cid)
          .send({ from: accounts[0], gas: 500000 });
        setMessage(
          "Inspection report uploaded to IPFS and hash stored on blockchain successfully!"
        );
      };
    } catch (error) {
      console.error(
        "Error uploading inspection report to IPFS and storing hash on blockchain:",
        error
      );
      setMessage(
        "Error uploading inspection report to IPFS and storing hash on blockchain."
      );
    }
  };
 
  const handleGetInspectionReport = async () => {
    try {
      const cid = await contract.methods.getInspectionReport().call();
      if (!cid) {
        setMessage("No inspection report uploaded.");
        return;
      }
 
      setFileUrl(`http://localhost:8080/ipfs/${cid}`);
      setMessage("Inspection report fetched from IPFS successfully!");
    } catch (error) {
      console.error("Error fetching inspection report from IPFS:", error);
      setMessage("Error fetching inspection report from IPFS.");
    }
  };
 
  return (
    <div>
          <div className=" container">
      <h2 className="my-3" >Blockchain Based Real Estate Transaction Application</h2>
      <div className="row">
        <div className="section mx-5 col-5 ">
        <h2>Phase 1 : Quote Negotiation</h2>
        <div className="">
            <div className=" mt-5">
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
                <button onClick={handleSetMinPrice} className="btn btn-primary">Submit Price</button>
              </div>
            </div>
          </div>
          {/* Buyer Section */}
          <div className="">
            <div className=" mt-5">
              <h2>Buyer</h2>
              <div className="input-group mb-3">
                <button onClick={handleGetMinPrice} className="btn btn-primary">Get Minimum Price</button>
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
                <button onClick={handleMakeOffer} className="btn btn-primary">Submit Quote</button>
              </div>
            </div>
          </div>
          {/* Seller Section */}
          <div className="">
            <div className="mb-5 mt-5">
              <h2>Seller</h2>
              <div className="input-group mb-3">
                <button onClick={handleGetOffer} className="btn btn-primary">Get Quote Value</button>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="0.00 $"
                  disabled
                  value={offerDetails && web3.utils.fromWei(offerDetails[1], "ether")}
                />
              </div>

              <div className="mt-3">
                <button onClick={handleAcceptOffer} className="btn btn-success mx-3">Accept Quote</button>
                <button onClick={handleRejectOffer} className="btn btn-danger mx-3">Reject Quote</button>
              </div>
            </div>
          </div>
        </div>
        <div className="section mx-5 col-5">
          {/* Inspector Section */}
          <div className="mt-5 ">
            <h2>Phase 2 : Inspection Report</h2>
            <div className=" mb-3">
              <div>
                {" "}
                <label title="Inpector Uploads a Report Here" htmlFor="fileUpload" className="my-5 mx-2 form-label">
                  
                  <input type="file" className="form-control" id="fileUpload" onChange={handleFileChange} />
                </label>
                <button onClick={handleUploadInspectionReport} className="btn btn-primary mx-2">Upload</button>
              </div>
              <div>
                <button onClick={handleGetInspectionReport} className="btn btn-primary my-2 mx-5">Get File</button>
              </div>
            <div className="my-5">
              <h5>Inspector Report Logs</h5>
            <textarea
              className=" p-4 form-control"
              rows="5"
              placeholder="Print logs here"
              disabled
              value={message}
            ></textarea>
            </div>
            </div>
          </div>
        </div>
        {/* Logs Section */}
            <div className="section mt-5">
            <h2>Phase 3 : Escrow Transaction Logs</h2>
            <button title=" " className="btn btn-primary my-2 mx-5" onClick={handleStartEscrow} >Start Escrow Process</button>
            <button title="  " className="btn btn-primary my-2 mx-5" onClick={handleSendFundsToEscrow} >Buyer Funds Escrow</button>
            <button title=" " className="btn btn-primary my-2 mx-5"  onClick={handleTransferProperty}>Seller Transfer Property to Buyer</button>
            <button title=" " className="btn btn-primary my-2 mx-5"  onClick={handleReleaseFunds}>Escrow Pays Seller</button>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Print logs here"
              disabled
              value={logMessages.join("\n")}
            ></textarea>
          </div>
      </div>
    </div>
    <div className="container">
    <h1>Real Estate Transaction</h1>
      <div>
        <label>Set Minimum Price (ETH):</label>
        <input
          type="text"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <button onClick={handleSetMinPrice}>Set Minimum Price</button>
      </div>
      <div>
        <button onClick={handleGetMinPrice}>Get Minimum Price</button>
        {fetchedMinPrice && <p>Minimum Price: {fetchedMinPrice} ETH</p>}
      </div>
      <div>
        <label>Offer Price (ETH):</label>
        <input
          type="text"
          value={offerPrice}
          onChange={(e) => setOfferPrice(e.target.value)}
        />
        <button onClick={handleMakeOffer}>Make Offer</button>
      </div>
      <div>
        <button onClick={handleGetOffer}>Get Offer Details</button>
        {offerDetails && (
          <div>
            <p>Buyer: {offerDetails[0]}</p>
            <p>
              Offer Price: {web3.utils.fromWei(offerDetails[1], "ether")} ETH
            </p>
            <button onClick={handleAcceptOffer}>Accept Offer</button>
            <button onClick={handleRejectOffer}>Reject Offer</button>
          </div>
        )}
      </div>
      <button onClick={handleStartEscrow}>Start Escrow</button>
      {showEscrowButtons && (
        <div>
          <button onClick={handleSendFundsToEscrow}>
            Buyer Sends Funds to Escrow
          </button>
        </div>
      )}
      {showTransferButton && (
        <div>
          <button onClick={handleTransferProperty}>Transfer Property</button>
        </div>
      )}
      {showReleaseFundsButton && (
        <div>
          <button onClick={handleReleaseFunds}>Release Funds</button>
        </div>
      )}
      <div>
        {logMessages.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <div>
        <h2>Inspection Report</h2>
        <input type="file" onChange={handleFileChange} /> {/* File input */}
        <button onClick={handleUploadInspectionReport}>
          Upload Inspection Report
        </button>
      </div>
      <div>
        <button onClick={handleGetInspectionReport}>
          Get Inspection Report
        </button>
        {fileUrl && (
          <div>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              View Inspection Report
            </a>
          </div>
        )}
      </div>
      {message && <p>{message}</p>}
    </div>

    </div>
  );
};
 
export default App;