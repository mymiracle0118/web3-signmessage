// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "../src/JokInTheBoxStaking.sol";


import "forge-std/console.sol";
import "forge-std/console2.sol";

contract JokInTheBoxStakingTest is Test {
    JokInTheBoxStaking public tester;

    address testerAccount = address(0x80E4929c869102140E69550BBECC20bEd61B080c);

    function setUp() public {
        vm.prank(testerAccount);
        tester = new JokInTheBoxStaking();
        console.log(address(tester));
    }

    function testVerifySignature() public {

        vm.prank(testerAccount);
        // tester.isValidSignatureTest(testerAccount, 2 ether, true, 0x1b, 0x3640c64a1ba9369253bd27568f071a464ca5561f62dd0666b66e304de401c05b, 0x6d0cd43f76771d6a9ba4ef62755954a51ac74d9fd9edf872deac1f69acc0fe13);
        tester.withdraw(1 ether, 1 ether, true, "Test Sign", 0x1b, 0x0ad47c7033f20e9db977b0776266bfdcad94df94f1495e800479c5df6de8653d, 0x7bff0cdae93afb329048a95a01c5bb3bcfdae86c1de9066be60a15ed47ea5668);
        console.log("test");
    }
}
