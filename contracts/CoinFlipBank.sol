// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CoinFlipBank {
    // Events
    event BetPlaced(address indexed player, uint256 amount, bool isHeads);
    event BetResult(address indexed player, uint256 amount, bool won, uint256 payout);
    event Deposit(address indexed player, uint256 amount);
    event Withdrawal(address indexed player, uint256 amount);

    // Mapping to store player balances
    mapping(address => uint256) public balances;
    
    // House edge percentage (1% = 100)
    uint256 public houseEdge = 200; // 2%
    
    // Minimum and maximum bet amounts
    uint256 public minBet = 0.01 ether;
    uint256 public maxBet = 1 ether;
    
    // Owner address
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Deposit funds
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    // Withdraw funds
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawal(msg.sender, amount);
    }
    
    // Place a bet
    function placeBet(bool isHeads) public payable {
        uint256 betAmount = msg.value;
        require(betAmount >= minBet, "Bet amount too small");
        require(betAmount <= maxBet, "Bet amount too large");
        
        emit BetPlaced(msg.sender, betAmount, isHeads);
        
        // Generate random result (note: this is not secure for production)
        bool result = generateRandomBool();
        
        if (result == isHeads) {
            // Player wins
            uint256 winnings = calculateWinnings(betAmount);
            balances[msg.sender] += winnings;
            emit BetResult(msg.sender, betAmount, true, winnings);
        } else {
            // Player loses
            emit BetResult(msg.sender, betAmount, false, 0);
        }
    }
    
    // Calculate winnings after house edge
    function calculateWinnings(uint256 amount) public view returns (uint256) {
        uint256 houseAmount = (amount * houseEdge) / 10000;
        return (amount * 2) - houseAmount;
    }
    
    // Generate random boolean (not secure for production)
    function generateRandomBool() private view returns (bool) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 2;
        return randomNumber == 1;
    }
    
    // Get player balance
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
    // Owner functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Update house edge
    function setHouseEdge(uint256 _houseEdge) public onlyOwner {
        require(_houseEdge <= 1000, "House edge too high"); // Max 10%
        houseEdge = _houseEdge;
    }
    
    // Update bet limits
    function setBetLimits(uint256 _minBet, uint256 _maxBet) public onlyOwner {
        require(_minBet < _maxBet, "Min bet must be less than max bet");
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    // Withdraw house profits
    function withdrawHouseProfits() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        (bool success, ) = payable(owner).call{value: contractBalance}("");
        require(success, "Withdrawal failed");
    }
}