const { 
  Client, 
  AccountId,
  PrivateKey,
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,  
  AccountBalanceQuery,
  TokenAssociateTransaction,
  TransferTransaction
} = require("@hashgraph/sdk");
require("dotenv").config();

// The FT and NFT IDs
const ftId = AccountId.fromString('0.0.3466301')
const nftId = AccountId.fromString('0.0.3466291')

// The Topic ID to use for our messages
const topicId = '0.0.3046126'

// The Escrow contract ID
const EScrowId = '0.0.3466583'

// The operator account ID and key
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// The Customer account ID and key
const customerAccountId = AccountId.fromString(process.env.CUSTOMER_ID);
const customerKey = PrivateKey.fromString(process.env.CUSTOMER_PRIVATE_KEY);

const clientCustomer = Client.forTestnet().setOperator(customerAccountId, customerKey);

// The Treasury account ID and key
const treasuryAccountId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PRIVATE_KEY);

async function borrow(){
  // Borrowing the Car 
  const borrowCar = await new ContractExecuteTransaction()
  .setContractId(EScrowId)
  .setGas(1000000)
  .setFunction(
    "borrowing",
    new ContractFunctionParameters()
      .addAddress(nftId.toSolidityAddress())
      .addAddress(customerAccountId.toSolidityAddress())
      .addAddress(treasuryAccountId.toSolidityAddress())
      .addInt64(1)
  )
  .setPayableAmount(Hbar.fromTinybars(100000000))
  .freezeWith(clientCustomer)
  .sign(treasuryKey);
    
  const borrowCarTx = await borrowCar.execute(clientCustomer);
  const borrowCarReceipt = await borrowCarTx.getReceipt(clientCustomer);

  console.log(`- Borrowing the Car: ${borrowCarReceipt.status} \n`);
}

async function returning(){
  const returnCar = await new ContractExecuteTransaction()
  .setContractId(EScrowId)
  .setGas(1000000)
  .setFunction(
    "returning",
    new ContractFunctionParameters()
      .addAddress(nftId.toSolidityAddress())
      .addAddress(customerAccountId.toSolidityAddress())
      .addAddress(treasuryAccountId.toSolidityAddress())
      .addInt64(1)
  )
  .freezeWith(clientCustomer)
  .sign(treasuryKey);

  const returnCarTx = await returnCar.execute(clientCustomer);
  const returnCarReceipt = await returnCarTx.getReceipt(clientCustomer);

  console.log(`Returning Car Status: ${returnCarReceipt.status} \n`);
}

