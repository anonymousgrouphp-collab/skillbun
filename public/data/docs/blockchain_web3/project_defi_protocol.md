## Project: Build a DeFi Protocol - Study Guide

Developing a DeFi (Decentralized Finance) protocol is a cornerstone project in blockchain development, showcasing your ability to design and implement complex financial logic on a decentralized ledger. This guide focuses on building a simplified lending/borrowing platform, covering the essential smart contract logic and frontend interaction.

### 1. Core Concepts & Technologies

To build a DeFi protocol, a solid understanding of several key concepts and technologies is crucial:

*   **Blockchain Fundamentals**: At its heart, DeFi operates on a blockchain, utilizing its immutability, transparency, and decentralization. Understanding how transactions are processed and blocks are validated is fundamental.
*   **Smart Contracts**: These are self-executing contracts with the terms of the agreement directly written into code. They are the backbone of any DeFi application, automating financial operations without intermediaries.
*   **Solidity**: The primary programming language for writing smart contracts on the Ethereum Virtual Machine (EVM). Familiarity with its syntax, data types, mappings, and control structures is essential.
*   **EVM (Ethereum Virtual Machine)**: The runtime environment for smart contracts on Ethereum (and compatible blockchains). Understanding how transactions are executed and state changes occur within the EVM is vital.
*   **Token Standards**: DeFi protocols heavily rely on token standards. The most common is **ERC-20** for fungible tokens (like stablecoins or governance tokens), which are used as collateral or loan assets.
*   **Oracles**: To interact with real-world data (e.g., asset prices, exchange rates) that isn't natively available on the blockchain, DeFi protocols use oracles like **Chainlink**. These securely feed off-chain information onto the blockchain.
*   **Web3 Libraries**: For frontend development, libraries like **Ethers.js** or **Web3.js** are used to interact with Ethereum nodes, read blockchain data, and send transactions from a user's browser.
*   **Development Tools**: Frameworks like **Hardhat** or **Truffle** provide a complete environment for smart contract development, including testing, deployment, and debugging.

### 2. Deep Dive: Building a Simplified Lending Protocol

A lending protocol allows users to deposit assets as collateral and borrow other assets against that collateral. Key components include:

*   **Collateral Deposit**: Users lock up ERC-20 tokens (e.g., WETH, USDC) in the protocol as security for their loans.
*   **Borrowing**: Users can borrow a percentage of their collateral's value in a different asset (e.g., DAI) based on a **collateralization ratio** (e.g., 150%, meaning for every $100 borrowed, $150 worth of collateral is needed).
*   **Interest Rates**: Borrowers pay interest on their loans, which can be fixed or dynamically adjusted based on supply and demand.
*   **Repayment**: Borrowers repay their loan plus accrued interest to retrieve their collateral.
*   **Withdrawal**: Once a loan is fully repaid, users can withdraw their deposited collateral.
*   **Liquidation**: If the value of a borrower's collateral falls below a predefined threshold (making the loan undercollateralized), the collateral can be liquidated (sold) to repay the loan and cover protocol losses.

### 3. Simplified Solidity Contract Example

Here's a basic Solidity contract snippet demonstrating the core functions of a lending pool. This example makes several simplifications (e.g., hardcoded token addresses, basic price assumption, simplified interest/liquidation) for clarity in a study guide context. In a real application, you would integrate with robust oracle networks and implement more sophisticated risk management.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // For funding the pool

