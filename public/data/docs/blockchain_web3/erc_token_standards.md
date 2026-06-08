# ERC Token Standards: A Deep Dive

## Introduction to ERC Token Standards

Ethereum Request for Comments (ERC) are application-level standards within the Ethereum ecosystem. They define common rules and interfaces for smart contracts, ensuring interoperability between different contracts and applications. Token standards, in particular, specify how tokens behave, how they can be transferred, and how their ownership is managed. This standardization is crucial for the thriving dApp ecosystem, enabling wallets, exchanges, and other protocols to interact seamlessly with various tokens.

We will explore the most prominent ERC token standards: ERC-20, ERC-721, ERC-1155, and the newer ERC-4626.

## 1. ERC-20: Fungible Tokens

**Description:** ERC-20 is the most widely adopted token standard, defining a common set of rules for fungible tokens on the Ethereum blockchain. "Fungible" means that each unit of a token is identical and interchangeable with any other unit of the same token (e.g., one ETH is equivalent to another ETH).

**Core Concepts:**
- **Fixed Supply:** Tokens typically have a predefined maximum supply, though some can be inflationary or deflationary.
- **Divisibility:** Tokens can be divided into smaller units (e.g., 18 decimal places for Ether).

**Key Interface Functions:**

| Function          | Description                                                                 |
| :---------------- | :-------------------------------------------------------------------------- |
| `totalSupply()`   | Returns the total number of tokens in existence.                            |
| `balanceOf(address account)` | Returns the token balance of `account`.                                 |
| `transfer(address recipient, uint256 amount)` | Transfers `amount` tokens from the caller to `recipient`.   |
| `approve(address spender, uint256 amount)` | Allows `spender` to withdraw multiple times from your account, up to `amount`. |
| `allowance(address owner, address spender)` | Returns the amount that `spender` is allowed to withdraw from `owner`. |
| `transferFrom(address sender, address recipient, uint256 amount)` | Transfers `amount` tokens from `sender` to `recipient`, usually on behalf of `sender` (after `approve`). |

**Use Cases:**
- **Cryptocurrencies:** Stablecoins (USDC, USDT), utility tokens (LINK, UNI), governance tokens (COMP, AAVE).
- **In-game currency:** For games requiring a single, interchangeable currency.

**Simple Code Example (ERC-20 `transfer` function logic):**

```solidity
pragma solidity ^0.8.0;

// Simplified example, actual ERC-20 includes more features and events
contract MyToken {
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;

    constructor(uint256 initialSupply) {
        _totalSupply = initialSupply;
        _balances[msg.sender] = initialSupply; // Mints initial supply to deployer
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(_balances[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");

        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        // emit Transfer(msg.sender, recipient, amount); // An actual ERC-20 emits an event
        return true;
    }
}
```

## 2. ERC-721: Non-Fungible Tokens (NFTs)

**Description:** ERC-721 defines a standard for unique, non-fungible tokens. Each ERC-721 token has a unique ID and cannot be directly replaced by another token. This makes them ideal for representing ownership of unique digital or physical assets.

**Core Concepts:**
- **Uniqueness:** Each token is unique and has a distinct `tokenId`.
- **Indivisibility:** Tokens cannot be divided; you own a whole token or none of it.
- **Metadata:** Each token can be linked to metadata (e.g., image, description) via a URI.

**Key Interface Functions:**

| Function          | Description                                                                 |
| :---------------- | :-------------------------------------------------------------------------- |
| `balanceOf(address owner)` | Returns the number of NFTs owned by `owner`.                           |
| `ownerOf(uint256 tokenId)` | Returns the owner of the `tokenId` NFT.                                 |
| `approve(address to, uint256 tokenId)` | Approves `to` to take ownership of the `tokenId`.           |
| `getApproved(uint256 tokenId)` | Returns the approved address for a single NFT.                      |
| `setApprovalForAll(address operator, bool approved)` | Enables or disables an operator to manage all of the caller's NFTs. |
| `isApprovedForAll(address owner, address operator)` | Returns if `operator` is approved to manage all of `owner`'s NFTs. |
| `transferFrom(address from, address to, uint256 tokenId)` | Transfers ownership of `tokenId` from `from` to `to`. Requires approval. |
| `safeTransferFrom(address from, address to, uint256 tokenId, bytes data)` | Same as `transferFrom`, but includes checks to prevent transfers to contracts that cannot handle NFTs. |

