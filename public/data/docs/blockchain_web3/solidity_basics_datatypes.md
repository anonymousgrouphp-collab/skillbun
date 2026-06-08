# Solidity Basics & Data Types

Solidity is a high-level, object-oriented programming language designed for writing smart contracts on blockchain platforms like Ethereum. Mastering its fundamental concepts, particularly data types and control flow, is essential for developing robust and secure decentralized applications.

## 1. Variables

Variables are named storage locations that hold values. In Solidity, variables can be categorized based on where their data is stored:

*   **State Variables:** Permanently stored on the blockchain, forming part of the contract's state. Declared outside of any function.
*   **Local Variables:** Temporarily stored during a function's execution and only accessible within that function. Declared inside a function.

**Syntax:** `[type] [visibility] [name] [= initial_value];`

**Example:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BasicVariables {
    // State variables
    uint public myNumber = 10; // Unsigned integer, public visibility
    string private myName = "Alice"; // String, private visibility

    // Constructor: runs once upon contract deployment
    constructor() {
        // Local variable inside constructor (can also be in other functions)
        uint deployTime = block.timestamp; // Current block timestamp
        // myName = "Bob"; // This would update the state variable
    }

    function getMyNumber() public view returns (uint) {
        // Local variable
        uint localValue = 5; 
        return myNumber + localValue; // Accessing both state and local variable
    }

    function getMyName() public view returns (string memory) {
        return myName;
    }
}
```

## 2. Value Types

Value types store data directly. When a value type is assigned to another variable or passed to a function, an independent copy of the data is made.

### a. Integers (`uint` / `int`)
Used for whole numbers. `uint` denotes unsigned integers (non-negative), while `int` denotes signed integers (can be positive or negative). They come in sizes from 8 bits to 256 bits (e.g., `uint8`, `uint16`, ..., `uint256`). `uint` and `int` are aliases for `uint256` and `int256` respectively.

**Example:**
```solidity
uint public balance = 100 ether; // Unsigned integer (default uint256)
int public temperature = -5;     // Signed integer (default int256)
uint8 public smallNum = 255;     // 8-bit unsigned integer (max value)
```

### b. Address (`address`)
A 20-byte value representing an Ethereum account. There are two types:
*   `address`: Can hold an address and receive Ether, but cannot send Ether itself.
*   `address payable`: Can hold an address, receive Ether, and has functions to send Ether (`transfer`, `send`). An `address` can be explicitly converted to `address payable`.

**Example:**
```solidity
address public owner;
address payable public contractFundsReceiver;

constructor() {
    owner = msg.sender; // The address of the transaction sender (deployer)
    contractFundsReceiver = payable(msg.sender); // Cast to payable address
}

function sendFunds(address payable _to, uint _amount) public payable {
    require(msg.sender == owner, "Only owner can send funds");
    _to.transfer(_amount); // Sending Ether
}
```

### c. Boolean (`bool`)
Represents a truth value: `true` or `false`.

**Example:**
```solidity
bool public isActive = true;
bool public hasPermission = false;
```

### d. Fixed-size Byte Arrays (`bytes1` to `bytes32`)
Fixed-size arrays of bytes. `bytes1` stores 1 byte, `bytes32` stores 32 bytes. Often used for hashes or short identifiers.

**Example:**
```solidity
bytes32 public documentHash = 0x1234567890123456789012345678901234567890123456789012345678901234;
bytes1 public flagByte = 0xab;
```

### e. Enums (`enum`)
User-defined value types that allow you to create a specific, limited set of constant values. Internally, enums are represented as `uint` starting from 0.

**Example:**
```solidity
enum OrderStatus { Pending, Approved, Shipped, Delivered, Cancelled }

OrderStatus public currentOrderState = OrderStatus.Pending;

function updateOrderStatus(OrderStatus _newStatus) public {
    require(uint(_newStatus) > uint(currentOrderState), "Cannot revert status"); // Example validation
    currentOrderState = _newStatus;
}
```

## 3. Reference Types

Reference types store the *location* of the data rather than the data itself. When copied, they create a new reference to the same data. They require an explicit `data location` (`storage`, `memory`, or `calldata`).

### a. Dynamic Byte Array (`bytes`)
Used for raw byte data of arbitrary length. More gas-efficient than `string` for non-UTF-8 encoded data.

**Example:**
```solidity
bytes public dataPayload; // Dynamic array of bytes (storage)

function setData(bytes calldata _inputData) public {
    dataPayload = _inputData; // _inputData is in calldata, dataPayload is in storage
}

function retrieveData() public view returns (bytes memory) {
    return dataPayload; // Returning a copy in memory
}
```

### b. String (`string`)
Used for arbitrary length UTF-8 encoded string data. Stores human-readable text.

**Example:**
```solidity
string public welcomeMessage = "Welcome to SkillBun!";

function updateMessage(string memory _newMessage) public {
    welcomeMessage = _newMessage;
}

function getMessage() public view returns (string memory) {
    return welcomeMessage;
}
```

### c. Arrays
Can be fixed-size or dynamic-size. Elements can be of any Solidity type. `data location` must be specified for local reference types.

*   **Fixed-size:** `uint[5] public fixedArray;`
*   **Dynamic-size:** `uint[] public dynamicArray;`

**Properties & Methods:**
*   `length`: Number of elements (can be modified for dynamic storage arrays).
*   `push()`: Adds an element to the end of a dynamic storage array.
*   `pop()`: Removes the last element from a dynamic storage array.

**Example:**
```solidity
uint[] public scores; // Dynamic array (storage)
uint[3] public fixedScores = [10, 20, 30]; // Fixed-size array (storage)

