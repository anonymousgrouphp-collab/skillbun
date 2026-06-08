# Ethereum Gas Model & Costs: A Comprehensive Guide

The Ethereum Gas Model is a fundamental concept for anyone interacting with or building on the Ethereum blockchain. It's the mechanism that powers transactions and smart contract execution, ensuring network security and resource allocation.

## 1. What is Gas?

At its core, **Gas** is a unit of measurement for computational effort. Every operation performed on the Ethereum Virtual Machine (EVM) – from a simple arithmetic calculation to storing data or transferring Ether – consumes a certain amount of gas. Think of it as the "fuel" required to drive operations on the Ethereum network.

**Why is Gas Needed?**
*   **Prevents Infinite Loops:** Without gas, a malicious actor could deploy a smart contract with an infinite loop, effectively halting the network. Gas ensures every operation costs something, making such attacks prohibitively expensive.
*   **Resource Allocation:** It creates a market for block space and computational resources, ensuring that the network prioritizes transactions based on their willingness to pay.
*   **Security & Spam Prevention:** By attaching a cost to every operation, gas deters spam attacks and ensures that only legitimate and economically viable transactions are processed.

## 2. Key Components of the Gas Model

Understanding the following terms is crucial for comprehending transaction costs:

### a. Gas Unit
This is the base unit of work. Different EVM opcodes (operations) have a predefined gas cost. For example, a simple addition might cost 3 gas, while storing a word in memory might cost 20,000 gas. The total gas consumed by a transaction is the sum of gas costs of all opcodes executed.

### b. Gas Limit
The **Gas Limit** is the maximum amount of gas units a user is willing to spend for a particular transaction.
*   When you send a transaction, you specify a gas limit.
*   If the actual gas consumed by the transaction (the "gas used") exceeds the gas limit, the transaction fails, and all changes made by the transaction are reverted. Critically, you still pay for all the gas specified in the gas limit (or the gas actually used, if it's less than the limit but still causes a revert *before* completion). This is to prevent attackers from intentionally running out of gas to clog the network.
*   If the actual gas used is less than the gas limit, the remaining unused gas is refunded to the sender (more on refunds below).

### c. Gas Price (Pre-EIP-1559 Model)
Before the London hardfork (EIP-1559), the transaction cost was simpler:
`Total Transaction Cost = Gas Used × Gas Price`
The `Gas Price` was a single value (e.g., 20 Gwei per gas unit) determined by market demand, where users bid against each other to get their transactions included by miners.

### d. EIP-1559: The London Hardfork (Introduced Base Fee & Priority Fee)
EIP-1559 fundamentally changed how transaction fees are calculated and how transactions are prioritized. It aimed to make transaction costs more predictable and reduce volatility.

*   **Base Fee:** This is the minimum price per unit of gas required for a transaction to be included in the current block. The protocol automatically adjusts the base fee up or down by a maximum of 12.5% per block, depending on network congestion (if the block is more than 50% full, the base fee increases; if less, it decreases). The base fee is **burned** (removed from circulation), not paid to miners.
*   **Priority Fee (Tip):** An optional amount you pay directly to the miner to incentivize them to include your transaction in a block. In a congested network, a higher priority fee can help ensure your transaction is picked up faster.
*   **Max Fee Per Gas:** This is the maximum total amount per gas unit you are willing to pay for your transaction. It must be greater than or equal to the `Base Fee + Priority Fee`. If the `Max Fee Per Gas` is set too low (less than the current `Base Fee`), your transaction will not be processed.

## 3. How Transaction Costs are Calculated (Post-EIP-1559)

The actual price paid per gas unit (the "effective gas price") is `Base Fee + Priority Fee`. However, this effective gas price cannot exceed your `Max Fee Per Gas`.

**Total Transaction Cost = Gas Used × (Base Fee + Priority Fee)**
*(Note: The actual priority fee paid to the miner will be `min(Max Fee Per Gas - Base Fee, Priority Fee)` if `Max Fee Per Gas` is sufficient).
*
Let's illustrate with an example:
*   Current `Base Fee` = 100 Gwei
*   You set `Priority Fee` = 10 Gwei
*   You set `Max Fee Per Gas` = 150 Gwei
*   Your transaction consumes `Gas Used` = 21,000 units (e.g., for a simple Ether transfer)

1.  **Effective Gas Price:** `Base Fee + Priority Fee` = 100 Gwei + 10 Gwei = 110 Gwei.
2.  Since 110 Gwei (Effective Gas Price) is less than your `Max Fee Per Gas` (150 Gwei), you pay 110 Gwei per gas unit.
3.  **Total Cost:** `21,000 Gas × 110 Gwei/Gas = 2,310,000 Gwei` (or 0.00231 Ether).
    *   **Amount Burned:** `21,000 Gas × 100 Gwei/Gas = 2,100,000 Gwei` (0.0021 Ether)
    *   **Amount Paid to Miner (Priority Fee):** `21,000 Gas × 10 Gwei/Gas = 210,000 Gwei` (0.00021 Ether)

If you had set `Max Fee Per Gas` to 105 Gwei in this scenario:
*   `Effective Gas Price` would be capped at 105 Gwei.
*   `Total Cost` = `21,000 Gas × 105 Gwei/Gas = 2,205,000 Gwei`.
*   `Amount Burned` remains `21,000 Gas × 100 Gwei/Gas = 2,100,000 Gwei`.
*   `Amount Paid to Miner` (Priority Fee) = `21,000 Gas × (105 Gwei - 100 Gwei) = 21,000 Gas × 5 Gwei = 105,000 Gwei`.

## 4. Gas Refunds

Ethereum offers gas refunds for operations that reduce the state size of the blockchain. This incentivizes developers to write efficient smart contracts and to "clean up" storage when data is no longer needed.
*   **SSTORE (clearing a storage slot):** When you change a storage slot from a non-zero value back to zero, you receive a refund.
*   **SELFDESTRUCT (destroying a contract):** When a contract is destroyed, its storage is cleared, and a significant refund is issued.

The maximum refund for a transaction is capped at 20% of the total gas used in that transaction.

## 5. Practical Example: Transaction Parameters

When sending a transaction programmatically (e.g., using `ethers.js` or `web3.js`), you typically specify these parameters:

```javascript
// Example using ethers.js
const tx = {
  to: '0x...', // Recipient address
  value: ethers.utils.parseEther('0.1'), // Amount of Ether to send
  gasLimit: 21000, // Maximum gas units for a simple transfer
  maxFeePerGas: ethers.utils.parseUnits('150', 'gwei'), // Max total price per gas unit
  maxPriorityFeePerGas: ethers.utils.parseUnits('10', 'gwei') // Tip to the miner
};

// You would then sign and send this transaction
// wallet.sendTransaction(tx);
```

## 6. Quick Check for Understanding

1.  A transaction executes 50,000 gas units. The current base fee is 80 Gwei, and you set a priority fee of 5 Gwei. Your `maxFeePerGas` is 100 Gwei. What is the total cost of the transaction in Gwei, and how much of it is burned?
2.  Explain why `gasLimit` is a crucial parameter for preventing denial-of-service attacks on the Ethereum network.
3.  What is the primary difference between the `base fee` and the `priority fee` introduced by EIP-1559, and who receives each portion?