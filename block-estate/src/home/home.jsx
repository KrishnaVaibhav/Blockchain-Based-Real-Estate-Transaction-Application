import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css"; // Import the custom CSS file
const Home = () => {
  return (
    <div className=" container">
      <h2 className="my-3" >Blockchain-Based-Real-Estate-Transaction-Application</h2>
      <div className="row">
        <div className="section mx-5 col-5 ">
        <h2>Phase 1 : Quote Negotiation</h2>
        <div className="">
            <div className=" mt-5">
              <h2>Seller</h2>
              
              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="Enter Minimum Price"
                />
                <button className="btn btn-primary">Submit Price</button>
              </div>
            </div>
          </div>
          {/* Buyer Section */}
          <div className="">
            <div className=" mt-5">
              <h2>Buyer</h2>
              <div className="input-group mb-3">
                <button className="btn btn-primary">Get Minimum Price</button>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="0.00 $"
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="Enter Quote Value"
                />
                <button className="btn btn-primary">Submit Quote</button>
              </div>
            </div>
          </div>
          {/* Seller Section */}
          <div className="">
            <div className="mb-5 mt-5">
              <h2>Seller</h2>
              <div className="input-group mb-3">
                <button className="btn btn-primary">Get Quote Value</button>
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="0.00 $"
                  disabled
                />
              </div>

              <div className="mt-3">
                <button className="btn btn-success mx-3">Accept Quote</button>
                <button className="btn btn-danger mx-3">Reject Quote</button>
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
                  
                  <input type="file" className="form-control" id="fileUpload" />
                </label>
                <button className="btn btn-primary mx-2">Upload</button>
              </div>
              <div>
                <button className="btn btn-primary my-2 mx-5">Get File</button>
              </div>
            <div className="my-5">
              <h5>Inspector Report Logs</h5>
            <textarea
              className=" p-4 form-control"
              rows="5"
              placeholder="Print logs here"
              disabled
            ></textarea>
            </div>
            </div>
          </div>
        </div>
        {/* Logs Section */}
            <div className="section mt-5">
            <h2>Phase 3 : Escrow Transaction Logs</h2>
            <button title="Validate phase 1 & 2 and start escrow process " className="btn btn-primary my-2 mx-5"  >Start Escrow Process</button>
            <button title="Validate phase 1 & 2 and start escrow process " className="btn btn-primary my-2 mx-5"  >Buyer Funds Escrow</button>
            <button title="Validate phase 1 & 2 and start escrow process " className="btn btn-primary my-2 mx-5"  >Seller Transfer Property to Buyer</button>
            <button title="Validate phase 1 & 2 and start escrow process " className="btn btn-primary my-2 mx-5"  >Escrow Pays Seller</button>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Print logs here"
              disabled
            ></textarea>
          </div>
      </div>
    </div>
  );
};

export default Home;
