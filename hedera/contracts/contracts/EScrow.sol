// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./HederaTokenService.sol";
import "./IHederaTokenService.sol";
import "./HederaResponseCodes.sol";
import "./ExpiryHelper.sol";

contract EScrow is ExpiryHelper {
    event CreatedToken(address tokenAddress);

    function createNFT(
        string memory name,
        string memory symbol
    ) public payable {
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](5);
        keys[0] = getSingleKey(
            KeyType.ADMIN,
            KeyType.PAUSE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[1] = getSingleKey(
            KeyType.KYC,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[2] = getSingleKey(
            KeyType.FREEZE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[3] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[4] = getSingleKey(
            KeyType.WIPE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );

        IHederaTokenService.Expiry memory expiry = IHederaTokenService.Expiry(
            0,
            address(this),
            8000000
        );

        IHederaTokenService.HederaToken memory token = IHederaTokenService
            .HederaToken(
                name,
                symbol,
                address(this),
                "",
                true,
                1000,
                false,
                keys,
                expiry
            );

        (int responseCode, address tokenAddress) = HederaTokenService
            .createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert();
        }

        emit CreatedToken(tokenAddress);
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
        address payable receiver,
        address treasury,
        int64 serial
    ) external payable returns (int) {
        // Return NFT from User
        int response = HederaTokenService.transferNFT(
            token,
            receiver,
            treasury,
            serial
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        // Return HBAR to user
        receiver.transfer(100000000);

        return response;
    }
}
