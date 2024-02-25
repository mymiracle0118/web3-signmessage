// Intianiate Web3 connection
const Web3 = require('web3')
const web3 = new Web3('wss://goerli.infura.io/ws/v3/8df75ffc9bba40ae9933bec919baf187') // Replace this with a websocket connection to your alchemy 
const stakingContractABI = require("./stakingContractABI.json")

const main = async () => {

  const privateKey = "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353";
  const beneficiary = "0x80E4929c869102140E69550BBECC20bEd61B080c";
  const message = "JokInTheBoxStaking";
  const stakingContractAddress = "0xFf7108b64A57ECd91B3b36De909ee865166badE3";

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

  const stakingContract = new web3.eth.Contract(stakingContractABI, stakingContractAddress);

    try {
        // await web3.eth.accounts.wallet.saveFile('personated_account');
        // const testhash = await testContract.methods.withdraw(earnings, affiliateEarnings, true, v, r, s)

        // console.log("transction hash", testhash);
        web3.eth.accounts.wallet.add(accountInstance);
        // await web3.eth.accounts.wallet.saveFile('personated_account');
        web3.eth.defaultAccount = accountInstance.address;

        try {

          nonce = await stakingContract.methods.nonce(beneficiary).call()
          const hash = await stakingContract.methods.getMessageHash(beneficiary, totalEarnings, inETH, message, nonce).call()

          console.log(hash);

          const { v, r, s } = web3.eth.accounts.sign(hash, privateKey);

          console.log(v);
          console.log(r);
          console.log(s);

          const tx = await stakingContract.methods['withdraw'](earnings, affiliateEarnings, true, message, v, r, s)
            .send({ from: accountInstance.address, gas: 25000 });
          
        
          console.log(tx, "withdraw");
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