**Use Cases:**
- **Digital Art & Collectibles:** CryptoPunks, Bored Ape Yacht Club.
- **Gaming:** Unique in-game items, characters.
- **Real Estate:** Representing fractional or full ownership of properties.
- **Identity:** Decentralized IDs.

**Simple Code Example (ERC-721 `ownerOf` function logic):**

```solidity
pragma solidity ^0.8.0;

// Simplified example, actual ERC-721 includes more features and events
contract MyNFT {
    mapping(uint256 => address) private _tokenOwners;
    mapping(address => uint256) private _balances;
    uint256 private _nextTokenId;

    function mint(address to) public returns (uint256) {
        uint256 newTokenId = _nextTokenId++;
        _tokenOwners[newTokenId] = to;
        _balances[to]++;
        // emit Transfer(address(0), to, newTokenId); // An actual ERC-721 emits an event
        return newTokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(_tokenOwners[tokenId] != address(0), "ERC721: owner query for nonexistent token");
        return _tokenOwners[tokenId];
    }
}
```

## 3. ERC-1155: Multi-token Standard

**Description:** ERC-1155 is a novel token standard that enables a single smart contract to manage multiple types of tokens, which can be either fungible, non-fungible, or semi-fungible. This significantly reduces gas costs and simplifies contract interactions compared to deploying separate contracts for each token type.

**Core Concepts:**
- **Hybrid Fungibility:** A single contract can handle both fungible (e.g., game gold) and non-fungible (e.g., unique sword) tokens.
- **Batch Operations:** Allows for sending multiple token types to multiple recipients in a single transaction, saving gas.
- **IDs for Token Types:** Each token type is identified by a unique `id`.

**Key Interface Functions:**

| Function          | Description                                                                 |
| :---------------- | :-------------------------------------------------------------------------- |
| `balanceOf(address account, uint256 id)` | Returns the balance of token `id` for `account`.           |
| `balanceOfBatch(address[] accounts, uint256[] ids)` | Returns balances for multiple `accounts` and `ids`.       |
| `setApprovalForAll(address operator, bool approved)` | Authorizes or revokes `operator` to manage all tokens of the caller. |
| `isApprovedForAll(address account, address operator)` | Returns if `operator` is approved for `account`.           |
| `safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)` | Transfers `amount` of token `id` from `from` to `to`. Checks for `ERC1155Receiver` compatibility. |
| `safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)` | Transfers multiple `ids` and `amounts` from `from` to `to` in a single call. |

**Use Cases:**
- **Gaming:** Managing various in-game assets (currencies, unique items, consumables) within one contract.
- **Metaverses:** Representing diverse assets like land parcels (NFT), furniture (NFT), and currency (FT).
- **Supply Chain:** Tracking various types of goods (SKUs) in a supply chain system.

**Simple Code Example (ERC-1155 `safeTransferFrom` logic explanation):**

Unlike ERC-20 and ERC-721, `safeTransferFrom` in ERC-1155 takes an `id` parameter to specify which token type is being transferred, and an `amount` for that specific token type. This single function can facilitate both fungible transfers (if `id` refers to a fungible token) and non-fungible transfers (if `id` refers to an NFT, where `amount` would typically be 1).

```solidity
// Example snippet showing the signature and core logic idea
// Full implementation is complex due to batching and receiver hooks
function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
) public virtual {
    require(from == msg.sender || isApprovedForAll(from, msg.sender), "ERC1155: caller is not owner nor approved");
    require(to != address(0), "ERC1155: transfer to the zero address");

    // _balances[id][from] -= amount; // Deduct from sender's balance for specific token id
    // _balances[id][to] += amount;   // Add to recipient's balance for specific token id

    // An actual implementation would include checks for receiver contract hooks (onERC1155Received)
    // and emit TransferSingle event
}
```

## 4. ERC-4626: Tokenized Vaults

**Description:** ERC-4626, or the "Tokenized Vault Standard," provides a standard interface for tokenized vaults. A vault is a contract that holds and manages an underlying asset (e.g., DAI, ETH) and issues a yield-bearing "share" token in return. This standard simplifies integration for aggregators, lenders, and other DeFi protocols by creating a uniform way to interact with different vaults.

