// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title CampusChain - AI-Powered Campus Financial Ecosystem
/// @notice Handles CampusCoin transactions with AI fraud detection integration
contract CampusChain {
    address public admin;
    string public constant TOKEN_NAME = "CampusCoin";
    string public constant TOKEN_SYMBOL = "CPC";

    struct Transaction {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        string category;       // "fee", "canteen", "event", "p2p"
        uint256 timestamp;
        bool flagged;
        bool blocked;
        uint8 fraudScore;      // 0-100, set by oracle/AI
        string flagReason;
    }

    struct Student {
        string name;
        uint256 balance;
        bool isRegistered;
        bool isBlocked;
        uint256 dailySpent;
        uint256 lastSpendDay;
    }

    uint256 public txCounter;
    uint256 public dailyLimit = 500 * 1e18; // 500 CPC daily limit
    uint8 public fraudThreshold = 75;        // auto-block if score >= 75

    mapping(address => Student) public students;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;

    address[] public registeredStudents;
    uint256[] public allTxIds;

    event StudentRegistered(address indexed student, string name, uint256 initialBalance);
    event TransactionCreated(uint256 indexed txId, address from, address to, uint256 amount, string category);
    event FraudFlagged(uint256 indexed txId, uint8 score, string reason);
    event TransactionBlocked(uint256 indexed txId, string reason);
    event FraudScoreUpdated(uint256 indexed txId, uint8 score);
    event DailyLimitUpdated(uint256 newLimit);
    event FraudThresholdUpdated(uint8 newThreshold);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyRegistered() {
        require(students[msg.sender].isRegistered, "Not registered");
        require(!students[msg.sender].isBlocked, "Account blocked");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Register a new student with initial CampusCoin balance
    function registerStudent(address _student, string memory _name, uint256 _initialBalance) external onlyAdmin {
        require(!students[_student].isRegistered, "Already registered");
        students[_student] = Student({
            name: _name,
            balance: _initialBalance,
            isRegistered: true,
            isBlocked: false,
            dailySpent: 0,
            lastSpendDay: block.timestamp / 1 days
        });
        registeredStudents.push(_student);
        emit StudentRegistered(_student, _name, _initialBalance);
    }

    /// @notice Mint CampusCoins to a student (admin only)
    function mintTokens(address _student, uint256 _amount) external onlyAdmin {
        require(students[_student].isRegistered, "Student not registered");
        students[_student].balance += _amount;
    }

    /// @notice Initiate a campus transaction
    function initiateTransaction(
        address _to,
        uint256 _amount,
        string memory _category
    ) external onlyRegistered returns (uint256) {
        require(students[_to].isRegistered, "Recipient not registered");
        require(students[msg.sender].balance >= _amount, "Insufficient balance");

        // Reset daily spend if new day
        uint256 today = block.timestamp / 1 days;
        if (students[msg.sender].lastSpendDay < today) {
            students[msg.sender].dailySpent = 0;
            students[msg.sender].lastSpendDay = today;
        }

        require(students[msg.sender].dailySpent + _amount <= dailyLimit, "Daily limit exceeded");

        txCounter++;
        uint256 txId = txCounter;

        transactions[txId] = Transaction({
            id: txId,
            from: msg.sender,
            to: _to,
            amount: _amount,
            category: _category,
            timestamp: block.timestamp,
            flagged: false,
            blocked: false,
            fraudScore: 0,
            flagReason: ""
        });

        allTxIds.push(txId);
        userTransactions[msg.sender].push(txId);
        userTransactions[_to].push(txId);

        // Deduct balance optimistically; refund if blocked
        students[msg.sender].balance -= _amount;
        students[msg.sender].dailySpent += _amount;
        students[_to].balance += _amount;

        emit TransactionCreated(txId, msg.sender, _to, _amount, _category);
        return txId;
    }

    /// @notice AI Oracle submits fraud score for a transaction
    function submitFraudScore(
        uint256 _txId,
        uint8 _score,
        string memory _reason
    ) external onlyAdmin {
        require(_txId > 0 && _txId <= txCounter, "Invalid txId");
        Transaction storage txn = transactions[_txId];
        require(!txn.blocked, "Already blocked");

        txn.fraudScore = _score;
        emit FraudScoreUpdated(_txId, _score);

        if (_score >= fraudThreshold) {
            txn.flagged = true;
            txn.blocked = true;
            txn.flagReason = _reason;

            // Reverse the transaction
            students[txn.to].balance -= txn.amount;
            students[txn.from].balance += txn.amount;
            students[txn.from].dailySpent -= txn.amount;

            emit FraudFlagged(_txId, _score, _reason);
            emit TransactionBlocked(_txId, _reason);
        }
    }

    /// @notice Admin manually block a transaction
    function blockTransaction(uint256 _txId, string memory _reason) external onlyAdmin {
        Transaction storage txn = transactions[_txId];
        require(!txn.blocked, "Already blocked");

        txn.blocked = true;
        txn.flagged = true;
        txn.flagReason = _reason;

        students[txn.to].balance -= txn.amount;
        students[txn.from].balance += txn.amount;

        emit TransactionBlocked(_txId, _reason);
    }

    /// @notice Block/unblock a student account
    function setStudentBlock(address _student, bool _blocked) external onlyAdmin {
        students[_student].isBlocked = _blocked;
    }

    function updateDailyLimit(uint256 _newLimit) external onlyAdmin {
        dailyLimit = _newLimit;
        emit DailyLimitUpdated(_newLimit);
    }

    function updateFraudThreshold(uint8 _threshold) external onlyAdmin {
        fraudThreshold = _threshold;
        emit FraudThresholdUpdated(_threshold);
    }

    function getTransaction(uint256 _txId) external view returns (Transaction memory) {
        return transactions[_txId];
    }

    function getAllTransactionIds() external view returns (uint256[] memory) {
        return allTxIds;
    }

    function getStudentTransactions(address _student) external view returns (uint256[] memory) {
        return userTransactions[_student];
    }

    function getRegisteredStudents() external view returns (address[] memory) {
        return registeredStudents;
    }
}
