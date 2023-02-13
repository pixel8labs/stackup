// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.8.9;

import 'https://github.com/hashgraph/hedera-smart-contracts/blob/v0.2.0/contracts/hts-precompile/HederaResponseCodes.sol';
import 'https://github.com/hashgraph/hedera-smart-contracts/blob/v0.2.0/contracts/hts-precompile/IHederaTokenService.sol';
import 'https://github.com/hashgraph/hedera-smart-contracts/blob/v0.2.0/contracts/hts-precompile/HederaTokenService.sol';

contract EScrow is HederaTokenService {
  function borrowing(
		address token, 
		address receiver,
    address treasury, 
		int64 serial
	) external payable returns(int) {
    // Transfer 1 HBAR
    require(msg.value >= 100000000, "Invalid Fund");
		
    // Transfer NFT to User
    HederaTokenService.associateToken(receiver, token);
	int response = HederaTokenService.transferNFT(token, treasury, receiver, serial);
    
    if(response != HederaResponseCodes.SUCCESS){
      revert("Failed to transfer non-fungible token");
    }

    return response;
  }

  function returning(
    address token,
    address payable receiver,
    address treasury,
    int64 serial
  ) payable external returns(int) {
    // Return NFT from User
    int response = HederaTokenService.transferNFT(token, receiver, treasury, serial);
    
    if(response != HederaResponseCodes.SUCCESS){
      revert("Failed to transfer non-fungible token");
    }

    // Return HBAR to user
    receiver.transfer(100000000);

    return response;
  }
}

