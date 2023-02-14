const { 
  Client, 
  AccountId,
  PrivateKey,
  ContractCreateFlow, 
} = require('@hashgraph/sdk')
require('dotenv').config()

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
  
  //Import the compiled contract from the NFTCreator.json file
  let EScrow = require('./EScrow.json')
  const bytecode = EScrow.data.bytecode.object

  //Create contract
  const createContract = new ContractCreateFlow()
    .setGas(250000) //Increase if revert
    .setBytecode(bytecode) //Contract bytecode
  const createContractTx = await createContract.execute(client)
  const createContractRx = await createContractTx.getReceipt(client)
  const contractId = createContractRx.contractId

  console.log(`Contract created with ID: ${contractId} \n`)
}
main()