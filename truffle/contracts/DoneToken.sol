// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DoneToken is Ownable {
    IERC20 public projectToken;
    IERC20 public stableCoin;
    uint256 public rateToken;
    uint256 public totalStableCoins;
    bool public fundingActive;
    uint256 public fundingGoal;
    uint256 public fundingDeadline;
    string public nameToken;

    struct Sponsor {
        uint256 stableCoinAmount;
        uint256 tokensReceived;
    }

    mapping(address => Sponsor) public sponsors;

    event FundReceived(address indexed sponsor, uint256 stableCoinAmount, uint256 tokensIssued);
    event FundsWithdrawn(uint256 amount);
    event FundingStatusUpdated(bool status);
    event TokensClaimed(address indexed sponsor, uint256 tokens);
    event FundingGoalUpdated(uint256 newGoal);

    constructor(
        IERC20 _projectToken,
        IERC20 _stableCoin,
        uint256 _rateToken,
        uint256 _fundingGoal,
        uint256 _fundingDeadline,
        string memory _nameToken
    ) Ownable() {
        projectToken = _projectToken;
        stableCoin = _stableCoin;
        rateToken = _rateToken;
        fundingGoal = _fundingGoal;
        fundingDeadline = _fundingDeadline;
        nameToken = _nameToken;
        fundingActive = true;
    }

    modifier isFundingActive() {
        require(fundingActive, "Funding is not active");
        require(block.timestamp <= fundingDeadline, "Funding period has ended");
        _;
    }

    function fundProject(uint256 stablecoinAmount) external isFundingActive {
        require(stablecoinAmount > 0, "Amount must be greater than zero");
        require(rateToken > 0, "Rate must be greater than zero");

        uint256 sponsorBalance = stableCoin.balanceOf(msg.sender);
        require(sponsorBalance >= stablecoinAmount, "Insufficient stablecoin balance");

        uint256 allowance = stableCoin.allowance(msg.sender, address(this));
        require(allowance >= stablecoinAmount, "Insufficient allowance");

        bool transferSuccess = stableCoin.transferFrom(msg.sender, address(this), stablecoinAmount);
        require(transferSuccess, "Transfer failed");

        uint256 tokensToIssue = (stablecoinAmount * 10 ** 18) / rateToken;
        require(tokensToIssue > 0, "Insufficient amount for token issuance");

        totalStableCoins += stablecoinAmount;

        Sponsor storage sponsor = sponsors[msg.sender];
        sponsor.stableCoinAmount += stablecoinAmount;
        sponsor.tokensReceived += tokensToIssue;

        emit FundReceived(msg.sender, stablecoinAmount, tokensToIssue);
    }

    function withdrawFunds() external onlyOwner {
        require(!fundingActive, "Funding is still active");
        uint256 amount = totalStableCoins;
        require(amount > 0, "No funds to withdraw");

        totalStableCoins = 0;
        bool transferSuccess = stableCoin.transfer(owner(), amount);
        require(transferSuccess, "Transfer failed");

        emit FundsWithdrawn(amount);
    }

    function endFunding() external onlyOwner {
        fundingActive = false;
        emit FundingStatusUpdated(fundingActive);
    }

    function calculateTokensToIssue(uint256 stablecoinAmount) public view returns (uint256) {
        return (stablecoinAmount * 10 ** 18) / rateToken;
    }

    function claimTokens() external {
        require(!fundingActive, "Funding is still active");

        Sponsor storage sponsor = sponsors[msg.sender];
        uint256 tokensToClaim = sponsor.tokensReceived;
        require(tokensToClaim > 0, "No tokens to claim");

        sponsor.tokensReceived = 0;

        bool transferSuccess = projectToken.transfer(msg.sender, tokensToClaim);
        require(transferSuccess, "Transfer failed");

        emit TokensClaimed(msg.sender, tokensToClaim);
    }

    function balanceOfStablecoin(address sponsor) external view returns (uint256) {
        return stableCoin.balanceOf(sponsor);
    }

    function balanceOfTokens(address sponsor) external view returns (uint256) {
        return sponsors[sponsor].tokensReceived;
    }

    function updateRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be greater than zero");
        rateToken = newRate;
    }

    function isGoalReached() public view returns (bool) {
        return totalStableCoins >= fundingGoal;
    }

    function getTotalTokensReceived(address sponsor) public view returns (uint256) {
        return sponsors[sponsor].tokensReceived;
    }

    // New function to update the funding goal
    function setFundingGoal(uint256 newGoal) external onlyOwner {
        require(newGoal > 0, "Goal must be greater than zero");
        fundingGoal = newGoal;
        emit FundingGoalUpdated(newGoal);
    }
}
 