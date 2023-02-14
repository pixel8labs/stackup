// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./HederaTokenService.sol";
import "./IHederaTokenService.sol";
import "./HederaResponseCodes.sol";
import "./ExpiryHelper.sol";

contract EScrow is ExpiryHelper {
    function createNFT(
        string memory name,
        string memory symbol
    ) external payable returns (address) {
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);

        // Set this contract as supply
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = "";
        token.treasury = address(this);
        token.tokenSupplyType = true; // set supply to FINITE
        token.maxSupply = 10;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), 7000000);

        (int responseCode, address createdToken) = HederaTokenService
            .createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to create non-fungible token");
        }
        return createdToken;
    }

    function mintNFT(
        address token,
        bytes[] memory metadata
    ) external returns (int64) {
        (int response, , int64[] memory serial) = HederaTokenService.mintToken(
            token,
            0,
            metadata
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to mint non-fungible token");
        }

        return serial[0];
    }

    function borrowing(
        address token,
        int64 serial
    ) external payable returns (int) {
        // Transfer 1 HBAR
        require(msg.value >= 100000000, "Invalid Fund");

        // Transfer NFT to User
        HederaTokenService.associateToken(msg.sender, token);
        int response = HederaTokenService.transferNFT(
            token,
            address(this),
            msg.sender,
            serial
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        return response;
    }

    function returning(
        address token,
        int64 serial
    ) external payable returns (int) {
        // Return NFT from User
        int response = HederaTokenService.transferNFT(
            token,
            msg.sender,
            address(this),
            serial
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        // Return HBAR to user
        payable(address(msg.sender)).transfer(100000000);

        return response;
    }
}
