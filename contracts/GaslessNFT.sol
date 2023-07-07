// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {
    GelatoRelayContext
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

contract GaslessNFT is ERC721, GelatoRelayContext {
    address public owner;
    uint256 public supply;

    modifier onlyOwner() {
        require(msg.sender == owner, "Briber.onlyOwner");
        _;
    }

    constructor() ERC721("Gasless NFT", "GNFT") {
        owner = msg.sender;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function sweep() external onlyOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "GaslessNFT.sweep: failed");
    }

    function mint(address to) external onlyGelatoRelay {
        _mint(to, supply++);
        _transferRelayFee();
    }
}
