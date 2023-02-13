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
import { ethers } from 'ethers';

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [score, setScore] = useState(0);
  const [contract, setContract] = useState();

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner()
      signer.getAddress().then(setDefaultAccount);
      const c = new ethers.Contract(contractAddress, escrow.abi, signer);
      setContract(c);
      window.ethereum.on("accountsChanged", changeConnectedAccount);
    }
  };

  const getContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const signer = provider.getSigner()
    signer.getAddress().then(setDefaultAccount);
    const c = new ethers.Contract(contractAddress, escrow.abi, signer);
    setContract(c);
  }

  const changeConnectedAccount = async (newAddress) => {
    try {
      newAddress = Array.isArray(newAddress) ? newAddress[0] : newAddress;

      setDefaultAccount(newAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const operatorId = AccountId.fromString(process.env.REACT_APP_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(
    process.env.REACT_APP_OPERATOR_PRIVATE_KEY
  );
  const treasuryId = AccountId.fromString(process.env.REACT_APP_TREASURY_ID);
  const treasuryKey = PrivateKey.fromString(
    process.env.REACT_APP_TREASURY_PRIVATE_KEY
  );
  const customerId = AccountId.fromString(
    process.env.REACT_APP_CUSTOMER_ACCOUNT_ID
  );

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;

  // create Hedera testnet client
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

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
      if(!contract) getContract();
      console.log(tokenAddress, contract, cid)
      const tx = await contract.mintNFT(tokenAddress, [Buffer.from(cid)], {
        gasLimit: 1_000_000
      });
      await tx.wait();

      alert(`Successfully created car NFT with token ID!`);
    } catch (e) {
      alert("Failed to create NFT");
      console.log(e);
    }
  };

  // borrow a car NFT
  const borrowNFT = async (id) => {
    try {
      console.log(contract, tokenAddress, AccountId.fromString(id).toSolidityAddress())
      if(!contract) getContract();
      const tx = await contract.borrowing(tokenAddress, 1, {
        value: ethers.utils.parseEther("1"),
        gasLimit: 1_000_000
      });
      await tx.wait();

      alert("Successfully Borrowed Car!");
    } catch (e) {
      alert("Fail to Borrow Car");
      console.log(e);
    }
  };

  // return a car NFT
  const returnNFT = async (id) => {
    try {
      if(!contract) getContract();
      const tx = await contract.returning(tokenAddress, 1, {
        gasLimit: 1_000_000
      });
      await tx.wait();

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

      // Credit Scoring
      const creditScoring = await new TransferTransaction()
        .addTokenTransfer(ftId.toString(), treasuryId, -1)
        .addTokenTransfer(ftId.toString(), customerId, 1)
        .freezeWith(client)
        .sign(treasuryKey);

      // submit the transaction
      const creditScoringTx = await creditScoring.execute(client);
      const creditScoringReceipt = await creditScoringTx.getReceipt(client);

      console.log(`Credit Scoring Status: ${creditScoringReceipt.status} \n`);

      // Balance FT Check
      const customerBalance = await new AccountBalanceQuery()
        .setAccountId(customer)
        .execute(client);

      console.log(
        `- Customer's FT: ${customerBalance.tokens._map.get(
          ftId.toString()
        )} FTs of ID ${ftId} \n`
      );

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
        <Route path="/return" element={<Return returnNFT={returnNFT} address={defaultAccount} />} />
      </Routes>
    </>
  );
}

export default App;
