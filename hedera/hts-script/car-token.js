require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	TokenMintTransaction,
} = require("@hashgraph/sdk");

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);

const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();

async function nonFungibleToken() {
  // Create NFT token
	let nftCreate = await new TokenCreateTransaction()
    .setTokenName("Car")
    .setTokenSymbol("CAR")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(10)
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
  console.log(`- Created NFT token with ID: ${tokenId} \n`);
  console.log(`- Supply key: ${supplyKey} \n`)
}

async function mintNonFungibleToken(tokenId, supplykey, CID) {  
  // Mint NFT
  let mintTx = await new TokenMintTransaction()
  .setTokenId(tokenId)
  .setMetadata([Buffer.from(CID)])
  .freezeWith(client);

  // sign the transaction with the supply key
  let mintTxSign = await mintTx.sign(PrivateKey.fromString(supplykey));

  // submit the transaction to a Hedera network
  let mintTxSubmit = await mintTxSign.execute(client);

  // get the transaction receipt
  let mintRx = await mintTxSubmit.getReceipt(client);

  // log the serial number
  console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`);
}

async function fungibleToken() {
  // create fungible token (stablecoin)
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("Car Score")
    .setTokenSymbol("CSCORE")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(1000)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(client);

  // sign with treasury key
  let tokenCreateSign = await tokenCreateTx.sign(operatorKey);

  // submit the transaction
  let tokenCreateSubmit = await tokenCreateSign.execute(client);  
  
  // get the transaction receipt
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);  
  
  // get the token ID
  let tokenId = tokenCreateRx.tokenId; 
      
  // log the token ID to the console  
  console.log(`- Created token with ID: ${tokenId} \n`);
}

// nonFungibleToken()
// mintNonFungibleToken(
//   "0.0.3466291",
//   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
//   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// )
// mintNonFungibleToken(
//   "0.0.3466291",
//   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
//   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// )
// mintNonFungibleToken(
//   "0.0.3466291",
//   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
//   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// )
// fungibleToken()


