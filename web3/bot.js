// Intianiate Web3 connection
const Web3 = require('web3')
const web3 = new Web3('wss://goerli.infura.io/ws/v3/8df75ffc9bba40ae9933bec919baf187') // Replace this with a websocket connection to your alchemy 
const contract = require("./abi.json")

const main = async () => {

  const privateKey = "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353";
  const beneficiary = "0x80E4929c869102140E69550BBECC20bEd61B080c";
  const message = "Test Sign";
  const contractAddress = "0x308968B88Be37a1F12B69874b96AAd9c60cBF09D";

  const inETH = true;
  let nonce = 0;

  const earnings = new web3.utils.BN(web3.utils.toWei("1", 'ether'))
  const affiliateEarnings = new web3.utils.BN(web3.utils.toWei("1", 'ether'))
  const totalEarnings = new web3.utils.BN(web3.utils.toWei("2", 'ether'))

  console.log(earnings.toString(10));
  console.log(affiliateEarnings.toString(10));
  console.log(totalEarnings.toString(10));

  // const earningsHex = `0x${earnings.toString('hex')}`;
  // const affiliateEarninsHex = `0x${affiliateEarnings.toString('hex')}`

  // const hashInput = web3.utils.keccak256(web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'bool', 'uint256'], [contractAddress, address, earnings + affiliateEarnings, inETH, nocne]));
  // const hash = web3.utils.keccak256(hashInput);
  // console.log("hash");
  // console.log(hash);

  // const prefix = "\x19Ethereum Signed Message:\n32";
  // const prefixedHash = web3.utils.sha3(prefix + hash);

  // const sighash = web3.utils.keccak256(prefixedHash);
  // const { v, r, s } = web3.eth.accounts.sign(sighash, privateKey);

  // const vHex = `${v.toString(16)}`;
  // const rHex = `${r.toString('hex')}`;
  // const sHex = `${s.toString('hex')}`;

  // console.log(vHex);
  // console.log(rHex);
  // console.log(sHex);

  // Create Account Instance
  const accountInstance = web3.eth.accounts.privateKeyToAccount(privateKey);
  // web3.eth.accounts.wallet.add(accountInstance);

  // web3.eth.defaultAccount = accountInstance.address;

  console.log("Address:", accountInstance.address);

  const testContract = new web3.eth.Contract(contract, contractAddress);

    try {
        // await web3.eth.accounts.wallet.saveFile('personated_account');
        // const testhash = await testContract.methods.withdraw(earnings, affiliateEarnings, true, v, r, s)

        // console.log("transction hash", testhash);
        web3.eth.accounts.wallet.add(accountInstance);
        // await web3.eth.accounts.wallet.saveFile('personated_account');
        web3.eth.defaultAccount = accountInstance.address;

        // const vSanitized = v === 27 ? '0x1b' : '0x1c'; // Transactions with chainId
        // const cleanedR = web3.utils.toHex(r).padStart(64, '0');
        // const cleanedS = web3.utils.toHex(s).padStart(64, '0');

        // const vHex = `${v.toString(16)}`;
        // const rHex = `${r.toString('hex')}`;
        // const sHex = `${s.toString('hex')}`;

        // const vHex = vSanitized;
        // const rHex = cleanedR;
        // const sHex = cleanedS
        // const vHex = vSanitized;
        // const rHex = cleanedR;
        // const sHex = cleanedS

        // const combinedValues = web3.eth.abi.encodeParameters(['uint256', 'uint256', 'bool', 'uint8', 'bytes32', 'bytes32'], [earnings, affiliateEarnings, inETH, v, r, s]);
        
        // const functionData = testContract.methods['withdraw']().getData(combinedValues);

        // const amount = 100;
        // const lockPeriod = 100;

        // // const functionData = testContract.methods['withdraw'](earningsHex, affiliateEarninsHex, true, vHex, rHex, sHex).encodeABI();
        // const eaingsHex = `0x${amount.toString('hex')}`;
        // const functionData = testContract.methods['unstake'](eaingsHex).encodeABI();

        // Estimate the gas limit
        // const gasEstimation = await testContract.methods['withdraw'](earnings, affiliateEarnings, true, v, r, s).estimateGas({ from: accountInstance.address });
        // console.log("Gas Estimation:", gasEstimation);

        // testContract.methods['withdraw'](earnings, affiliateEarnings, true, v, r, s).send({ from: accountInstance.address, gas: Math.ceil(gasEstimation * 1.5) }).then((receipt) => {
        //     console.log("Transaction Hash:", receipt.transactionHash);
        //     console.log("Function Called!");
        // }).catch((error) => {
        //     console.error("Error executing the function:", error);
        // });

        // web3.eth.sendSignedTransaction({
        //     from: accountInstance.address,
        //     to: contractAddress,
        //     data: functionData
        // }).then(receipt => {
        //     console.log('Transaction successful:', receipt);
        // }).catch(error => {
        //     console.error('Transaction failed:', error);
        // });

        try {

          nonce = await testContract.methods.nonce(beneficiary).call()
          const hash = await testContract.methods.getMessageHash(beneficiary, totalEarnings, inETH, message, nonce).call()
          const hashInput = web3.utils.keccak256(web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'bool', 'string', 'uint256'], [contractAddress, beneficiary, totalEarnings, inETH, message, nonce]));

          console.log(hash);
          console.log(hashInput);
          // console.log(nonce);

          const { v, r, s } = web3.eth.accounts.sign(hash, privateKey);

          console.log(v);
          console.log(r);
          console.log(s);

          const tx = await testContract.methods['withdraw'](earnings, affiliateEarnings, true, message, v, r, s)
            .send({ from: accountInstance.address, gas: 25000 });
          
        
          console.log(tx, "withdraw");
        
          //API LOGIC TO CREATE STAKING HERE I.E SAVE IN DATABASE
          // const res = await updateJokStakingHistory(tx);
          // if (res.success) {
          //   dispatch(setIsLoading(0));
          //   dispatch(
          //     show({
          //       title: "",
          //       body: "Deposit is done successfully!",
          //       type: "success",
          //     })
          //   );
          // }
          } catch (err) {
            console.log(err, "error");
            // dispatch(setIsLoading(0));
          }

        console.log(`Successfully\n`)
    } catch (error) {
        console.log(`Error Occured while swapping...`)
        console.log(`You may need to adjust slippage, or amountIn.\n`)
        console.log(error)
    }
}

main()