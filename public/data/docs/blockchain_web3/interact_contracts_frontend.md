# Interacting with Smart Contracts (Frontend)

## Introduction
The frontend serves as the user's gateway to decentralized applications (dApps). Learning to interact with smart contracts from a web interface is fundamental for any Web3 developer. This guide covers the essential techniques for reading data, sending transactions, handling confirmations, monitoring events, and providing a robust user experience.

## 1. Connecting to a Web3 Provider and Wallet
Before any interaction, your frontend needs to connect to a Web3 provider (like MetaMask, WalletConnect, etc.) which injects an Ethereum provider into the browser. Libraries like `ethers.js` or `web3.js` abstract away much of the complexity.

```javascript
// Using ethers.js v6
import { ethers } from "ethers";

let provider;
let signer;

async function connectWallet() {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      console.log("Wallet Connected:", await signer.getAddress());
    } catch (error) {
      console.error("User denied account access or other error:", error);
    }
  } else {
    alert("Please install MetaMask or another Ethereum wallet!");
  }
}

// Call connectWallet() on page load or button click
```

## 2. Reading Contract State (Call Methods)
"Call" methods are read-only operations that do not modify the blockchain state. They are free (do not require gas) and execute locally on your connected node.

*   **Instantiating a Contract:** You need the contract's Address and its Application Binary Interface (ABI).
*   **Performing a Call:** Simply call the contract function.

```javascript
// Assuming provider is already initialized from connectWallet()
const contractAddress = "0xYourContractAddressHere";
const contractABI = [ /* ... your contract's ABI array ... */ ]; // Only include functions you need to interact with

async function readContractData() {
  if (!provider) {
    alert("Please connect your wallet first!");
    return;
  }

  const myContract = new ethers.Contract(contractAddress, contractABI, provider);

  try {
    const value = await myContract.somePublicGetterFunction();
    console.log("Value from contract:", value.toString()); // Convert BigInt to string if necessary
  } catch (error) {
    console.error("Error reading contract data:", error);
  }
}
```

## 3. Sending Transactions (Send Methods)
"Send" methods modify the blockchain state, requiring a transaction to be sent and mined. These operations consume gas and need to be signed by the user's wallet.

*   **Instantiating a Contract with a Signer:** For state-changing operations, the contract object must be initialized with a `Signer`.
*   **Sending a Transaction:** Call the contract function as usual. The provider will prompt the user to sign the transaction.

```javascript
// Assuming signer is already initialized from connectWallet()
const contractAddress = "0xYourContractAddressHere";
const contractABI = [ /* ... your contract's ABI array ... */ ];

async function sendTransaction() {
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  // Contract instance connected to the signer for write operations
  const myContract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    const newValue = 123; // Example value
    const tx = await myContract.someSetterFunction(newValue);
    console.log("Transaction sent:", tx.hash);

    // Wait for the transaction to be mined (next section)
    await handleTransactionConfirmation(tx);

  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}
```

## 4. Handling Transaction Confirmations
After sending a transaction, it enters a pending state. You must wait for it to be mined into a block to confirm its inclusion and execution on the blockchain.

*   **`tx.wait()`:** Ethers.js provides the `wait()` method on the transaction response, which returns a `TransactionReceipt` once the transaction is confirmed.

```javascript
async function handleTransactionConfirmation(tx) {
  try {
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait(); // This will wait until the transaction is mined
    console.log("Transaction confirmed!", receipt);
    console.log("Transaction was mined in block:", receipt.blockNumber);
    // You can also check receipt.status for success (1) or failure (0)
    if (receipt.status === 1) {
      console.log("Transaction successful!");
    } else {
      console.error("Transaction failed!");
    }
  } catch (error) {
    console.error("Error waiting for transaction confirmation:", error);
  }
}
```

## 5. Monitoring On-Chain Events
Smart contracts can emit events to signal that something significant has happened. Frontends can listen for these events in real-time to update the UI without constantly polling contract state.

*   **Defining Events in Solidity:**
    ```solidity
    event ValueChanged(address indexed user, uint256 oldValue, uint256 newValue);
    // Inside a function:
    emit ValueChanged(msg.sender, oldVal, newVal);
    ```
*   **Listening from Frontend:**

```javascript
// Assuming provider is initialized
const contractAddress = "0xYourContractAddressHere";
const contractABI = [ /* ... your contract's ABI array, make sure event is included ... */ ];

async function listenForEvents() {
  if (!provider) {
    alert("Please connect your wallet first!");
    return;
  }

  const myContract = new ethers.Contract(contractAddress, contractABI, provider);

  // Listen for a specific event
  myContract.on("ValueChanged", (user, oldValue, newValue, event) => {
    console.log("Event 'ValueChanged' detected:");
    console.log("  User:", user);
    console.log("  Old Value:", oldValue.toString());
    console.log("  New Value:", newValue.toString());
    console.log("  Transaction Hash:", event.log.transactionHash);
    // Update UI based on event data
  });

  console.log("Listening for 'ValueChanged' events...");

  // To stop listening:
  // myContract.off("ValueChanged");
}
```

## 6. Managing Pending States and Error Messages in the UI
A robust dApp needs to provide clear feedback to the user during various stages of interaction.

*   **Pending States:**
    *   Show a loading spinner or "Processing Transaction..." message after `sendTransaction` but before `tx.wait()` completes.
    *   Disable buttons to prevent multiple transaction submissions.
*   **Success Messages:**
    *   Display "Transaction Confirmed!" and potentially a link to the transaction on a block explorer.
*   **Error Messages:**
    *   **User Rejection:** `ethers.js` throws an error if the user rejects the transaction in their wallet. Catch this and inform the user.
    *   **Gas Estimation Failure/Insufficient Funds:** These often occur before the transaction is sent.
    *   **Smart Contract Reverts:** If a transaction fails on-chain (e.g., due to a `require` statement), `tx.wait()` will throw an error with details. Parse these errors to provide user-friendly feedback.

```javascript
async function exampleTransactionWithUIFeedback() {
  // Assume state variables like `isLoading`, `errorMessage`, `successMessage`
  // isLoading = true;
  // errorMessage = null;
  // successMessage = null;

  try {
    // ... connect wallet and instantiate contract with signer ...
    // const tx = await myContract.someSetterFunction(newValue);
    // console.log("Transaction sent:", tx.hash);
    // successMessage = "Transaction sent! Waiting for confirmation...";

    // const receipt = await tx.wait();
    // isLoading = false;

    // if (receipt.status === 1) {
    //   successMessage = "Transaction successful!";
    // } else {
    //   errorMessage = "Transaction failed on-chain.";
    // }

  } catch (error) {
    // isLoading = false;
    if (error.code === 4001) { // Ethers.js error code for user rejected transaction
      // errorMessage = "Transaction rejected by user.";
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      // errorMessage = "Failed to estimate gas. Check contract logic or gas limits.";
    } else {
      // console.error("General transaction error:", error);
      // errorMessage = `Transaction error: ${error.message || error.reason || "Unknown error"}`;
    }
  }
}
```

## Quick Checklist/Exercise

1.  Describe the key difference between a "call" operation and a "send" operation when interacting with a smart contract from the frontend.
2.  Imagine you have a dApp that allows users to mint an NFT. What frontend techniques would you use to show the user that their minting transaction is in progress, successful, or failed?
3.  Why is it important to listen for smart contract events, and how does it improve the user experience of a dApp?