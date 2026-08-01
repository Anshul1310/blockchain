// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlindHireEscrow
 * @notice Production-ready decentralized freelancing marketplace escrow smart contract.
 * @dev Stores only IPFS CID references, milestone escrows, deposit/release/refund states,
 *      and trust scores. Does NOT store raw text, files, images, or PII on-chain.
 */
contract BlindHireEscrow is ReentrancyGuard, Ownable {

    enum ProjectStatus { Open, Assigned, InProgress, Disputed, Completed, Cancelled }

    struct Milestone {
        uint256 amountWei;
        bool isCompleted;
        bool isPaid;
        string deliverableCID;
    }

    struct Project {
        uint256 id;
        address client;
        address freelancer;
        string projectCID;
        uint256 totalBudgetWei;
        uint256 deadlineTimestamp;
        ProjectStatus status;
        uint256 createdAt;
        uint256 milestoneCount;
    }

    struct UserReputation {
        uint256 completedProjectsCount;
        uint256 totalRatingSum;
        uint256 ratingsCount;
        uint256 disputesWonCount;
        uint256 disputesLostCount;
        string latestProfileCID;
    }

    // Storage Mappings
    uint256 public projectCount;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public projectMilestones;
    mapping(address => UserReputation) public userReputations;
    mapping(uint256 => string) public projectReviewCIDs;

    // Events
    event ProfileCIDRegistered(address indexed user, string profileCID);
    event ProjectCreated(uint256 indexed projectId, address indexed client, string projectCID, uint256 totalBudgetWei, uint256 deadlineTimestamp);
    event FreelancerAccepted(uint256 indexed projectId, address indexed freelancer);
    event DeliverableSubmitted(uint256 indexed projectId, uint256 indexed milestoneIndex, string deliverableCID);
    event MilestonePaid(uint256 indexed projectId, uint256 indexed milestoneIndex, address indexed freelancer, uint256 amountWei);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectCancelled(uint256 indexed projectId, address indexed client, uint256 refundAmountWei);
    event DisputeOpened(uint256 indexed projectId, address indexed initiator);
    event DisputeResolved(uint256 indexed projectId, uint256 releasedToFreelancerWei, uint256 refundedToClientWei);
    event ReviewSubmitted(uint256 indexed projectId, address indexed reviewer, address indexed targetUser, string reviewCID, uint8 rating);

    constructor() Ownable(msg.sender) {}

    // =============================================================
    // PROFILE REGISTRATION
    // =============================================================

    /**
     * @notice Register or update a user's latest profile CID reference.
     */
    function registerProfileCID(string calldata profileCID) external {
        require(bytes(profileCID).length > 0, "Profile CID cannot be empty");
        userReputations[msg.sender].latestProfileCID = profileCID;
        emit ProfileCIDRegistered(msg.sender, profileCID);
    }

    // =============================================================
    // PROJECT CREATION & ESCROW DEPOSIT
    // =============================================================

    /**
     * @notice Client creates a project and deposits full ETH budget into contract escrow.
     */
    function createProject(
        string calldata projectCID,
        uint256 deadlineDays,
        uint256[] calldata milestoneAmountsWei
    ) external payable nonReentrant returns (uint256) {
        require(bytes(projectCID).length > 0, "Project CID required");
        require(deadlineDays > 0, "Deadline must be greater than 0");
        require(milestoneAmountsWei.length > 0, "At least one milestone required");

        uint256 totalBudgetCalculated = 0;
        for (uint256 i = 0; i < milestoneAmountsWei.length; i++) {
            require(milestoneAmountsWei[i] > 0, "Milestone amount must be > 0");
            totalBudgetCalculated += milestoneAmountsWei[i];
        }

        require(msg.value == totalBudgetCalculated, "ETH deposit must match total milestone budget sum");

        projectCount++;
        uint256 newProjectId = projectCount;

        projects[newProjectId] = Project({
            id: newProjectId,
            client: msg.sender,
            freelancer: address(0),
            projectCID: projectCID,
            totalBudgetWei: msg.value,
            deadlineTimestamp: block.timestamp + (deadlineDays * 1 days),
            status: ProjectStatus.Open,
            createdAt: block.timestamp,
            milestoneCount: milestoneAmountsWei.length
        });

        for (uint256 i = 0; i < milestoneAmountsWei.length; i++) {
            projectMilestones[newProjectId][i] = Milestone({
                amountWei: milestoneAmountsWei[i],
                isCompleted: false,
                isPaid: false,
                deliverableCID: ""
            });
        }

        emit ProjectCreated(newProjectId, msg.sender, projectCID, msg.value, block.timestamp + (deadlineDays * 1 days));
        return newProjectId;
    }

    /**
     * @notice Client accepts a freelancer for a project.
     */
    function acceptFreelancer(uint256 projectId, address freelancer) external {
        Project storage proj = projects[projectId];
        require(msg.sender == proj.client, "Only client can accept freelancer");
        require(proj.status == ProjectStatus.Open, "Project is not open for assignment");
        require(freelancer != address(0) && freelancer != proj.client, "Invalid freelancer address");

        proj.freelancer = freelancer;
        proj.status = ProjectStatus.InProgress;

        emit FreelancerAccepted(projectId, freelancer);
    }

    // =============================================================
    // DELIVERABLE & MILESTONE PAYMENTS
    // =============================================================

    /**
     * @notice Freelancer uploads deliverable IPFS CID for a specific milestone.
     */
    function uploadDeliverableCID(uint256 projectId, uint256 milestoneIndex, string calldata deliverableCID) external {
        Project storage proj = projects[projectId];
        require(msg.sender == proj.freelancer, "Only assigned freelancer can upload deliverable");
        require(proj.status == ProjectStatus.InProgress, "Project not in progress");
        require(milestoneIndex < proj.milestoneCount, "Invalid milestone index");
        require(bytes(deliverableCID).length > 0, "Deliverable CID cannot be empty");

        Milestone storage m = projectMilestones[projectId][milestoneIndex];
        require(!m.isPaid, "Milestone already paid");

        m.deliverableCID = deliverableCID;
        m.isCompleted = true;

        emit DeliverableSubmitted(projectId, milestoneIndex, deliverableCID);
    }

    /**
     * @notice Client approves and releases payment for a completed milestone.
     */
    function releaseMilestonePayment(uint256 projectId, uint256 milestoneIndex) external nonReentrant {
        Project storage proj = projects[projectId];
        require(msg.sender == proj.client, "Only client can release payment");
        require(proj.status == ProjectStatus.InProgress, "Project not in progress");
        require(milestoneIndex < proj.milestoneCount, "Invalid milestone index");

        Milestone storage m = projectMilestones[projectId][milestoneIndex];
        require(!m.isPaid, "Milestone already paid");
        require(m.isCompleted, "Milestone deliverable not submitted");

        // Checks-Effects-Interactions Pattern
        m.isPaid = true;
        uint256 payoutWei = m.amountWei;

        // Check if all milestones are completed
        bool allPaid = true;
        for (uint256 i = 0; i < proj.milestoneCount; i++) {
            if (!projectMilestones[projectId][i].isPaid) {
                allPaid = false;
                break;
            }
        }

        if (allPaid) {
            proj.status = ProjectStatus.Completed;
            userReputations[proj.freelancer].completedProjectsCount++;
            userReputations[proj.client].completedProjectsCount++;
            emit ProjectCompleted(projectId);
        }

        (bool success, ) = payable(proj.freelancer).call{value: payoutWei}("");
        require(success, "ETH transfer to freelancer failed");

        emit MilestonePaid(projectId, milestoneIndex, proj.freelancer, payoutWei);
    }

    // =============================================================
    // CANCELLATION & DISPUTE RESOLUTION
    // =============================================================

    /**
     * @notice Cancel project if open and no freelancer assigned yet. Refunds full deposit to client.
     */
    function cancelProject(uint256 projectId) external nonReentrant {
        Project storage proj = projects[projectId];
        require(msg.sender == proj.client, "Only client can cancel project");
        require(proj.status == ProjectStatus.Open, "Can only cancel unassigned open projects");

        proj.status = ProjectStatus.Cancelled;
        uint256 refundAmount = proj.totalBudgetWei;

        (bool success, ) = payable(proj.client).call{value: refundAmount}("");
        require(success, "ETH refund to client failed");

        emit ProjectCancelled(projectId, proj.client, refundAmount);
    }

    /**
     * @notice Either client or freelancer can open a dispute.
     */
    function openDispute(uint256 projectId) external {
        Project storage proj = projects[projectId];
        require(msg.sender == proj.client || msg.sender == proj.freelancer, "Only participating client or freelancer can dispute");
        require(proj.status == ProjectStatus.InProgress, "Can only dispute active projects");

        proj.status = ProjectStatus.Disputed;
        emit DisputeOpened(projectId, msg.sender);
    }

    /**
     * @notice Contract Owner (Arbitrator / AI Governance) resolves dispute by partitioning remaining escrow funds.
     */
    function resolveDispute(
        uint256 projectId,
        uint256 releaseToFreelancerWei,
        uint256 refundToClientWei
    ) external onlyOwner nonReentrant {
        Project storage proj = projects[projectId];
        require(proj.status == ProjectStatus.Disputed, "Project is not in disputed state");

        // Calculate unpaid balance remaining in escrow
        uint256 remainingEscrowWei = 0;
        for (uint256 i = 0; i < proj.milestoneCount; i++) {
            if (!projectMilestones[projectId][i].isPaid) {
                remainingEscrowWei += projectMilestones[projectId][i].amountWei;
            }
        }

        require(releaseToFreelancerWei + refundToClientWei <= remainingEscrowWei, "Resolution total exceeds remaining escrow");

        proj.status = ProjectStatus.Completed;

        // Execute transfers using Checks-Effects-Interactions
        if (releaseToFreelancerWei > 0) {
            (bool successF, ) = payable(proj.freelancer).call{value: releaseToFreelancerWei}("");
            require(successF, "Freelancer dispute payout failed");
        }

        if (refundToClientWei > 0) {
            (bool successC, ) = payable(proj.client).call{value: refundToClientWei}("");
            require(successC, "Client dispute refund failed");
        }

        emit DisputeResolved(projectId, releaseToFreelancerWei, refundToClientWei);
    }

    // =============================================================
    // REPUTATION & REVIEWS
    // =============================================================

    /**
     * @notice Submit a review CID and score (1 to 5) for a completed project.
     */
    function submitReview(
        uint256 projectId,
        address targetUser,
        string calldata reviewCID,
        uint8 ratingScore
    ) external {
        Project storage proj = projects[projectId];
        require(proj.status == ProjectStatus.Completed, "Project must be completed to leave review");
        require(msg.sender == proj.client || msg.sender == proj.freelancer, "Only client or freelancer can leave review");
        require(ratingScore >= 1 && ratingScore <= 5, "Rating score must be between 1 and 5");
        require(bytes(reviewCID).length > 0, "Review CID required");

        userReputations[targetUser].totalRatingSum += ratingScore;
        userReputations[targetUser].ratingsCount++;
        projectReviewCIDs[projectId] = reviewCID;

        emit ReviewSubmitted(projectId, msg.sender, targetUser, reviewCID, ratingScore);
    }

    // Fallback & Receive
    receive() external payable {
        revert("Direct ETH deposits not accepted. Use createProject()");
    }
}
