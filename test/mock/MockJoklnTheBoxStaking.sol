// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "src/JokInTheBoxStaking.sol";

contract MockJoklnTheBoxStaking is JokInTheBoxStaking {
  constructor() {}

  function isValidSignatureTest(address beneficiary, uint256 amount, bool inETH, string memory message, uint8 _v, bytes32 _r, bytes32 _s) public view returns (bool) {
    return super.isValidSignature(beneficiary, amount, inETH, message, _v, _r, _s);
  }

  function recoverSigner(bytes32 _ethSignedMessageHash, uint8 _v, bytes32 _r, bytes32 _s)
        public
        view
        returns (address)
    {
        return ecrecover(_ethSignedMessageHash, _v, _r, _s);
    }
    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }
}
