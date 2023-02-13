require("dotenv").config();
const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
  ContractExecuteTransaction,
  ContractFunctionParameters
} = require("@hashgraph/sdk")

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);

const merchantId = AccountId.fromString(process.env.MERCHANT_ID);
const merchantKey = PrivateKey.fromString(process.env.MERCHANT_PRIVATE_KEY);

const clientOperator = Client.forTestnet().setOperator(operatorId, operatorKey);
const clientMerchant = Client.forTestnet().setOperator(merchantId, merchantKey);

const supplyKey = PrivateKey.generate();

async function nonFungibleToken(contractId) {
  // Create NFT token
  const createToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(300000) // Increase if revert
    .setPayableAmount(20) // Increase if revert
    .setFunction("createNFT",
      new ContractFunctionParameters()
      .addString("Car") // NFT name
      .addString("CAR") // NFT symbol
    );
  
  const createTokenTx = await createToken.execute(clientMerchant);
  const createTokenRx = await createTokenTx.getRecord(clientMerchant);
  const tokenIdSolidityAddr = createTokenRx.contractFunctionResult.getAddress(0);
  const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);

  console.log(`- Created Token NFT with ID: ${tokenId} \n`);
}

async function mintNonFungibleToken(contractId, tokenId, CID){
  // Mint NFT Token
  const mintToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000) // Increase if revert
    .setFunction("mintNFT",
      new ContractFunctionParameters()
      .addAddress(AccountId.fromString(tokenId).toSolidityAddress()) // Token ID
      .addString([Buffer.from(CID)]) // CID
    )
  
  const mintTokenTx = await mintToken.execute(client);
  const mintTokenRx = await mintTokenTx.getRecord(client);
  const serial = mintTokenRx.contractFunctionResult.getInt64(0);

  console.log(`- Token NFT minted with serial: ${serial} \n`);
} 

async function fungibleToken() {
  // create fungible token 
  let tokenCreateTx = await new TokenCreateTransaction()
    .setTokenName("Car Score")
    .setTokenSymbol("CSCORE")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(0)
    .setInitialSupply(1000)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(supplyKey)
    .freezeWith(clientOperator);

  let tokenCreateSign = await tokenCreateTx.sign(operatorKey);
  let tokenCreateSubmit = await tokenCreateSign.execute(clientOperator);  
  let tokenCreateRx = await tokenCreateSubmit.getReceipt(clientOperator);  
  let tokenId = tokenCreateRx.tokenId; 
      
  console.log(`- Created token FT with ID: ${tokenId} \n`);
}

// nonFungibleToken("0.0.3472528")

// // nonFungibleToken()
// // mintNonFungibleToken(
// //   "0.0.3466291",
// //   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
// //   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// // )
// // mintNonFungibleToken(
// //   "0.0.3466291",
// //   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
// //   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// // )
// // mintNonFungibleToken(
// //   "0.0.3466291",
// //   "302e020100300506032b6570042204204763abb4e5b40519d9798f4fb4c23a5c5aa079d26706498c0e1df923464a06df",
// //   "https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/1"
// // )

// // nonFungibleToken()
fungibleToken()