contract SimpleLendingPool is Ownable {
    // Mapping: user address => collateral token address => amount deposited
    mapping(address => mapping(address => uint256)) public userCollateral;
    // Mapping: borrower address => loan token address => amount borrowed
    mapping(address => mapping(address => uint256)) public userLoans;

    // Simplified constants for demonstration
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateral required (e.g., $150 collateral for $100 loan)
    uint256 public constant LIQUIDATION_THRESHOLD = 120; // If collateral drops below 120%, it's eligible for liquidation
    uint256 public constant INTEREST_RATE_BPS = 500; // 5% annual interest (simplified, no time-based calculation here)

    // Example Token Addresses (replace with actual testnet addresses)
    address constant WETH_TOKEN = 0xd0A1E359B76CcE8339de7e7C0BcdF00aBc82cFe;
    address constant DAI_TOKEN = 0x8f3Cf7ad23Cd3CaDbD9735Fd580081adeD9FCb2;

    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Borrowed(address indexed user, address indexed token, uint256 amount);
    event Repaid(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);

    // --- Internal/Helper Functions (simplified for this example) ---

    // Placeholder for an oracle price feed. In real life, integrate Chainlink.
    function getPrice(address _token) internal pure returns (uint256) {
        // For simplicity, assume WETH = 2000 USD and DAI = 1 USD (scaled to 1e18)
        if (_token == WETH_TOKEN) return 2000e18; // 2000 USD
        if (_token == DAI_TOKEN) return 1e18;    // 1 USD
        return 0; // Unknown token
    }

    // Calculates current collateral value and loan value in a common unit (e.g., USD)
    function _getAccountHealth(address _user) internal view returns (uint256 totalCollateralValue, uint256 totalLoanValue) {
        uint256 wethAmount = userCollateral[_user][WETH_TOKEN];
        uint256 daiLoanAmount = userLoans[_user][DAI_TOKEN];

        if (wethAmount > 0) {
            totalCollateralValue = (wethAmount * getPrice(WETH_TOKEN)) / 1e18;
        }
        if (daiLoanAmount > 0) {
            totalLoanValue = (daiLoanAmount * getPrice(DAI_TOKEN)) / 1e18;
        }
    }

    // --- User-Facing Functions ---

    function deposit(address _collateralToken, uint256 _amount) public {
        require(_amount > 0, "Deposit amount must be greater than zero");
        require(_collateralToken == WETH_TOKEN, "Only WETH accepted as collateral in this example");

        IERC20(_collateralToken).transferFrom(msg.sender, address(this), _amount);
        userCollateral[msg.sender][_collateralToken] += _amount;
        emit Deposited(msg.sender, _collateralToken, _amount);
    }

    function getAvailableBorrowLimit(address _borrower, address _loanToken) public view returns (uint256) {
        require(_loanToken == DAI_TOKEN, "Only DAI can be borrowed in this example");

        (uint256 totalCollateralValue, uint256 totalLoanValue) = _getAccountHealth(_borrower);

        if (totalCollateralValue == 0) return 0; // No collateral, no borrow limit

        // Calculate max borrowable value based on collateral ratio
        uint256 maxBorrowValue = (totalCollateralValue * 1e18) / COLLATERAL_RATIO;

        if (maxBorrowValue <= totalLoanValue) return 0; // Already borrowed up to limit or over

        // Convert remaining borrow limit from USD value to loan token amount
        uint256 remainingBorrowValue = maxBorrowValue - totalLoanValue;
        uint256 loanTokenPrice = getPrice(_loanToken);
        if (loanTokenPrice == 0) return 0; // Cannot determine price

        return (remainingBorrowValue * 1e18) / loanTokenPrice;
    }

    function borrow(address _loanToken, uint256 _amount) public {
        require(_amount > 0, "Borrow amount must be greater than zero");
        require(_loanToken == DAI_TOKEN, "Only DAI can be borrowed in this example");
        
        uint256 availableLimit = getAvailableBorrowLimit(msg.sender, _loanToken);
        require(_amount <= availableLimit, "Borrow amount exceeds available limit");

        // Transfer loan tokens from the pool to the borrower
        IERC20(_loanToken).transfer(msg.sender, _amount);
        userLoans[msg.sender][_loanToken] += _amount;
        emit Borrowed(msg.sender, _loanToken, _amount);
    }

    function repay(address _loanToken, uint256 _amount) public {
        require(_amount > 0, "Repay amount must be greater than zero");
        require(_loanToken == DAI_TOKEN, "Only DAI can be repaid in this example");

        // In a real system, interest calculation would happen here based on time.
        // For this example, we'll just repay the principal.
        uint256 outstandingLoan = userLoans[msg.sender][_loanToken];
        require(outstandingLoan >= _amount, "Repay amount exceeds outstanding loan");

        // Transfer repay amount from borrower to the pool
        IERC20(_loanToken).transferFrom(msg.sender, address(this), _amount);
        userLoans[msg.sender][_loanToken] -= _amount;
        emit Repaid(msg.sender, _loanToken, _amount);
    }

    function withdraw(address _collateralToken, uint256 _amount) public {
        require(_amount > 0, "Withdraw amount must be greater than zero");
        require(_collateralToken == WETH_TOKEN, "Only WETH collateral can be withdrawn in this example");

        uint256 currentCollateral = userCollateral[msg.sender][_collateralToken];
        require(currentCollateral >= _amount, "Insufficient collateral to withdraw");
        
        // Check if withdrawing would make the loan undercollateralized
        // Recalculate health factor after hypothetical withdrawal
        (uint256 totalCollateralValue, uint256 totalLoanValue) = _getAccountHealth(msg.sender);
        
        uint256 hypotheticalCollateralValue = totalCollateralValue - ((_amount * getPrice(_collateralToken)) / 1e18);

        // If there's an outstanding loan, ensure health remains above liquidation threshold
        if (totalLoanValue > 0) {
            require(hypotheticalCollateralValue * 1e18 / totalLoanValue >= LIQUIDATION_THRESHOLD, "Withdrawal would make loan undercollateralized");
        }

        userCollateral[msg.sender][_collateralToken] -= _amount;
        IERC20(_collateralToken).transfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _collateralToken, _amount);
    }

    // --- Owner Function to fund the pool ---

    function fundPool(address _token, uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount to fund must be greater than zero");
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
    }
}
```

### 4. Frontend Integration Overview

Once your smart contracts are written, tested, and deployed to a testnet (like Sepolia or Goerli), you'll build a user-friendly interface for your DApp. This involves:

1.  **Connecting a Wallet**: Using libraries like `ethers.js` or `web3.js` and frameworks like `web3-react` or `wagmi`, allow users to connect their browser-based wallets (e.g., MetaMask) to your DApp.
2.  **Interacting with Contracts**: Use the deployed contract's **ABI (Application Binary Interface)** and address to call its functions. This includes sending transactions (e.g., `deposit`, `borrow`, `repay`) and reading contract state (e.g., `userCollateral`, `getAvailableBorrowLimit`).
3.  **Displaying Data**: Show users their deposited collateral, outstanding loans, current borrow limits, and transaction history.

### 5. Quick Check/Exercise

1.  **Role of Oracles**: What is the primary function of a decentralized oracle in a DeFi lending protocol, and why is it critical for the protocol's security and functionality?
2.  **Collateralization Ratio**: Explain what a "collateralization ratio" means in the context of DeFi lending. If a protocol requires a 150% collateralization ratio, how much collateral (in USD value) must a user provide to borrow $100 worth of assets?
3.  **User Flow**: Outline the high-level steps a user would take, from their perspective, to use the `SimpleLendingPool` DApp to deposit collateral, borrow DAI, and then eventually repay their loan and withdraw their collateral. Assume they already have WETH and DAI in their wallet and have approved the `SimpleLendingPool` contract to spend their tokens.