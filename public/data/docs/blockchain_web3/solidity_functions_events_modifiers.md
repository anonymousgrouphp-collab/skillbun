# Functions, Modifiers, & Events in Solidity

Welcome to this comprehensive guide on Functions, Modifiers, and Events in Solidity, crucial components for building robust and interactive smart contracts. Understanding these elements is fundamental for any Web3 developer.

## 1. Functions: The Building Blocks of Smart Contracts

Functions are executable units of code that perform specific actions within your smart contract. They define the logic and behavior of your contract.

### 1.1. Function Visibility

Solidity functions have four types of visibility, controlling where and how they can be called:

*   **`public`**:
    *   **Access:** Can be called from externally (by other contracts or transactions) and internally (within the same contract).
    *   **Default:** If no visibility is specified, functions are `public` by default.
*   **`private`**:
    *   **Access:** Can only be called internally within the contract where they are defined. Not visible to derived contracts.
*   **`internal`**:
    *   **Access:** Can be called internally (within the same contract) and by contracts that inherit from it. Not externally callable.
*   **`external`**:
    *   **Access:** Can only be called from externally (by other contracts or transactions). Cannot be called internally using `this.functionName()`. Often used for public entry points to save gas.

```solidity
pragma solidity ^0.8.0;

contract VisibilityExample {
    uint public myPublicVar = 10;
    uint private myPrivateVar = 20;
    uint internal myInternalVar = 30;

    // Public function: Accessible everywhere
    function getPublicVar() public view returns (uint) {
        return myPublicVar;
    }

    // Private function: Only accessible within this contract
    function getPrivateVar() private view returns (uint) {
        return myPrivateVar;
    }

    // Internal function: Accessible within this contract and derived contracts
    function getInternalVar() internal view returns (uint) {
        return myInternalVar;
    }

    // External function: Only accessible from outside the contract
    function getExternalVar() external view returns (uint) {
        return myPublicVar; // Can access internal state
    }

    function callInternalFunctions() public view returns (uint, uint) {
        // Calling private and internal functions internally
        return (getPrivateVar(), getInternalVar());
    }
}
```

### 1.2. State Mutability

State mutability specifies how a function interacts with the blockchain's state.

*   **`pure`**:
    *   **Behavior:** Does not read from or modify the state of the blockchain.
    *   **Use Case:** Ideal for calculations that only use parameters passed into the function.
    *   **Gas:** Very gas efficient as it doesn't incur transaction costs (only execution cost if called externally).
*   **`view`**:
    *   **Behavior:** Reads from the state of the blockchain but does not modify it.
    *   **Use Case:** Retrieving data (e.g., getting a balance, reading a mapping).
    *   **Gas:** Like `pure`, calling externally costs no gas to change state (only execution cost).
*   **`payable`**:
    *   **Behavior:** Can receive Ether (or the native blockchain currency) along with a transaction.
    *   **Use Case:** Implementing payment functionalities, crowdfunding, etc.
    *   **Note:** If a function attempts to receive Ether without being marked `payable`, it will revert.
*   **(Default/Non-payable)**:
    *   **Behavior:** Can modify the state of the blockchain but cannot receive Ether. This is the default behavior if no state mutability is specified.

```solidity
pragma solidity ^0.8.0;

contract MutabilityExample {
    uint public myNumber = 100;

    // Pure function: Does not read or modify state
    function multiply(uint a, uint b) public pure returns (uint) {
        return a * b;
    }

    // View function: Reads state, does not modify
    function getMyNumber() public view returns (uint) {
        return myNumber;
    }

    // Default (non-payable) function: Modifies state, cannot receive Ether
    function setMyNumber(uint _newNumber) public {
        myNumber = _newNumber;
    }

    // Payable function: Can receive Ether
    function deposit() public payable {
        // Logic to handle received Ether, e.g., update balance
        // msg.value contains the amount of Ether sent
        // msg.sender contains the address of the caller
    }
}
```

## 2. Function Modifiers: Reusable Access Control

Function modifiers are reusable pieces of code that can be attached to functions to alter their behavior, typically for access control or to check preconditions.

*   **Purpose:** Centralize common checks (e.g., `onlyOwner`, `requirePositiveValue`) to avoid code duplication and enhance readability.
*   **Syntax:** Defined using the `modifier` keyword. The `_` symbol indicates where the body of the function it's modifying should be inserted.

```solidity
pragma solidity ^0.8.0;

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _; // This is where the function body is inserted
    }

    uint public value;

    // This function can only be called by the contract owner
    function setValue(uint _newValue) public onlyOwner {
        value = _newValue;
    }
}
```

## 3. Custom Errors: Gas-Efficient Reverts

Solidity 0.8.4 introduced custom errors, which provide more descriptive and gas-efficient error messages compared to `require()` or `revert()` with string messages.

*   **Declaration:** Declared using the `error` keyword at the contract or file level.
*   **Usage:** Used with the `revert` statement.
*   **Benefits:** Saves gas compared to string-based `require()` messages because the error data is encoded directly into the revert reason, rather than storing the string on-chain.

```solidity
pragma solidity ^0.8.4;

contract CustomErrorExample {
    address public owner;

    // Declare a custom error
    error Unauthorized(address caller, address expectedOwner);
    error InsufficientBalance(uint256 available, uint256 required);

    constructor() {
        owner = msg.sender;
    }

    function doSomethingOnlyOwner() public {
        if (msg.sender != owner) {
            // Revert with a custom error
            revert Unauthorized(msg.sender, owner);
        }
        // Logic for owner
    }

    function withdraw(uint256 amount) public {
        uint256 balance = 100; // Simulate contract balance
        if (amount > balance) {
            revert InsufficientBalance(balance, amount);
        }
        // Logic for withdrawal
    }
}
```

## 4. Events: Off-chain Communication and Logging

Events are a way for your smart contract to "log" information to the blockchain, making it accessible for external applications (like DApps, block explorers, or off-chain analytics) to listen for and react to.

*   **Purpose:**
    *   **Logging:** Record specific occurrences or data changes on-chain.
    *   **Off-chain communication:** Provide a mechanism for decentralized applications (DApps) to react to contract state changes without constantly polling the blockchain.
*   **Declaration:** Declared using the `event` keyword. Parameters can be `indexed` for easier filtering.
*   **Emission:** Emitted using the `emit` keyword.

```solidity
pragma solidity ^0.8.0;

contract EventExample {
    // Declare an event
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event ValueChanged(address indexed caller, uint256 oldValue, uint256 newValue);

    uint public storedValue;

    function setValue(uint _newValue) public {
        uint _oldValue = storedValue;
        storedValue = _newValue;
        // Emit the event to log the change
        emit ValueChanged(msg.sender, _oldValue, _newValue);
    }

    function sendEther(address payable _to, uint256 _amount) public payable {
        require(msg.value >= _amount, "Insufficient Ether sent");
        _to.transfer(_amount);
        // Emit a Transfer event
        emit Transfer(msg.sender, _to, _amount);
    }
}
```

---

## Quick Checklist/Exercise

1.  **Visibility Challenge:** Explain why you would choose `external` over `public` for a function that is only ever called from outside your contract, considering gas costs.
2.  **Modifier Application:** Write a simple `onlyWhitelisted` modifier that checks if `msg.sender` is present in a `mapping(address => bool) public isWhitelisted;`.
3.  **Event vs. Return:** When would you prefer to use an event to communicate data off-chain rather than just returning a value from a function? Provide an example scenario.