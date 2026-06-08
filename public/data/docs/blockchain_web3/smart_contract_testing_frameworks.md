# Smart Contract Testing Frameworks

Testing smart contracts is paramount in blockchain development. Unlike traditional software, bugs in smart contracts can lead to irreversible loss of funds, security vulnerabilities, and significant reputational damage. Comprehensive testing ensures your decentralized applications (dApps) are robust, secure, and function as intended. This guide will cover various testing methodologies and popular frameworks.

## 1. Why Test Smart Contracts?

*   **Immutability:** Once deployed, smart contracts cannot be changed. Testing catches errors before deployment.
*   **High Stakes:** Financial assets are often managed by smart contracts, making security critical.
*   **Complexity:** Smart contracts often interact with other contracts, external protocols, and various states, increasing potential for bugs.

## 2. Types of Smart Contract Tests

### 2.1. Unit Tests

Unit tests focus on individual functions or components of a smart contract in isolation. They ensure each piece of logic works correctly under various conditions.

*   **Goal:** Verify the correctness of the smallest testable units.
*   **Example:** Testing if a `transfer` function correctly deducts from one balance and adds to another.
*   **Frameworks:** Hardhat with Waffle/Chai (JavaScript/TypeScript), Foundry's Forge (Solidity).

### 2.2. Integration Tests

Integration tests verify the interactions between multiple smart contracts, external libraries, or different components of your dApp.

*   **Goal:** Ensure contracts work together harmoniously.
*   **Example:** Testing a DeFi protocol involving a token contract, a liquidity pool contract, and a swap router contract.
*   **Frameworks:** Hardhat, Foundry.

### 2.3. Property-Based (Fuzz) Tests

Property-based testing, or fuzzing, involves testing contract functions with a wide range of random inputs to uncover edge cases and unexpected behaviors that might be missed by manual test cases. It's particularly effective for identifying security vulnerabilities.

*   **Goal:** Prove properties about the contract's behavior rather than specific input/output pairs, especially with arbitrary inputs.
*   **Example:** Fuzzing a `deposit` function with varying amounts and addresses to ensure invariants (e.g., total supply always increases by deposit amount) hold true.
*   **Frameworks:** Foundry's Forge is renowned for its native Solidity fuzz testing capabilities.

### 2.4. Fork Tests

Fork testing allows you to run your tests against a "fork" of an existing live blockchain network (e.g., Ethereum Mainnet, Polygon). This enables testing your contracts in a realistic environment with actual deployed contracts and state, without deploying to the real network.

*   **Goal:** Test interactions with existing live protocols and realistic state.
*   **Example:** Testing a new lending protocol against Aave's deployed contracts on a mainnet fork.
*   **Frameworks:** Hardhat Network, Foundry Anvil.

## 3. Popular Testing Frameworks

### 3.1. Hardhat (with Waffle/Chai)

Hardhat is a popular Ethereum development environment that comes with a built-in local Ethereum network, debugging tools, and a testing framework. It typically uses `ethers.js` for interacting with contracts, and `Waffle` (a testing library) along with `Chai` (an assertion library) for writing tests in JavaScript or TypeScript.

*   **Strengths:** Extensive tooling, large community, excellent for JavaScript/TypeScript developers, robust debugging.
*   **Use Case:** Ideal for projects that prefer a JavaScript/TypeScript development workflow.

```javascript
// Example Hardhat test (JavaScript)
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    myToken = await MyToken.deploy("MyToken", "MTK", 1000);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await myToken.transfer(addr1.address, 50);
      expect(await myToken.balanceOf(addr1.address)).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await myToken.connect(addr1).transfer(addr2.address, 50);
      expect(await myToken.balanceOf(addr2.address)).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);

      // Try to send 1000000000 tokens from addr1 (0 tokens)
      await expect(
        myToken.connect(addr1).transfer(owner.address, 1000000000)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await myToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
```

### 3.2. Foundry (Forge)

Foundry is a blazing-fast, portable, and modular toolkit for Ethereum application development written in Rust. Its testing framework, Forge, allows you to write tests entirely in Solidity. This provides a direct and often more intuitive way to test Solidity contracts, especially for property-based and fuzz testing.

*   **Strengths:** Native Solidity testing, excellent for fuzz testing, fast execution, powerful cheat codes for testing complex scenarios, gas optimization tooling.
*   **Use Case:** Ideal for projects prioritizing native Solidity development, advanced fuzz testing, and performance.