function addScore(uint _score) public {
    scores.push(_score);
}

function removeLastScore() public {
    scores.pop();
}

function getScore(uint _index) public view returns (uint) {
    require(_index < scores.length, "Index out of bounds");
    return scores[_index];
}
```

### d. Structs (`struct`)
Custom-defined data structures that group multiple variables of different types under a single name. Useful for representing complex objects.

**Example:**
```solidity
struct Item {
    uint id;
    string name;
    uint price;
    bool available;
}

Item public item1 = Item(1, "Laptop", 1200, true); // Initialize a struct
Item[] public allItems; // Dynamic array of structs

function addItem(uint _id, string memory _name, uint _price, bool _available) public {
    allItems.push(Item(_id, _name, _price, _available));
}

function getItem(uint _index) public view returns (uint, string memory, uint, bool) {
    require(_index < allItems.length, "Item does not exist");
    Item storage item = allItems[_index]; // Accessing struct from storage
    return (item.id, item.name, item.price, item.available);
}
```

### e. Mappings (`mapping`)
Key-value storage, similar to hash tables or dictionaries. Keys can be any value type (except `mapping`, `bytes`, `string`, `struct`, or arrays), but values can be any Solidity type, including other mappings or structs. Mappings do not have a `length` and are not iterable directly.

**Syntax:** `mapping([KeyType] => [ValueType]) [visibility] [name];`

**Example:**
```solidity
mapping(address => uint) public userBalances; // Maps address to uint balance
mapping(uint => Item) public itemIdToItem;    // Maps item ID to an Item struct
mapping(address => mapping(uint => bool)) public userBoughtItem; // Nested mapping

function setBalance(uint _amount) public {
    userBalances[msg.sender] = _amount;
}

function getBalance(address _addr) public view returns (uint) {
    return userBalances[_addr]; // Returns 0 if address not found
}

function buyItem(uint _itemId) public payable {
    require(itemIdToItem[_itemId].id != 0, "Item not found"); // Check if item exists
    require(!userBoughtItem[msg.sender][_itemId], "Already bought this item");
    userBoughtItem[msg.sender][_itemId] = true;
    // Logic to handle payment and item transfer
}
```

## 4. Operators

Solidity supports a comprehensive set of operators similar to other C-like languages:

*   **Arithmetic:** `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponentiation).
*   **Comparison:** `==`, `!=`, `<`, `>`, `<=`, `>=`.
*   **Logical:** `&&` (AND), `||` (OR), `!` (NOT).
*   **Bitwise:** `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (left shift), `>>` (right shift).
*   **Assignment:** `=`, `+=`, `-=`, `*=`, `/=`, `%=`.

**Example:**
```solidity
function calculate(uint a, uint b) public pure returns (uint sum, bool greater) {
    sum = a + b;
    greater = (a > b && a != b);
    uint product = a * b;
    uint remainder = a % b;
    return (sum, greater);
}
```

## 5. Control Flow

Control flow statements determine the order in which instructions are executed. It's crucial to consider gas costs when using loops on the blockchain, as excessive iterations can lead to transaction failures due to gas limits.

### a. Conditional Statements (`if`/`else if`/`else`)
Executes different blocks of code based on specified conditions.

**Example:**
```solidity
function checkValue(uint _value) public pure returns (string memory) {
    if (_value > 100) {
        return "Value is high";
    } else if (_value >= 50) {
        return "Value is medium";
    } else {
        return "Value is low";
    }
}
```

### b. Loops (`for`, `while`, `do-while`)
Repeats a block of code multiple times. Use with caution for operations that consume significant gas.

**`for` loop example:**
```solidity
uint[] public numbers = [10, 20, 30, 40, 50];

function sumNumbersInArray() public view returns (uint) {
    uint total = 0;
    for (uint i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }
    return total;
}
```

**`while` loop example (less common due to gas implications for unknown iterations):**
```solidity
function countDown(uint _start) public pure returns (uint) {
    uint counter = _start;
    while (counter > 0) {
        // In a real contract, this would likely interact with state or emit events.
        // A simple decrement is shown for illustration.
        counter--;
    }
    return counter; // Will return 0
}
```

## 6. Understanding Checklist / Exercises

1.  **Identify Data Types:** For each of the following scenarios, determine the most appropriate Solidity data type: a unique identifier for a transaction (a hash), the total supply of a token (can be very large), whether a user is an administrator, and a list of participant addresses in a contest.
2.  **Struct & Mapping Implementation:** Design a Solidity `struct` named `Book` with fields for `title` (string), `author` (string), `yearPublished` (uint), and `isAvailable` (bool). Then, create a `mapping` that associates a unique `uint` `bookId` with an instance of your `Book` struct.
3.  **Control Flow Challenge:** Write a function `findFirstEvenNumber(uint[] memory _numbers)` that takes an array of unsigned integers. Use a `for` loop to iterate through the array and return the first even number it encounters. If no even number is found, return 0.
