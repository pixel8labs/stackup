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
import escrow from "./contract.json";
import { ethers } from "ethers";

function App() {
  const [defaultAccount, setDefaultAccount] = useState("");
  const [score, setScore] = useState(0);
  const [contract, setContract] = useState();

  const escrowAddress = process.env.REACT_APP_ESCROW_ADDRESS;
  const nftAddress = process.env.REACT_APP_NFT_ADDRESS;
  const nftId = AccountId.fromSolidityAddress(nftAddress).toString();
  const ftAddress = process.env.REACT_APP_FT_ADDRESS;
  const ftId = AccountId.fromSolidityAddress(ftAddress).toString();
  const topicId = process.env.REACT_APP_TOPIC_ID;

  const merchantId = AccountId.fromString(process.env.REACT_APP_MERCHANT_ID);
  const merchantKey = PrivateKey.fromString(
    process.env.REACT_APP_MERCHANT_PRIVATE_KEY
  );
  const merchantAddress = process.env.REACT_APP_MERCHANT_ADDRESS;

  const client = Client.forTestnet().setOperator(merchantId, merchantKey);

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );

      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      signer.getAddress().then(setDefaultAccount);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    signer.getAddress().then(setDefaultAccount);
    const c = new ethers.Contract(escrowAddress, escrow.abi, signer);
    setContract(c);
  };

  // get the user credit score from the mirror node
  const getScore = async () => {
    try {
      if (defaultAccount) {
        await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${defaultAccount}/tokens?token.id=${ftId}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (!data.tokens[0]) {
              setScore(0);
              return;
            }
            setScore(data.tokens[0].balance);
          });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    connect();
    getScore();
  }, [defaultAccount]);

  // create a new car NFT
  const createCar = async (cid) => {
    try {
      if (!contract) getContract();
      const tx = await contract.mintNFT(nftAddress, [Buffer.from(cid)], {
        gasLimit: 1_000_000,
      });
      await tx.wait();

      // Submit A Logs To The Topic
      new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(
          `{
            type: Minting,
            accountAddr: ${defaultAccount},
            tokenId: ${nftId}
          }`
        )
        .execute(client);

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
          gasLimit: 2_000_000,
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
      if (!contract) getContract();
      await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${customer}`
      )
        .then((response) => response.json())
        .then(async (data) => {
          const tx = await contract.scoring(data.evm_address, score, {
            gasLimit: 1_000_000,
          });
          await tx.wait();
        });

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
            {!isMerchant && defaultAccount && (
              <p className="acc-score">
                My Reputation Score: {defaultAccount ? score : "0"}
              </p>
            )}
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