**Core Concepts:**
- **Share Tokens:** Users deposit an underlying asset and receive "share" tokens, representing their proportional ownership in the vault.
- **Yield-Bearing:** The value of share tokens increases over time as the vault generates yield from its underlying assets.
- **Standardized Deposits/Withdrawals:** Defines common functions for depositing assets and minting shares, or withdrawing assets and redeeming shares.

**Key Interface Functions:**

| Function          | Description                                                                 |
| :---------------- | :-------------------------------------------------------------------------- |
| `asset()`         | Returns the address of the underlying asset token.                          |
| `totalAssets()`   | Returns the total amount of underlying assets held by the vault.            |
| `convertToShares(uint256 assets)` | Calculates the amount of shares received for a given amount of assets. |
| `convertToAssets(uint256 shares)` | Calculates the amount of assets received for a given amount of shares. |
| `deposit(uint256 assets, address receiver)` | Deposits `assets` into the vault and mints shares to `receiver`. |
| `mint(uint256 shares, address receiver)` | Mints `shares` to `receiver` by depositing the required `assets`. |
| `withdraw(uint256 assets, address receiver, address owner)` | Withdraws `assets` from the vault and burns shares from `owner`, sending assets to `receiver`. |
| `redeem(uint256 shares, address receiver, address owner)` | Redeems `shares` from `owner` and sends the underlying assets to `receiver`. |

**Use Cases:**
- **DeFi Yield Aggregators:** Protocols like Yearn Finance can more easily integrate various yield strategies.
- **Lending Platforms:** Streamlines the interaction with interest-bearing tokens.
- **Treasury Management:** Standardizes how DAOs or protocols can interact with and manage their investment strategies.

**Simple Code Example (Conceptual `deposit` flow):**

The core idea behind ERC-4626's `deposit` function is that a user provides a certain amount of the underlying `asset` (e.g., DAI). The vault calculates how many "share" tokens to mint based on the current asset-to-share ratio and then transfers the `asset` to itself before issuing the `shares` to the `receiver`.

```solidity
// Conceptual simplified flow within an ERC-4626 vault contract
function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    // 1. Calculate shares to mint
    shares = convertToShares(assets); // This depends on the vault's current total assets and total shares

    // 2. Transfer underlying asset from msg.sender to the vault
    // IERC20(asset()).transferFrom(msg.sender, address(this), assets);

    // 3. Mint calculated shares to the receiver
    // _mint(receiver, shares); // Internal function to update receiver's share balance

    // 4. Emit Deposit event
    // emit Deposit(msg.sender, receiver, assets, shares);

    return shares;
}
```

## Comparison and Summary

| Standard   | Token Type         | Key Characteristic                                  | Primary Use Case                                    |
| :--------- | :----------------- | :-------------------------------------------------- | :-------------------------------------------------- |
| **ERC-20** | Fungible           | All tokens are identical and interchangeable.       | Currencies, utility tokens, governance tokens.      |
| **ERC-721**| Non-Fungible       | Each token is unique and has a distinct ID.         | Digital collectibles, unique assets, identity.      |
| **ERC-1155**| Multi-token        | Manages fungible, non-fungible, and semi-fungible.  | Gaming, metaverses, complex asset management.       |
| **ERC-4626**| Share Tokens (Fungible)| Standardizes yield-bearing vault interfaces.        | DeFi yield farming, lending, treasury management.   |

Choosing the right standard depends on the nature of the asset you want to represent and the functionality required.

## Checklist/Exercise to Test Understanding

1.  **Scenario Analysis:** You are building a decentralized game where players can earn an in-game currency (tradable), collect unique character skins (non-tradable between players, but transferable if character is sold), and own unique land plots (tradable). Which ERC token standards would you likely use for each of these assets and why?
2.  **Functionality:** Explain the primary difference between `transfer` (ERC-20) and `transferFrom` (ERC-20 & ERC-721/1155) and in what scenarios each would be used.
3.  **Interoperability:** How does ERC-4626 simplify the process for a DeFi aggregator to list and interact with multiple yield-generating vaults, and what problem does it solve that existed before its introduction?