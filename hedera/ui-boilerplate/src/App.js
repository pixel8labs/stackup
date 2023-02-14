import "./App.css";
import { useState, useEffect } from "react";
import {
  AccountId,
  PrivateKey,
  Client,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { Routes, Route, NavLink } from "react-router-dom";
import CreateCar from "./pages/CreateCar";
import GiveScore from "./pages/GiveScore";
import Borrow from "./pages/BorrowCar";
import Return from "./pages/ReturnCar";
import escrow from "./EScrow.json";
import { ethers } from "ethers";

function App() {
  const [defaultAccount, setDefaultAccount] = useState("");
  const [score, setScore] = useState(0);
  const [contract, setContract] = useState();

  // PART 1 - DEFINE ENVIRONMENT VARIABLES FROM .ENV FILE

  const merchantAddress = process.env.REACT_APP_MERCHANT_ADDRESS;

  // PART 2 - CREATE HEDERA TESTNET CLIENT INSTANCE

  const connect = async () => {
    if (window.ethereum) {
      // PART 3 - CONNECT WALLET FUNCTIONALITY USING ETHERS.JS

      window.ethereum.on("accountsChanged", changeConnectedAccount);

      const c = new ethers.Contract(escrowAddress, escrow.abi, signer);
      setContract(c);
    }
  };

  const changeConnectedAccount = async (newAddress) => {
    try {
      newAddress = Array.isArray(newAddress) ? newAddress[0] : newAddress;
      setDefaultAccount(newAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const getContract = async () => {
    // PART 4 - CREATE CONTRACT INSTANCE USING ETHERS.JS
  };

  const getScore = async () => {
    try {
      // PART 5 - GET USER REPUTATION SCORE FROM MIRROR NODE
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    connect();
    getScore();
  }, [defaultAccount]);

  const createCar = async (cid) => {
    try {
      if (!contract) getContract();
      // PART 6 - CREATE NEW CAR TO BE BORROWED FUNCTION

      alert(`Successfully created car NFT!`);
    } catch (e) {
      alert("Failed to create NFT");
      console.log(e);
    }
  };

  const borrowCar = async (id, serial) => {
    try {
      if (!contract) getContract();
      // PART 7 - BORROW CAR FUNCTION

      // PART 8 - SUBMIT BORROW LOGS TO THE TOPIC

      alert("Successfully Borrowed Car!");
    } catch (e) {
      alert("Fail to Borrow Car");
      console.log(e);
    }
  };

  const returnCar = async (id, serial) => {
    try {
      if (!contract) getContract();
      // PART 9 - RETURN CAR FUNCTION

      // PART 10 - SUBMIT RETURN LOGS TO THE TOPIC

      alert("Successfully Returned Car!");
    } catch (e) {
      alert("Fail to Return Car");
      console.log(e);
    }
  };

  // give a reputation score to a customer
  const giveScore = async (customer, score) => {
    try {
      if (!contract) getContract();
      // PART 11 - GIVE REPUTATION SCORE FUNCTION

      // PART 12 - SUBMIT GIVE REPUTATION SCORE LOGS TO THE TOPIC

      alert("Successfully Give Score!");
    } catch (e) {
      alert("Fail to Give Score");
      console.log(e);
    }
  };

  const isMerchant = defaultAccount === merchantAddress;
  return (
    <>
      <nav>
        <ul className="nav">
          {isMerchant ? (
            <>
              <NavLink to="/" className="nav-item">
                Add Car
              </NavLink>
              <NavLink to="/give" className="nav-item">
                Give Score
              </NavLink>
            </>
          ) : defaultAccount ? (
            <>
              <NavLink to="/" className="nav-item">
                Borrow Car
              </NavLink>
              <NavLink to="/give" className="nav-item">
                Return Car
              </NavLink>
            </>
          ) : (
            <></>
          )}
          <div className="acc-container">
            <p className="acc-score">
              My Reputation Score: {defaultAccount ? score : "0"}
            </p>
            <div className="connect-btn">
              <button
                onClick={defaultAccount ? changeConnectedAccount : connect}
                className="primary-btn"
              >
                {defaultAccount
                  ? `${defaultAccount?.slice(0, 5)}...${defaultAccount?.slice(
                      defaultAccount?.length - 4,
                      defaultAccount?.length
                    )}`
                  : "Connect"}
              </button>
            </div>
          </div>
        </ul>
      </nav>

      {!defaultAccount ? (
        <h1 className="center">Connect Your Wallet First</h1>
      ) : (
        <></>
      )}

      <Routes>
        {isMerchant ? (
          <>
            <Route path="/" element={<CreateCar createCar={createCar} />} />
            <Route path="/give" element={<GiveScore giveScore={giveScore} />} />
          </>
        ) : defaultAccount ? (
          <>
            <Route path="/" element={<Borrow borrowCar={borrowCar} />} />
            <Route
              path="/give"
              element={
                <Return returnCar={returnCar} address={defaultAccount} />
              }
            />
          </>
        ) : (
          <></>
        )}
      </Routes>
    </>
  );
}

export default App;
