// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgapayClaims {
    struct Claim {
        uint id;
        uint amount;
        address hospital;
        address patient;
        bool approved;
        bool paid;
        uint timestamp;
    }

    mapping(uint => Claim) public claims;
    event ClaimRecorded(uint id, uint amount, address hospital, address patient, bool approved);
    event ClaimPaid(uint id);

    function recordClaim(uint _id, uint _amount, address _hospital, address _patient, bool _approved) public {
        claims[_id] = Claim(_id, _amount, _hospital, _patient, _approved, false, block.timestamp);
        emit ClaimRecorded(_id, _amount, _hospital, _patient, _approved);
    }

    function markAsPaid(uint _id) public {
        require(claims[_id].approved, "Claim must be approved by hospital first");
        claims[_id].paid = true;
        emit ClaimPaid(_id);
    }

    function getClaim(uint _id) public view returns (Claim memory) {
        return claims[_id];
    }
}
