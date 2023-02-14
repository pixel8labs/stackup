import "./App.css";
import { useState, useEffect } from "react";
import {
  AccountId,
  PrivateKey,
  Client,
  AccountBalanceQuery,
  TransferTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { Routes, Route, NavLink } from "react-router-dom";
import CreateNFT from "./pages/CreateNFT";
import GiveScore from "./pages/GiveScore";
import Borrow from "./pages/BorrowNFT";
import Return from "./pages/ReturnNFT";
import escrow from "./contract.json";
import { ethers } from "ethers";

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [score, setScore] = useState(0);
  const [contract, setContract] = useState();

  // connect to wallet using Ethers.js
  const connect = async () => {
    // INSERT CODE FOR DECLARING ETHERS.JS PROVIDER AND CONNECT FUNCTION HERE
  };

  useEffect(() => {
    connect();
  }, []);

  const getContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    signer.getAddress().then(setDefaultAccount);
    const c = new ethers.Contract(contractAddress, escrow.abi, signer);
    setContract(c);
  };

  const changeConnectedAccount = async (newAddress) => {
    try {
      newAddress = Array.isArray(newAddress) ? newAddress[0] : newAddress;

      setDefaultAccount(newAddress);
    } catch (err) {
      console.error(err);
    }
  };

  // get variables value from the .env file
  // INSERT .ENV VARIABLES HERE

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;

  // create Hedera testnet client
  // INSERT CODE FOR CREATING HEDERA TESTNET CLIENT HERE

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
  const createNFT = async (cid) => {
    try {
      // INSERT CODE FOR CREATING A NEW CAR BY MINTING THE CAR NFT HERE USING ETHERS.JS

      alert(`Successfully created car NFT with token ID!`);
    } catch (e) {
      alert("Failed to create NFT");
      console.log(e);
    }
  };

  // borrow a car NFT
  const borrowNFT = async (id) => {
    try {
      // INSERT CODE FOR BORROWING A CAR NFT HERE USING ETHERS.JS

      alert("Successfully Borrowed Car!");
    } catch (e) {
      alert("Fail to Borrow Car");
      console.log(e);
    }
  };

  // return a car NFT
  const returnNFT = async (id) => {
    try {
      // INSERT CODE FOR RETURNING A CAR NFT HERE USING ETHERS.JS

      alert("Successfully Returned Car!");
    } catch (e) {
      alert("Fail to Return Car");
      console.log(e);
    }
  };

  // give a credit/reputation score to a customer
  const giveScore = async (customer) => {
    try {
      const ftId = AccountId.fromString(process.env.REACT_APP_FT_ID);

      // INSERT CODE FOR GIVING A CREDIT/REPUTATION SCORE TO A CUSTOMER HERE USING HEDERA TOKEN SERVICE API

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
              <button onClick={connect} className="primary-btn">
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
        <Route
          path="/return"
          element={<Return returnNFT={returnNFT} address={defaultAccount} />}
        />
      </Routes>
    </>
  );
}

export default App;
