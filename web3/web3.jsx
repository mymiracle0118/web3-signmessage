import Web3 from "web3";
import * as ethers from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { useAccount } from "wagmi";
import {
  json_rpc,
  StakingInfo,
  TokenInfo,
  VaultInfo,
  AffiliateInfo,
  PairInfo,
} from "../utils/web3.config";
import { show } from "../redux/reducer/notification";
import {
  setDepositTiers,
  setETHBalance,
  setIsLoading,
  setMyStakingInfo,
  setMyVaultInfo,
  setStakingInfo,
  setTokenBalance,
  setTokenPrice,
  setUpline,
  setVaultInfo,
} from "../redux/reducer/web3";
import { updateJokStakingHistory } from "./api-results";
import { Buffer } from "buffer";
import { hitMyStakingApi } from "../redux/reducer/authSlice";
import { useEffect, useState } from "react";
import { removeNConvertAndDivide } from "../utils/functions";

let web3,
  tokenContract,
  stakingContract,
  vaultContract,
  affiliateContract,
  pairContract,
  stakingContractAddress,
  contract;

export const useWeb3Kits = () => {
  const { address } = useAccount();
  const dispatch = useDispatch();
  const ethereum = window.ethereum;

  if (ethereum) {
    //wallet connected;
    web3 = new Web3(ethereum);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(json_rpc));
  }

  tokenContract = new web3.eth.Contract(TokenInfo.abi, TokenInfo.address);
  stakingContract = new web3.eth.Contract(StakingInfo.abi, StakingInfo.address);
  stakingContractAddress = StakingInfo.address;
  vaultContract = new web3.eth.Contract(VaultInfo.abi, VaultInfo.address);
  affiliateContract = new web3.eth.Contract(
    AffiliateInfo.abi,
    AffiliateInfo.address
  );
  pairContract = new web3.eth.Contract(PairInfo.abi, PairInfo.address);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  contract = new ethers.Contract(
    stakingContractAddress,
    StakingInfo.abi,
    signer
  );
  const getTokenFunc = async () => {
    await fetchTokenBalance();
    //await fetchTokenPrice(),
    await fetchEthBalance();
  };

  const getStakingFunc = async () => {
    await fetchStakingData();
    await fetchMyStakingData();
  };

  const getVaultFunc = async () => {
    await fetchMevVaultData();
    await fetchMyMevVaultData();
  };

  const getUpline = async () => {
    if (affiliateContract && address) {
      const upline = await affiliateContract.methods.getUpline(address).call();
      dispatch(setUpline(upline));
    }
  };

  const approveToken = (amount, lockPeriod) => {
    if (tokenContract && address) {
      const tx = tokenContract.methods
        .approve(
          StakingInfo.address,
          web3.utils.toWei("10000000000000000", "ether")
        )
        .send({ from: address })
        .then(async () => {
          dispatch(
            show({
              title: "",
              body: "Token approved successfully",
              type: "success",
            })
          );
          await depositJOK(amount, lockPeriod);
        })
        .catch((err) => {
          console.log(err);
          dispatch(
            show({ title: "", body: "Token approval failed", type: "error" })
          );
        });
    } else {
      dispatch(
        show({ title: "", body: "Please connect your wallet!", type: "error" })
      );
    }
  };

  const fetchEthBalance = async () => {
    if (web3 && address) {
      let ethBalance = await web3.eth.getBalance(address);
      ethBalance = parseFloat(web3.utils.fromWei(ethBalance, "ether")).toFixed(
        2
      );
      dispatch(setETHBalance(ethBalance));
    }
  };

  const fetchTokenBalance = async (tokenAddress) => {
    if (web3 && address) {
      const tokenContract = new web3.eth.Contract(
        TokenInfo.abi,
        TokenInfo.address
      );

      let tokenBalance = await tokenContract.methods.balanceOf(address).call();

      tokenBalance = parseFloat(
        web3.utils.fromWei(tokenBalance, "ether")
      ).toFixed(2);
      dispatch(setTokenBalance(tokenBalance));
    }
  };

  const fetchTokenPrice = async () => {
    web3 = new Web3(json_rpc);
    pairContract = new web3.eth.Contract(PairInfo.abi, PairInfo.address);
    if (pairContract) {
      const ethPriceResponse = await fetch(
        "https://api.coinbase.com/v2/prices/ETHUSD/spot"
      );
      const ethData = await ethPriceResponse.json();
      const ethPriceInUSD = ethData.data.amount;
      let reserves = await pairContract.methods.getReserves().call();
      let tokenPrice = reserves[1] / reserves[0];
      dispatch(setTokenPrice(tokenPrice * ethPriceInUSD));
    }
  };

  ///////////////////////// AFFILIATE PART START ///////////////////////
  ///////////////////////// AFFILIATE PART END /////////////////////////

  ///////////////////////// STAKING PART START ///////////////////////
  const fetchStakingData = async () => {
    // if (stakingContract) {
    //     const totalStaked = await stakingContract.methods.totalDeposits().call();
    //     const totalStakers = await stakingContract.methods.totalDepositors().call();
    //     const totalRewards = await stakingContract.methods.totalRewards().call();
    //     const totalWithdrawn = await stakingContract.methods.totalWithdrawn().call();
    //     // const withdrawDuration = await stakingContract.methods.withdrawDuration().call();
    //     const promises = [];
    //     promises.push(totalStaked);
    //     promises.push(totalStakers);
    //     promises.push(totalRewards);
    //     promises.push(totalWithdrawn);
    //     // promises.push(withdrawDuration);
    //     let temp = [];
    //     let result = await Promise.all(promises);
    //     result.forEach((item) => {
    //         temp.push(item);
    //     });
    //     temp[0] = web3.utils.fromWei(temp[0], 'ether');
    //     temp[1] = Number(temp[1]);
    //     temp[2] = web3.utils.fromWei(temp[2], 'ether');
    //     temp[3] = web3.utils.fromWei(temp[3], 'ether');
    //     // temp[4] = Number(temp[4]);
    //     dispatch(setStakingInfo({
    //         totalStaked: temp[0],
    //         totalStakers: temp[1],
    //         totalRewards: temp[2],
    //         totalWithdrawn: temp[3],
    //         // withdrawDuration: temp[4]
    //     }));
    // }
  };

  const fetchMyStakingData = async () => {
    // if (stakingContract && address) {
    //     const depositInfo = await stakingContract.methods.depositors(address).call();
    //     const totalDeposits = web3.utils.fromWei(depositInfo.totalDeposits, 'ether');
    //     const totalWithdrawn = web3.utils.fromWei(depositInfo.totalWithdrawn, 'ether');
    //     const totalRewards = web3.utils.fromWei(depositInfo.totalRewards, 'ether');
    //     const totalDepositCounts = Number(depositInfo.totalDepositsCount);
    //     const totalWithdrawCounts = Number(depositInfo.totalWithdrawnCount);
    //     dispatch(setMyStakingInfo({
    //         totalDeposits: Number(totalDeposits),
    //         totalWithdrawn: Number(totalWithdrawn),
    //         totalRewards: Number(totalRewards),
    //         totalDepositCounts: totalDepositCounts,
    //         totalWithdrawCounts: totalWithdrawCounts
    //     }));
    // }
  };

  const checkTokenAllowance = async (amount) => {
    if (tokenContract && address) {
      const allowance = await tokenContract.methods
        .allowance(address, StakingInfo.address)
        .call();

      return allowance >= amount;
    }
  };

  const checkDepositTiers = async () => {
    // if (stakingContract) {
    //     let depositTiers = [];
    //     for (let i = 0; i < 4; i++) {
    //         const depositTier = await stakingContract.methods.depositTier(i).call();
    //         depositTiers.push(Number(depositTier));
    //     }
    //     dispatch(setDepositTiers(depositTiers));
    // }
  };

  const getCurrentDay = async () => {
    console;
    if (stakingContract) {
      const today = await stakingContract.methods.getCurrentDay().call();

      // debugger;
    } else {
      console.log(" stacking methods empty");
    }
  };

  const depositJOK = (amount, lockPeriod) => {
    //console.log(`${amount} amount ${lockPeriod} loo pe`);
    if (stakingContract && address) {
      dispatch(setIsLoading(1));
      stakingContract.methods
        .stake(web3.utils.toWei(amount, "ether"), lockPeriod)
        .send({ from: address })
        .then(async (tx) => {
          //API LOGIC TO CREATE STAKING HERE I.E SAVE IN DATABASE
          let a = removeNConvertAndDivide(
            tx?.events?.NewStake?.returnValues?.amount
          );
          let datas = {
            contractRes: tx,
            amount: a,
          };
          const res = await updateJokStakingHistory(datas);
          if (res.success) {
            dispatch(setIsLoading(0));
            dispatch(
              show({
                title: "",
                body: "Deposit is done successfully!",
                type: "success",
              })
            );
            dispatch(hitMyStakingApi(true));
            // setDepositJOKContractRes(null);
          }
        })
        .catch((err) => {
          console.log(err);
          dispatch(setIsLoading(0));
          dispatch(show({ title: "", body: "Deposit failed", type: "error" }));
        });
    } else {
      dispatch(
        show({ title: "", body: "Please connect your wallet!", type: "error" })
      );
      dispatch(setIsLoading(0));
    }
  };

  const unStake = (stakeIndex) => {
    if (stakingContract && address) {
      // dispatch(setIsLoading(1));
      stakingContract.methods
        .unstake(stakeIndex)
        .send({ from: address })
        .then(async (tx) => {
          console.log(tx, "from unstakingggggggggggggggg");
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
        })
        .catch((err) => {
          console.log(err, "from unstaking errrrrrrooorrrrrrr");
          // dispatch(setIsLoading(0));
          dispatch(show({ title: "", body: "Deposit failed", type: "error" }));
        });
    } else {
      dispatch(
        show({ title: "", body: "Please connect your wallet!", type: "error" })
      );
    }
  };

  // const depositJOK = async (amount, lockPeriod) => {
  //   try {
  //     const tx = await contract
  //       .stake(web3.utils.toWei(amount, "ether"), lockPeriod)
  //       .send({ from: address });
  //     await tx.wait();
  //     console.log("tx res", tx);
  //   } catch (err) {
  //     console.log("err", err);
  //   }
  // };

  const getEcdsaSignature = async (message) => {
/*    const wall = web3.eth.accounts.wallet.add(
      "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353"
    );
    console.log(wall, "checlkk;llllllllll");*/
    try {
      // const messageBuffer = Buffer.from(message);
      // console.log(messageBuffer, "messageBuffermessageBuffer");
      // const signatureBuffer = web3.eth.accounts.sign(messageBuffer);

      // console.log(signatureBuffer, "signatureBuffersignatureBuffer");
      // const signatureHex = bufferToHex(signatureBuffer.signature);
      // console.log(signatureHex, "signatureHexsignatureHex");
     /* const signature = await ethereum.request({
        method: "personal_sign",
        params: [
          "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353",
          address,
        ],
      });*/
      const signature1 = await web3.eth.accounts.sign(
        message,
        "0x603c13734233792745d50a6c9c0a55a075ad8b919d3c57d024e72a98a2d86353"
      );
      console.log(signature1, "signature1signature1");
      /*const recoveredSigner = web3.eth.accounts.recover(
        "sign in with jok labs",
        "0x5026eac99f112a5330a956dec298323968317c9fd3711194e5c1e57ee506592b28cdee5744e97bcd3e029faaae58bba0fa0d7535f323680c7b3a2080dd8a1fb31c"
      );*/
      // const recoveredSigner = web3.eth.accounts.recover(
      //   //   "0x35caf37b1e9f0ea6aa92ee9a926ebb1b7e200a230b8d4a0e575487a7fc18931b",
      //   "sign in with jok labs",
      //   "0x1c",
      //   "0x5026eac99f112a5330a956dec298323968317c9fd3711194e5c1e57ee506592b",
      //   "0x28cdee5744e97bcd3e029faaae58bba0fa0d7535f323680c7b3a2080dd8a1fb3"
      // );

    //  console.log(recoveredSigner, "recoveredSignerrecoveredSigner");

      // console.log(recoveredSigner, "recoveredSignerrecoveredSigner");
      // console.log(
      //   recoveredSigner === "0x80E4929c869102140E69550BBECC20bEd61B080c",
      //   "check krooooooo"
     /* // );
       const signature =
        "0x5026eac99f112a5330a956dec298323968317c9fd3711194e5c1e57ee506592b28cdee5744e97bcd3e029faaae58bba0fa0d7535f323680c7b3a2080dd8a1fb31c";
      const signatureBuffer = Buffer.from(signature.substring(2), "hex");
      // console.log(signatureBuffer, "get me wt");
      if (signatureBuffer.length !== 65) {
        throw new Error("Invalid signature length");
      }
*/
      const r = signature1.r;
      const s = signature1.s;
      const v = signature1.v;
      // const hashMsg = web3.utils.soliditySha3({
      //   type: "string",
      //   value: message,
      // });
      // console.log(r, "rrrrrr", s, "sssssssssss", v, "vvv");
      // const recoveredSigner = web3.eth.accounts.recover(
      //   "0x35caf37b1e9f0ea6aa92ee9a926ebb1b7e200a230b8d4a0e575487a7fc18931b",
      //   "28",
      //   "0x5026eac99f112a5330a956dec298323968317c9fd3711194e5c1e57ee506592b",
      //   "0x28cdee5744e97bcd3e029faaae58bba0fa0d7535f323680c7b3a2080dd8a1fb3"
      // );

      // console.log(recoveredSigner, "recoveredSignerrecoveredSigner");
      console.log(r, "rrrrrr", s, "ssssss", v, "vvvvvv");
      return { r, s, v };
    } catch (error) {
      console.log(error, "from getEcdsaSignature");
    }
  };

  const withdrawDeposit = async ({ type }) => {
    if (stakingContract && address) {
      try {
        const { r, s, v } = await getEcdsaSignature("sign in with jok labs");

        const data = {
          earnings: web3.utils.toWei("10000000000000000", "ether"),
          affiliateEarnings: web3.utils.toWei("10000000000000000", "ether"),
          inETH: type === "ETH",
          _v: v,
          _r: r,
          _s: s,
        };
       // const accountNonce ='0x' + (web3.eth.getTransactionCount("0x80E4929c869102140E69550BBECC20bEd61B080c") + 1).toString(16);
     //   console.log(nonce, "acc none")
const getData = await stakingContract.methods
          .withdraw(
            data.earnings,
            data.affiliateEarnings,
            data.inETH,
            data._v,
            data._r,
            data._s
          ).send({from:address, gas:"250000"});
// finally pass this data parameter to send Transaction

        /*await stakingContract.methods
          .withdraw(
            data.earnings,
            data.affiliateEarnings,
            data.inETH,
            data._v,
            data._r,
            data._s
          )
          .send({ from: address, gas: "250000" })
          .then(async (tx) => {
            console.log(
              tx,
              "from withdraw functionnnnnn plz show me your true self"
            );
          });*/
        // const obj = {
        //   to: "0xb66525d6b1c90e803556142c23b3a4fa0e8ae384",
        //   data: stakingContract?.methods?.encodeFunctionData(
        //     "withdraw",
        //     params
        //   ),
        // };
        // const transactionObject = {
        //   ...obj,
        // };
        // const burnTx = await signer.sendTransaction(transactionObject);
        // });
        // console.log(burnTx, "Withdraw transaction successful");
        // .then(async (tx) => {
        //   console.log(
        //     tx,
        //     "from withdraw functionnnnnn plz show me your true self"
        //   );
        // });
      } catch (error) {
        console.log(error, "frommmm withdrawwww error not useful");
        // dispatch(setIsLoading(0));
        dispatch(show({ title: "", body: "Withdraw failed", type: "error" }));
      }
    }
  };

  const claimReward = () => {
    // if (stakingContract && address) {
    //     dispatch(setIsLoading(3));
    //     stakingContract.methods.claim().send({from: address}).then(async (tx) => {
    //         await updateJokHistory(address, 0, 'claim', tx.transactionHash);
    //         await getStakingFunc();
    //         dispatch(setIsLoading(0));
    //         dispatch(show({title: '', body: 'Claim is done successfully!', type: 'success'}));
    //     }).catch((err) => {
    //         console.log(err);
    //         dispatch(setIsLoading(0));
    //         dispatch(show({title: '', body: 'Claim failed', type: 'error'}));
    //     });
    // } else {
    //     dispatch(show({title: '', body: 'Please connect your wallet!', type: 'error'}));
    // }
  };
  ///////////////////////// STAKING PART END /////////////////////////

  ///////////////////////// MEV VAULT PART START ///////////////////////
  const fetchMevVaultData = async () => {
    if (vaultContract) {
      const totalDeposits = await vaultContract.methods.totalDeposits().call();
      const totalDepositors = await vaultContract.methods
        .totalDepositors()
        .call();
      const totalProfit = await vaultContract.methods.totalProfit().call();
      const withdrawDuration = await vaultContract.methods
        .withdrawDuration()
        .call();

      const promises = [];

      promises.push(totalDeposits);
      promises.push(totalDepositors);
      promises.push(totalProfit);
      promises.push(withdrawDuration);

      let temp = [];
      let result = await Promise.all(promises);
      result.forEach((item) => {
        temp.push(item);
      });

      temp[0] = parseFloat(web3.utils.fromWei(temp[0], "ether")).toFixed(2);
      temp[1] = Number(temp[1]);
      temp[2] = parseFloat(web3.utils.fromWei(temp[2], "ether")).toFixed(2);
      temp[3] = Number(temp[3]);

      dispatch(
        setVaultInfo({
          totalDeposits: temp[0],
          totalDepositors: temp[1],
          totalProfit: temp[2],
          withdrawDuration: temp[3],
        })
      );
    }
  };

  const fetchMyMevVaultData = async () => {
    if (vaultContract && address) {
      const depositInfo = await vaultContract.methods
        .depositors(address)
        .call();
      const totalDeposits = parseFloat(
        web3.utils.fromWei(depositInfo.totalDeposits, "ether")
      ).toFixed(5);
      const totalWithdrawn = parseFloat(
        web3.utils.fromWei(depositInfo.totalWithdrawn, "ether")
      ).toFixed(5);
      const totalEarned = parseFloat(
        web3.utils.fromWei(depositInfo.totalEarned, "ether")
      ).toFixed(5);
      const totalReferralEarned = parseFloat(
        web3.utils.fromWei(depositInfo.totalReferralEarned, "ether")
      ).toFixed(5);

      dispatch(
        setMyVaultInfo({
          totalDeposits: totalDeposits,
          totalWithdrawn: totalWithdrawn,
          totalEarned: totalEarned,
          totalReferralEarned: totalReferralEarned,
        })
      );
    }
  };

  const depositETH = async (amount, upline) => {
    if (vaultContract && address) {
      dispatch(setIsLoading(4));
      const tx = vaultContract.methods
        .depositETH(upline)
        .send({
          from: address,
          value: web3.utils.toWei(amount, "ether"),
        })
        .then(async () => {
          await getVaultFunc();
          await getTokenFunc();
          dispatch(setIsLoading(0));
          dispatch(
            show({
              title: "",
              body: "ETH deposited successfully",
              type: "success",
            })
          );
        })
        .catch((err) => {
          console.log(err);
          dispatch(setIsLoading(0));
          dispatch(
            show({ title: "", body: "ETH deposit failed", type: "error" })
          );
        });
    } else {
      dispatch(
        show({ title: "", body: "Please connect your wallet!", type: "error" })
      );
    }
  };

  const withdrawETH = async (_amount) => {
    if (vaultContract && address) {
      dispatch(setIsLoading(5));
      const tx = vaultContract.methods
        .withdrawETH(web3.utils.toWei(_amount, "ether"))
        .send({ from: address })
        .then(async () => {
          await getVaultFunc();
          await getTokenFunc();
          dispatch(setIsLoading(0));
          dispatch(
            show({
              title: "",
              body: "ETH withdrawn successfully",
              type: "success",
            })
          );
        })
        .catch((err) => {
          console.log(err);
          dispatch(setIsLoading(0));
          dispatch(
            show({ title: "", body: "ETH withdraw failed", type: "error" })
          );
        });
    } else {
      dispatch(
        show({ title: "", body: "Please connect your wallet!", type: "error" })
      );
    }
  };

  return {
    approveToken,
    fetchStakingData,
    fetchMyStakingData,
    checkTokenAllowance,
    depositJOK,
    withdrawDeposit,
    claimReward,
    fetchMevVaultData,
    fetchMyMevVaultData,
    depositETH,
    withdrawETH,
    fetchTokenBalance,
    fetchEthBalance,
    fetchTokenPrice,
    checkDepositTiers,
    getUpline,
    getStakingFunc,
    getCurrentDay,
    unStake,
  };
};
