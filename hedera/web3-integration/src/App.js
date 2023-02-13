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
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { Routes, Route, NavLink } from "react-router-dom";
import CreateNFT from "./pages/CreateNFT";
import GiveScore from "./pages/GiveScore";
import Borrow from "./pages/BorrowNFT";
import Return from "./pages/ReturnNFT";
import Web3 from "web3";
import ESCrow from "./ESCrow.json";

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [score, setScore] = useState(0);

  const web3 = new Web3(
    new Web3.providers.HttpProvider("https://testnet.hashio.io/api"),
    {
      keepalive: true,
      headers: [{ name: "Access-Control-Allow-Origin", value: "*" }],
      withCredentials: false,
      timeout: 30 * 1000,
    }
  );

  const connect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
      const account = web3.eth.accounts;
      // get the current MetaMask selected/active wallet
      const walletAddress = account.givenProvider.selectedAddress;
      setDefaultAccount(walletAddress);
    } else {
      console.log("No wallet");
    }
  };

  // get variables value from the .env file
  const EScrowId = process.env.REACT_APP_CONTRACT_ID;

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
  const customerKey = PrivateKey.fromString(
    process.env.REACT_APP_CUSTOMER_PRIVATE_KEY
  );

  // create Hedera testnet client
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const clientCustomer = Client.forTestnet().setOperator(
    customerId,
    customerKey
  );

  const supplyKey = PrivateKey.generate();

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
      let nftCreate = await new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(maxSupply)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

      // sign with treasury key
      let nftCreateSign = await nftCreate.sign(treasuryKey);
      // submit the transaction
      let nftCreateSubmit = await nftCreateSign.execute(client);

      // get the transaction receipt
      let nftCreateRx = await nftCreateSubmit.getReceipt(client);

      // get the token ID
      let tokenId = nftCreateRx.tokenId;

      // log the token ID to the console
      console.log(`- Created token with ID: ${tokenId} \n`);

      // IPFS content identifiers for which we will create a NFT
      const CID = "ipfs://QmTzWcVfk88JRqjTpVwHzBeULRTNzHY7mnBSG42CpwHmPa";

      // mint NFT
      let mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(CID)])
        .freezeWith(client);

      // sign the transaction with the supply key
      let mintTxSign = await mintTx.sign(supplyKey);

      // submit the transaction to a Hedera network
      let mintTxSubmit = await mintTxSign.execute(client);

      // get the transaction receipt
      let mintRx = await mintTxSubmit.getReceipt(client);

      // log the serial number
      console.log(
        `- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`
      );

      alert(`Successfully created car NFT with token ID ${tokenId}!`);
    } catch (e) {
      alert("Failed to create NFT");
    }
  };

  // borrow a car NFT
  const borrowNFT = async (id) => {
    // try {
    const nftId = AccountId.fromString(id);

    // // Borrowing the Car
    // const borrowCar = await new ContractExecuteTransaction()
    //   .setContractId(EScrowId)
    //   .setGas(1000000)
    //   .setFunction(
    //     "borrowing",
    //     new ContractFunctionParameters()
    //       .addAddress(nftId.toSolidityAddress())
    //       .addAddress(customerId.toSolidityAddress())
    //       .addAddress(treasuryId.toSolidityAddress())
    //       .addInt64(1)
    //   )
    //   .setPayableAmount(Hbar.fromTinybars(100000000))
    //   .freezeWith(clientCustomer)
    //   .sign(treasuryKey);

    // const borrowCarTx = await borrowCar.execute(clientCustomer);
    // const borrowCarReceipt = await borrowCarTx.getReceipt(clientCustomer);

    // console.log(`Transfer Status: ${borrowCarReceipt.status}`);

    // // Balance NFT Check
    // let customerBalance = await new AccountBalanceQuery()
    //   .setAccountId(customerId)
    //   .execute(client);

    // console.log(
    //   `- Customer's NFT: ${customerBalance.tokens._map.get(
    //     nftId.toString()
    //   )} NFTs of ID ${nftId}`
    // );

    // deploy contract with Web3.js
    const wallet = await web3.eth.accounts.wallet.add(
      process.env.REACT_APP_OPERATOR_PRIVATE_KEY
    );
    const Greeter = new web3.eth.Contract(ESCrow.abi);
    const greeter = await Greeter.deploy({
      data: ESCrow.data.bytecode.object,
      arguments: [],
    });
    const contract = await greeter.send({
      from: wallet.address,
      gas: 300000,
    });

    console.log(`Greeter deployed to: ${contract._address}`);

    const call = await contract.methods
      .borrowing(
        nftId.toSolidityAddress(),
        customerId.toSolidityAddress(),
        treasuryId.toSolidityAddress(),
        1
      )
      .send({
        from: wallet.address,
        gas: 300000,
        value: Hbar.fromTinybars(100000000),
      });

    //   alert("Successfully Borrowed Car!");
    // } catch (e) {
    //   alert("Fail to Borrow Car");
    // }
  };

  // return a car NFT
  const returnNFT = async (id) => {
    try {
      const nftId = AccountId.fromString(id);

      //Returning the Car
      const returnCar = await new ContractExecuteTransaction()
        .setContractId(EScrowId)
        .setGas(1000000)
        .setFunction(
          "returning",
          new ContractFunctionParameters()
            .addAddress(nftId.toSolidityAddress())
            .addAddress(customerId.toSolidityAddress())
            .addAddress(treasuryId.toSolidityAddress())
            .addInt64(1)
        )
        .freezeWith(clientCustomer)
        .sign(treasuryKey);

      const returnCarTx = await returnCar.execute(clientCustomer);
      const returnCarReceipt = await returnCarTx.getReceipt(clientCustomer);

      console.log(`Transfer Status: ${returnCarReceipt.status}`);

      // Balance NFT Check
      const customerBalance = await new AccountBalanceQuery()
        .setAccountId(customerId)
        .execute(client);

      console.log(
        `- Customer's NFT: ${customerBalance.tokens._map.get(
          nftId.toString()
        )} NFTs of ID ${nftId}`
      );

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

  async function createTopic() {
    const createTopicTransactionId = await new TopicCreateTransaction().execute(
      client
    );

    // Get the receipt of our transaction, to see if it was successful!
    const createTopicReceipt = await createTopicTransactionId.getReceipt(
      client
    );

    // If it was successful, it will contain a new topic ID!
    const newTopicId = createTopicReceipt.topicId;

    console.log("Our topic:" + newTopicId);
  }
  // createTopic();

  async function createLogs(accountId, type, tokenId) {
    const topicId = "0.0.3046126";

    const newHCSMessage = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId.toString())
      .setMessage(`Type: ${type}, AccountId: ${accountId}, TokenId: ${tokenId}`)
      .execute(client);

    // Get the receipt of our message to confirm it was successful
    const messageReceipt = await newHCSMessage.getReceipt(client);
    console.log(messageReceipt);
  }

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
        <Route path="/return" element={<Return returnNFT={returnNFT} />} />
      </Routes>
    </>
  );
}

export default App;
