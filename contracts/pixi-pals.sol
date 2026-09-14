//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PixiPals is ERC721, Ownable {

    uint256 private _nextId;

    struct Character {
        uint64 foodLevel;
        uint64 sleepLevel;
        uint64 happyLevel;
        uint32 lastUpdate;
        uint32 xp;
        string name;
    }

    mapping(uint256 => Character) private _characterDetails;

    event PetAdopted(uint256 indexed tokenId, address indexed owner, string name);
    event PetFed(uint256 indexed tokenId, uint32 newXp);
    event PetPlayed(uint256 indexed tokenId, uint32 newXp);
    event PetRested(uint256 indexed tokenId, uint32 newXp);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function adoptPet(string memory petName) external payable {
        uint256 price = 0.001 ether;
        require(msg.value >= price, "Not enough ETH.");
        uint256 tokenId = _nextId;
        uint64 nowTs = uint64(block.timestamp);
        _characterDetails[tokenId] = Character({
            foodLevel: nowTs,
            sleepLevel: nowTs,
            happyLevel: nowTs,
            lastUpdate: uint32(block.timestamp),
            xp: 0,
            name: petName
        });
        _safeMint(msg.sender, tokenId);
        _nextId++;
        emit PetAdopted(tokenId, msg.sender, petName);
    }

    function petStats(uint256 tokenId) external view returns (Character memory) {
        return _characterDetails[tokenId];
    }

    function feed(uint256 tokenId) external payable {
        require(msg.value >= 0.0001 ether, "Not enough ETH.");
        require(msg.sender == ownerOf(tokenId), "Not owner.");
        Character storage c = _characterDetails[tokenId];
        require(block.timestamp >= uint256(c.foodLevel) + 60, "Too soon");
        c.foodLevel = uint64(block.timestamp);
        c.xp += 1;
        c.lastUpdate = uint32(block.timestamp);
        emit PetFed(tokenId, c.xp);
    }

    function play(uint256 tokenId) external payable {
        require(msg.value >= 0.0001 ether, "Not enough ETH.");
        require(msg.sender == ownerOf(tokenId), "Not owner.");
        Character storage c = _characterDetails[tokenId];
        require(block.timestamp >= uint256(c.happyLevel) + 60, "Too soon");
        c.happyLevel = uint64(block.timestamp);
        c.xp += 1;
        c.lastUpdate = uint32(block.timestamp);
        emit PetPlayed(tokenId, c.xp);
    }

    function rest(uint256 tokenId) external payable {
        require(msg.value >= 0.0001 ether, "Not enough ETH.");
        require(msg.sender == ownerOf(tokenId), "Not owner.");
        Character storage c = _characterDetails[tokenId];
        require(block.timestamp >= uint256(c.sleepLevel) + 60, "Too soon");
        c.sleepLevel = uint64(block.timestamp);
        c.xp += 1;
        c.lastUpdate = uint32(block.timestamp);
        emit PetRested(tokenId, c.xp);
    }

    function isAlive(uint256 tokenId) public view returns (bool) {
        Character storage c = _characterDetails[tokenId];
        return c.foodLevel > 0 && c.sleepLevel > 0 && c.happyLevel > 0;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override view {
        if (from != address(0)) {
            require(isAlive(tokenId), "Pet is not alive.");
        }
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
