import "./App.css";
import { useState, useEffect } from "react";
import {
  AccountId,
  PrivateKey,
  Client,
  AccountBalanceQuery,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  TransferTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { Routes, Route, NavLink } from "react-router-dom";
import CreateNFT from "./pages/CreateNFT";
import GiveScore from "./pages/GiveScore";
import Borrow from "./pages/BorrowNFT";
import Return from "./pages/ReturnNFT";
import Web3 from "web3";

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [score, setScore] = useState(0);

  // declaring the Web3.js provider
  // {PUT YOUR CODE HERE}

  // connect to wallet using Web3.js
  // {PUT YOUR CODE HERE}

  // get variables value from the .env file
  // {PUT YOUR CODE HERE}

  // create Hedera testnet client
  // {PUT YOUR CODE HERE}

  useEffect(() => {
    // get the user credit score from the mirror node
    const getScore = async () => {
      try {
        await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${process.env.REACT_APP_CUSTOMER_ACCOUNT_ID}/tokens?token.id=${process.env.REACT_APP_FT_ID}`
        )
          .then((response) => response.json())
          .then((data) => {
            setScore(data?.tokens[0]?.balance);
          });
      } catch (e) {
        console.log(e);
      }
    };

    getScore();
  }, []);

  // create a new car NFT
  const createNFT = async (name, symbol, maxSupply) => {
    try {
      // {PUT YOUR CODE HERE}

      alert(`Successfully created car NFT!`);
    } catch (e) {
      alert("Failed to create NFT");
    }
  };

  // borrow a car NFT
  const borrowNFT = async (id) => {
    try {
      const nftId = AccountId.fromString(id);

      // Borrowing the Car
      // {PUT YOUR CODE HERE}

      alert("Successfully Borrowed Car!");
    } catch (e) {
      alert("Fail to Borrow Car");
    }
  };

  // return a car NFT
  const returnNFT = async (id) => {
    try {
      const nftId = AccountId.fromString(id);

      // Returning the Car
      // {PUT YOUR CODE HERE}

      alert("Successfully Returned Car!");
    } catch (e) {
      alert("Fail to Return Car");
    }
  };

  // give a credit/reputation score to a customer
  const giveScore = async (customer) => {
    try {
      const ftId = AccountId.fromString(process.env.REACT_APP_FT_ID);

      // Credit Scoring
      // {PUT YOUR CODE HERE}

      alert("Successfully Give Score!");
    } catch (e) {
      alert("Fail to Give Score");
    }
  };

  return (
    <>
      <nav>
        <ul className="nav">
          <NavLink to="/" className="nav-item">
            Add Car
          </NavLink>
          <NavLink to="/score" className="nav-item">
            Give Score
          </NavLink>
          <NavLink to="/borrow" className="nav-item">
            Borrow Car
          </NavLink>
          <NavLink to="/return" className="nav-item">
            Return Car
          </NavLink>
          <div className="acc-container">
            <p className="acc-score">My Credit Score: {score}/5</p>
            <div className="connect-btn">
              <button className="primary-btn">
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
      <Routes>
        <Route path="/" element={<CreateNFT createNFT={createNFT} />} />
        <Route path="/score" element={<GiveScore giveScore={giveScore} />} />
        <Route path="/borrow" element={<Borrow borrowNFT={borrowNFT} />} />
        <Route path="/return" element={<Return returnNFT={returnNFT} />} />
      </Routes>
    </>
  );
}

export default App;
