// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "test/mock/MockJoklnTheBoxStaking.sol";


import "forge-std/console.sol";
import "forge-std/console2.sol";

contract JokInTheBoxStakingTest is Test {
    MockJoklnTheBoxStaking public boxStaking;

    address beneficiary = address(0x80E4929c869102140E69550BBECC20bEd61B080c);
    uint256 testnetFork;
    string message = "JokInTheBoxStaking";
    bool inETH = true;
    uint256 earnings = 1 ether;
    uint256 affiliateEarnings = 1 ether;
    uint256 totalEarnings = earnings + totalEarnings;

    function setUp() public {

        testnetFork = vm.createFork("https://goerli.infura.io/v3/8df75ffc9bba40ae9933bec919baf187");
        vm.selectFork(testnetFork);
        vm.rollFork(10592166);
        vm.prank(beneficiary);
        boxStaking = new MockJoklnTheBoxStaking();

    }

    function testGetMessageHash() public {

        assertEq(vm.activeFork(), testnetFork);

        // console.log(address(boxStaking));

        // console.log(address(boxStaking.bot()));

        vm.prank(beneficiary);
        uint256 _nonce = boxStaking.nonce(beneficiary);

        bytes32 hashData = boxStaking.getMessageHash(beneficiary, totalEarnings, inETH, message, _nonce);
        // console.logBytes32(test);

        assertEq(hashData, 0xad0d868c3f3f372a319344e03c934e3f7fcc42fbc8b8b191864812710860b209);

        // vm.prank(beneficiary);
        // boxStaking.withdraw(1 ether, 1 ether, true, "Test Sign", 0x1b, 0x0ad47c7033f20e9db977b0776266bfdcad94df94f1495e800479c5df6de8653d, 0x7bff0cdae93afb329048a95a01c5bb3bcfdae86c1de9066be60a15ed47ea5668);
    }
}
