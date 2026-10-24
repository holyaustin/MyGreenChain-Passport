// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductPassport
 * @dev NFT-based digital product passports with sustainability tracking
 */
contract ProductPassport is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct ProductData {
        string productName;
        string manufacturer;
        uint256 carbonFootprint; // in grams of CO2
        uint256 productionDate;
        uint256 sustainabilityScore; // 0-100
        string materialComposition;
        string originCountry;
        bool isRecycled;
        uint256 recycledDate;
        address currentOwner;
    }

    struct LifecycleEvent {
        string eventType; // "production", "transport", "sale", "recycling"
        uint256 timestamp;
        string location;
        uint256 additionalCO2; // CO2 added during this event
        string description;
    }

    // Mapping from token ID to product data
    mapping(uint256 => ProductData) public products;

    // Mapping from token ID to lifecycle events
    mapping(uint256 => LifecycleEvent[]) public lifecycleEvents;

    // Mapping from manufacturer address to authorized status
    mapping(address => bool) public authorizedManufacturers;

    // Events
    event ProductRegistered(
        uint256 indexed tokenId,
        string productName,
        address indexed manufacturer,
        uint256 sustainabilityScore
    );

    event LifecycleEventAdded(
        uint256 indexed tokenId,
        string eventType,
        uint256 timestamp
    );

    event ProductRecycled(
        uint256 indexed tokenId,
        uint256 timestamp
    );

    event ManufacturerAuthorized(address indexed manufacturer);
    event ManufacturerRevoked(address indexed manufacturer);

    constructor() ERC721("MyGreenChain Passport", "MGCP") Ownable(msg.sender) {}

    /**
     * @dev Authorize a manufacturer to create product passports
     */
    function authorizeManufacturer(address manufacturer) external onlyOwner {
        authorizedManufacturers[manufacturer] = true;
        emit ManufacturerAuthorized(manufacturer);
    }

    /**
     * @dev Revoke manufacturer authorization
     */
    function revokeManufacturer(address manufacturer) external onlyOwner {
        authorizedManufacturers[manufacturer] = false;
        emit ManufacturerRevoked(manufacturer);
    }

    /**
     * @dev Register a new product and mint NFT passport
     */
    function registerProduct(
        string memory productName,
        string memory manufacturer,
        uint256 carbonFootprint,
        uint256 sustainabilityScore,
        string memory materialComposition,
        string memory originCountry,
        string memory _tokenURI
    ) external returns (uint256) {
        require(
            authorizedManufacturers[msg.sender] || msg.sender == owner(),
            "Not authorized to register products"
        );
        require(sustainabilityScore <= 100, "Sustainability score must be 0-100");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        products[newTokenId] = ProductData({
            productName: productName,
            manufacturer: manufacturer,
            carbonFootprint: carbonFootprint,
            productionDate: block.timestamp,
            sustainabilityScore: sustainabilityScore,
            materialComposition: materialComposition,
            originCountry: originCountry,
            isRecycled: false,
            recycledDate: 0,
            currentOwner: msg.sender
        });

        // Add initial production event
        lifecycleEvents[newTokenId].push(LifecycleEvent({
            eventType: "production",
            timestamp: block.timestamp,
            location: originCountry,
            additionalCO2: carbonFootprint,
            description: "Product manufactured"
        }));

        emit ProductRegistered(newTokenId, productName, msg.sender, sustainabilityScore);

        return newTokenId;
    }

    /**
     * @dev Add a lifecycle event to a product
     */
    function addLifecycleEvent(
        uint256 tokenId,
        string memory eventType,
        string memory location,
        uint256 additionalCO2,
        string memory description
    ) external {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(
            ownerOf(tokenId) == msg.sender || authorizedManufacturers[msg.sender],
            "Not authorized to add events"
        );

        lifecycleEvents[tokenId].push(LifecycleEvent({
            eventType: eventType,
            timestamp: block.timestamp,
            location: location,
            additionalCO2: additionalCO2,
            description: description
        }));

        // Update total carbon footprint
        products[tokenId].carbonFootprint += additionalCO2;

        emit LifecycleEventAdded(tokenId, eventType, block.timestamp);
    }

    /**
     * @dev Mark a product as recycled
     */
    function recycleProduct(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only owner can recycle");
        require(!products[tokenId].isRecycled, "Already recycled");

        products[tokenId].isRecycled = true;
        products[tokenId].recycledDate = block.timestamp;

        lifecycleEvents[tokenId].push(LifecycleEvent({
            eventType: "recycling",
            timestamp: block.timestamp,
            location: "",
            additionalCO2: 0,
            description: "Product recycled"
        }));

        emit ProductRecycled(tokenId, block.timestamp);
    }

    /**
     * @dev Get product data
     */
    function getProduct(uint256 tokenId) external view returns (ProductData memory) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        return products[tokenId];
    }

    /**
     * @dev Get all lifecycle events for a product
     */
    function getLifecycleEvents(uint256 tokenId) external view returns (LifecycleEvent[] memory) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        return lifecycleEvents[tokenId];
    }

    /**
     * @dev Get lifecycle event count
     */
    function getLifecycleEventCount(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        return lifecycleEvents[tokenId].length;
    }

    /**
     * @dev Get total number of products
     */
    function getTotalProducts() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Override transfer to update current owner
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        if (to != address(0)) {
            products[tokenId].currentOwner = to;
        }

        return from;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
