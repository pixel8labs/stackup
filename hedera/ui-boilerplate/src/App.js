import "./App.css";
import { useState, useEffect } from "react";
import {
  AccountId,
  PrivateKey,
  Client,
  AccountBalanceQuery,
  TransferTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { Routes, Route, NavLink } from "react-router-dom";
import CreateCar from "./pages/CreateCar";
import GiveScore from "./pages/GiveScore";
import Borrow from "./pages/BorrowCar";
import Return from "./pages/ReturnCar";
import escrow from "./contract.json";
import { ethers } from "ethers";

function App() {
  const [defaultAccount, setDefaultAccount] = useState("");
  const [score, setScore] = useState(0);
  const [contract, setContract] = useState();

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );

      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      signer.getAddress().then(setDefaultAccount);
      const c = new ethers.Contract(contractAddress, escrow.abi, signer);
      setContract(c);
      window.ethereum.on("accountsChanged", changeConnectedAccount);
    }
  };

  // get the user credit score from the mirror node
  const getScore = async () => {
    try {
      await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${defaultAccount}/tokens?token.id=${ftId}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.tokens) {
            setScore(0);
            return;
          }
          setScore(data?.tokens[0]?.balance);
        });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    connect();
    getScore();
  }, [defaultAccount]);

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

  const merchantId = AccountId.fromString(process.env.REACT_APP_MERCHANT_ID);
  const merchantKey = PrivateKey.fromString(
    process.env.REACT_APP_MERCHANT_PRIVATE_KEY
  );
  const merchantAddress = process.env.REACT_APP_MERCHANT_ADDRESS;

  const contractAddress = process.env.REACT_APP_ESCROW_ADDRESS;
  const nftAddress = process.env.REACT_APP_NFT_ADDRESS;
  const nftId = AccountId.fromSolidityAddress(nftAddress).toString();
  const ftAddress = process.env.REACT_APP_FT_ADDRESS;
  const ftId = AccountId.fromSolidityAddress(ftAddress).toString();
  const topicId = process.env.REACT_APP_TOPIC_ID;

  // create Hedera testnet client
  const client = Client.forTestnet().setOperator(merchantId, merchantKey);

  // create a new car NFT
  const createNewCar = async (cid) => {
    try {
      if (!contract) getContract();
      const tx = await contract.mintNFT(nftAddress, [Buffer.from(cid)], {
        gasLimit: 1_000_000,
      });
      const result = await tx.wait();
      console.log(result);

      alert(`Successfully created car NFT!`);
    } catch (e) {
      alert("Failed to create NFT");
      console.log(e);
    }
  };

  // borrow a car NFT
  const borrowCar = async (id, serial) => {
    try {
      if (!contract) getContract();
      const tx = await contract.borrowing(
        AccountId.fromString(id).toSolidityAddress(),
        serial,
        {
          value: ethers.utils.parseEther("1"),
          gasLimit: 1_000_000,
        }
      );
      await tx.wait();

      // Submit A Logs To The Topic
      new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(
          `{
            type: Borrowing,
            accountAddr: ${defaultAccount},
            tokenId: ${id},
            serial: ${serial}
          }`
        )
        .execute(client);

      alert("Successfully Borrowed Car!");
    } catch (e) {
      alert("Fail to Borrow Car");
      console.log(e);
    }
  };

  // return a car NFT
  const returnCar = async (id, serial) => {
    try {
      if (!contract) getContract();
      const tx = await contract.returning(
        AccountId.fromString(id).toSolidityAddress(),
        serial,
        {
          gasLimit: 1_000_000,
        }
      );
      await tx.wait();

      // Submit A Logs To The Topic
      new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(
          `{
            type: Returning,
            accountAddr: ${defaultAccount},
            tokenId: ${id},
            serial: ${serial}
          }`
        )
        .execute(client);

      alert("Successfully Returned Car!");
    } catch (e) {
      alert("Fail to Return Car");
      console.log(e);
    }
  };

  // give a credit/reputation score to a customer
  const giveScore = async (customer, score) => {
    try {
      const ftId = AccountId.fromString(process.env.REACT_APP_FT_ID);

      // Credit Scoring
      const creditScoring = await new TransferTransaction()
        .addTokenTransfer(ftId.toString(), merchantId, -1)
        .addTokenTransfer(ftId.toString(), customer, 1)
        .freezeWith(client)
        .sign(merchantKey);

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

      // Submit A Logs To The Topic
      new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(
          `{
          type: Scoring,
          accountAddr: ${customer},
          tokenId: ${ftId.toString()},
          amount: ${1}
        }`
        )
        .execute(client);

      alert("Successfully Give Score!");
    } catch (e) {
      alert("Fail to Give Score");
      console.log(e);
    }
  };

  return (
    <>
      <nav>
        <ul className="nav">
          {defaultAccount === merchantAddress ? (
            <>
              <NavLink to="/" className="nav-item">
                Add Car
              </NavLink>
              <NavLink to="/score" className="nav-item">
                Give Score
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/borrow" className="nav-item">
                Borrow Car
              </NavLink>
              <NavLink to="/return" className="nav-item">
                Return Car
              </NavLink>
            </>
          )}
          <div className="acc-container">
            <p className="acc-score">
              My Credit Score: {defaultAccount ? score : "0"}
            </p>
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
        {defaultAccount === merchantAddress ? (
          <>
            <Route
              path="/"
              element={<CreateCar createNewCar={createNewCar} />}
            />
            <Route
              path="/score"
              element={<GiveScore giveScore={giveScore} />}
            />
          </>
        ) : (
          <>
            <Route path="/borrow" element={<Borrow borrowCar={borrowCar} />} />
            <Route
              path="/return"
              element={
                <Return returnCar={returnCar} address={defaultAccount} />
              }
            />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
