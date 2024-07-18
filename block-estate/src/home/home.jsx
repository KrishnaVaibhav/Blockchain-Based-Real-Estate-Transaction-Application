import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./home.css"; // Import the custom CSS file
const Home = () => {
  return (
    <div className="container">
      <h1>Home</h1>
      <div className="row">
        <div className="section mx-5 col-5 ">
          {/* Buyer Section */}
          <div className="">
            <div className="section mt-5">
              <h2>Buyer</h2>
              <div className="input-group mb-3">
                <input
                  type="number"
                  className="form-control"
                  step="0.01"
                  placeholder="Enter Quote"
                />
                <button className="btn btn-primary">Submit Quote</button>
              </div>
            </div>
          </div>
          {/* Seller Section */}
          <div className="">
            <div className="section mt-5">
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
                <button className="btn btn-success">Accept Quote</button>
                <button className="btn btn-danger">Reject Quote</button>
              </div>
            </div>
          </div>
        </div>
        <div className="section mx-5 col-5">
          {/* Inspector Section */}
          <div className="section mt-5 ">
            <h2>Inspector</h2>
            <div className="mb-3">
              <div>
                {" "}
                <label htmlFor="fileUpload" className="form-label">
                  Upload File
                  <input type="file" className="form-control" id="fileUpload" />
                </label>
                <button className="btn btn-primary">Upload</button>
              </div>
              <div>
                <button className="btn btn-primary">Get File</button>
              </div>
            </div>
          </div>
          {/* Logs Section */}
          <div className="section mt-5">
            <h2>Logs</h2>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Print logs here"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