```solidity
// Example Foundry (Forge) test (Solidity)
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/SimpleWallet.sol"; // Adjust path to your contract

contract SimpleWalletTest is Test {
    SimpleWallet wallet;
    address owner;
    address user1;
    address user2;

    function setUp() public {
        owner = address(this); // In Forge, `address(this)` is the test contract, which acts as the default sender.
        user1 = vm.makeAddr("user1");
        user2 = vm.makeAddr("user2");
        wallet = new SimpleWallet(); // Deploy the contract
        vm.deal(owner, 10 ether); // Give owner some ether for transactions
        vm.deal(user1, 5 ether);
    }

    // Unit Test: Deposit functionality
    function testDeposit() public {
        uint256 depositAmount = 1 ether;
        vm.startPrank(user1);
        wallet.deposit{value: depositAmount}();
        vm.stopPrank();

        assertEq(wallet.getBalance(), depositAmount);
        assertEq(wallet.getDepositorBalance(user1), depositAmount);
    }

    // Unit Test: Withdraw functionality
    function testWithdraw() public {
        uint256 depositAmount = 2 ether;
        vm.startPrank(user1);
        wallet.deposit{value: depositAmount}();
        vm.stopPrank();

        uint256 withdrawAmount = 1 ether;
        vm.startPrank(user1);
        wallet.withdraw(withdrawAmount);
        vm.stopPrank();

        assertEq(wallet.getBalance(), depositAmount - withdrawAmount);
        assertEq(wallet.getDepositorBalance(user1), depositAmount - withdrawAmount);
    }

    // Fuzz Test: Ensure total balance is always sum of individual deposits
    function testFuzz_TotalBalanceInvariant(uint256 amount1, uint256 amount2) public {
        // Constrain amounts to prevent overflow and ensure realistic values
        amount1 = bound(amount1, 100 wei, 1 ether);
        amount2 = bound(amount2, 100 wei, 1 ether);

        vm.startPrank(user1);
        wallet.deposit{value: amount1}();
        vm.stopPrank();

        vm.startPrank(user2);
        wallet.deposit{value: amount2}();
        vm.stopPrank();

        assertEq(wallet.getBalance(), amount1 + amount2, "Total balance mismatch after deposits");
    }

    // Fuzz Test: Cannot withdraw more than deposited
    function testFuzz_CannotWithdrawMoreThanDeposited(uint256 depositAmount, uint256 withdrawAmount) public {
        depositAmount = bound(depositAmount, 1 wei, 1 ether); // Ensure deposit is positive
        withdrawAmount = bound(withdrawAmount, 1 wei, 2 ether); // Allow withdraw to be potentially larger

        vm.startPrank(user1);
        wallet.deposit{value: depositAmount}();
        vm.stopPrank();

        // Attempt to withdraw
        vm.startPrank(user1);
        if (withdrawAmount > depositAmount) {
            vm.expectRevert("Insufficient balance");
            wallet.withdraw(withdrawAmount);
        } else {
            // Should succeed
            wallet.withdraw(withdrawAmount);
            assertEq(wallet.getDepositorBalance(user1), depositAmount - withdrawAmount);
        }
        vm.stopPrank();
    }
}

// SimpleWallet.sol (for the example above)
// pragma solidity ^0.8.0;
//
// contract SimpleWallet {
//     mapping(address => uint256) public balances;
//     uint256 public totalBalance;
//
//     function deposit() public payable {
//         require(msg.value > 0, "Deposit amount must be greater than zero");
//         balances[msg.sender] += msg.value;
//         totalBalance += msg.value;
//     }
//
//     function withdraw(uint256 amount) public {
//         require(balances[msg.sender] >= amount, "Insufficient balance");
//         require(amount > 0, "Withdraw amount must be greater than zero");
//
//         balances[msg.sender] -= amount;
//         totalBalance -= amount;
//         payable(msg.sender).transfer(amount);
//     }
//
//     function getBalance() public view returns (uint256) {
//         return totalBalance;
//     }
//
//     function getDepositorBalance(address depositor) public view returns (uint256) {
//         return balances[depositor];
//     }
// }
```

## 4. Checklist/Exercise

1.  **Distinguish Test Types:** Explain the primary difference between a "unit test" and a "property-based (fuzz) test" in the context of smart contracts.
2.  **Framework Choice:** If you need to test a contract's interaction with a deployed Uniswap V3 pool on Ethereum Mainnet, which type of test (and potentially which framework's feature) would be most suitable?
3.  **Basic Test Implementation:** Briefly describe the steps to set up a basic Hardhat project and write a simple unit test for a `Pausable` contract's `pause()` function.
