# Inheritance, Interfaces, & Libraries in Solidity: Study Guide

This guide explores essential Solidity concepts for achieving code reusability, modularity, and structured contract design: Inheritance, Interfaces, Abstract Contracts, and Libraries.

## 1. Inheritance

Inheritance allows a contract to inherit properties and behaviors (state variables and functions) from another contract. This promotes code reuse and helps in building complex contract hierarchies.

*   **Parent/Base Contract:** The contract being inherited from.
*   **Child/Derived Contract:** The contract that inherits from another.
*   **Syntax:** Use the `is` keyword. Example: `contract Child is Parent { ... }`
*   **`virtual` and `override`:**
    *   `virtual`: Marks a function in the parent contract as able to be overridden by child contracts.
    *   `override`: Marks a function in the child contract as overriding a parent function. If multiple parents have the same function, specify all parents (e.g., `override(ParentA, ParentB)`).
*   **`super`:** Used to call a function of the immediate parent contract within an overridden function in the child contract.
*   **Constructor Arguments:** Child contracts must provide arguments to the parent's constructor if the parent constructor requires them. This can be done directly in the child's declaration (e.g., `contract Child is Parent(arg1, arg2)`) or by explicitly calling `Parent.constructor(arg1, arg2)` within the child's constructor.

**Code Example (Inheritance):**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Animal {
    string public name;

    constructor(string memory _name) {
        name = _name;
    }

    function makeSound() public virtual pure returns (string memory) {
        return "Generic animal sound";
    }

    function getName() public view returns (string memory) {
        return name;
    }
}

contract Dog is Animal {
    constructor(string memory _name) Animal(_name) {}

    function makeSound() public pure override returns (string memory) {
        return "Woof!";
    }

    function greet() public view returns (string memory) {
        return string(abi.encodePacked("Hello, I am ", name, " and I say ", makeSound()));
    }
}
```

## 2. Interfaces (EIP-165)

Interfaces are like blueprints for contracts. They define functions without implementing them, allowing contracts to agree on a common set of external functions they expose. They are crucial for interacting with known contracts and achieving polymorphism.

*   **Syntax:** Use the `interface` keyword. Example: `interface IERC20 { ... }`
*   **Characteristics:**
    *   Cannot have state variables.
    *   Cannot have a constructor.
    *   All functions must be `external` (or `public`, but `external` is preferred for interfaces).
    *   Functions cannot have implementations (no function bodies).
    *   A contract can `implement` an interface, meaning it provides implementations for all functions defined in the interface.
*   **Use Cases:** Defining standard contract behaviors (like ERC-20, ERC-721), interacting with other contracts whose code isn't available at compile time.

**Code Example (Interface):**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBasicToken {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MyToken is IBasicToken {
    string private _name = "MyToken";
    string private _symbol = "MTK";
    uint256 private _totalSupply = 1000;
    mapping(address => uint256) private _balances;

    constructor() {
        _balances[msg.sender] = _totalSupply;
    }

    function name() external view override returns (string memory) { return _name; }
    function symbol() external view override returns (string memory) { return _symbol; }
    function totalSupply() external view override returns (uint256) { return _totalSupply; }
    function balanceOf(address account) external view override returns (uint256) { return _balances[account]; }
    
    function transfer(address recipient, uint256 amount) external override returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        return true;
    }
}
```

## 3. Abstract Contracts

Abstract contracts are contracts that cannot be directly deployed because they have at least one unimplemented function. They combine aspects of both regular contracts and interfaces.

*   **Syntax:** Use the `abstract contract` keyword. Example: `abstract contract PaymentProcessor { ... }`
*   **Characteristics:**
    *   Can have state variables and implemented functions.
    *   Can have a constructor.
    *   Can have `virtual` functions and `abstract` functions.
    *   `abstract` functions: Declared but not implemented within the abstract contract. Child contracts must `override` and implement these.
    *   Cannot be deployed directly; only concrete (non-abstract) contracts that inherit from them and implement all abstract functions can be deployed.
*   **Use Cases:** Providing partial implementations for common functionality while leaving specific details to child contracts (e.g., a base contract for different types of payment systems).

**Code Example (Abstract Contract):**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract PaymentProcessor {
    address public owner;
    uint256 public processingFee;

    constructor(uint256 _fee) {
        owner = msg.sender;
        processingFee = _fee;
    }

    function getProcessingFee() public view returns (uint256) {
        return processingFee;
    }

    // Abstract function - must be implemented by derived contracts
    function processPayment(address receiver, uint256 amount) public virtual returns (bool);

    // Can have implemented functions too
    function withdrawFunds(uint256 amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(msg.sender).transfer(amount);
    }
}

contract EthPaymentProcessor is PaymentProcessor(10) {
    constructor() {}

    // Implement the abstract function from the base contract
    function processPayment(address receiver, uint256 amount) public override returns (bool) {
        require(msg.value >= amount + processingFee, "Insufficient funds for payment and fee");
        
        payable(receiver).transfer(amount);
        // Send processing fee to owner (or another designated address)
        payable(owner).transfer(processingFee);
        
        return true;
    }
}
```

## 4. Libraries

Libraries in Solidity are stateless, reusable code blocks. They are deployed once at a specific address and their functions are called using `DELEGATECALL` (for internal calls, modifying the calling contract's state) or `CALL` (for external calls, library's own state, which is none).

*   **Syntax:** Use the `library` keyword. Example: `library MathLib { ... }`
*   **Characteristics:**
    *   Cannot have state variables (except `constant` ones).
    *   Cannot inherit or be inherited.
    *   Cannot receive Ether.
    *   All functions are `internal` by default. To be callable by other contracts, they must be `public` or `external`.
    *   When used with `using <LibraryName> for <Type>;`, library functions can be called like methods of the `Type` (e.g., `myUint.add(5)`).
*   **Use Cases:** Implementing complex mathematical operations, string manipulations, or any pure/view logic that can be shared across multiple contracts without duplicating code and bytecode.

**Code Example (Library):**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library MathOperations {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "Subtraction underflow");
        return a - b;
    }
}

contract Calculator {
    using MathOperations for uint256; // Now uint256 can use MathOperations functions

    uint256 public result;

    function performAddition(uint256 _a, uint256 _b) public {
        result = _a.add(_b); // Calling library function as if it's a method of uint256
    }

    function performSubtraction(uint256 _a, uint256 _b) public {
        result = _a.subtract(_b);
    }
}
```

## Checklist/Exercise:

1.  **Identify the Best Tool:** You need to define a standard for how various token contracts should interact with a decentralized exchange. Which Solidity construct (Inheritance, Interface, Abstract Contract, Library) is most suitable for defining this standard, ensuring all conforming tokens expose the same essential functions without forcing implementation details?
2.  **Refactor for Reusability:** You have several smart contracts that all perform a complex string manipulation task (e.g., parsing a URL). Instead of copying the code into each contract, how would you refactor this logic into a single, deployable unit that can be easily used by all your contracts, ensuring no state is stored in this reusable unit?
3.  **Design a Base Contract:** You're building a series of crowdfunding contracts. All contracts need common features like `owner` management, `pause` functionality, and event logging, but the specific logic for `fundGoalMet()` will differ for each crowdfunding campaign type. How would you design a base contract to encapsulate the common features while allowing derived contracts to define `fundGoalMet()`? Which keywords would you use for `fundGoalMet()` in the base contract and its derived contracts?
