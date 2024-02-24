// Intianiate Web3 connection
const Web3 = require('web3')
const web3 = new Web3('wss://eth-mainnet.g.alchemy.com/v2/hDwYSBQWDMBJGJs_-FvAAS0oLznF_ngi') // Replace this with a websocket connection to your alchemy 
const contract = require("./abi.json")

const privateKey = "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353";
const address = "0x80E4929c869102140E69550BBECC20bEd61B080c";

const inETH = true;
const nocne = 0;

const earningsStr = "1";
const affiliateEarningsStr = "1";

const earnings = new web3.utils.BN(web3.utils.toWei(earningsStr, 'ether'))
const affiliateEarnings = new web3.utils.BN(web3.utils.toWei(affiliateEarningsStr, 'ether'))

const earningsHex = `0x${earnings.toString('hex')}`;
const affiliateEarninsHex = `0x${affiliateEarnings.toString('hex')}`

const contractAddress = "0x5f5bd39B103CB29c1709635112D2b7be5A61F28A";
const hashInput = web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'bool', 'uint256'], [contractAddress, address, earnings + affiliateEarnings, inETH, nocne]);

const prefix = "\x19Ethereum Signed Message:\n32";
const prefixedHash = web3.utils.keccak256(prefix + hashInput);

const sighash = web3.utils.sha3(prefixedHash);
const { v, r, s } = web3.eth.accounts.sign(sighash, privateKey);

const vHex = `${v.toString(16)}`;
const rHex = `${r.toString('hex')}`;
const sHex = `${s.toString('hex')}`;

console.log(vHex);
console.log(rHex);
console.log(sHex);

// Create Account Instance
const accountInstance = web3.eth.accounts.privateKeyToAccount(privateKey);
// web3.eth.accounts.wallet.add(accountInstance);

// web3.eth.defaultAccount = accountInstance.address;

console.log("Address:", accountInstance.address);

const testContract = new web3.eth.Contract(contract, contractAddress);

const main = async () => {
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
            const tx = await testContract.methods['withdraw'](earnings, affiliateEarnings, true, v, r, s)
              .send({ from: accountInstance.address, gas: 25000 });
          
            console.log(tx, "unstaking");
          
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