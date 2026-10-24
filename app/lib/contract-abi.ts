export const PRODUCT_PASSPORT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "manufacturer", "type": "address" }
    ],
    "name": "authorizeManufacturer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "authorizedManufacturers",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "productName", "type": "string" },
      { "internalType": "string", "name": "manufacturer", "type": "string" },
      { "internalType": "uint256", "name": "carbonFootprint", "type": "uint256" },
      { "internalType": "uint256", "name": "sustainabilityScore", "type": "uint256" },
      { "internalType": "string", "name": "materialComposition", "type": "string" },
      { "internalType": "string", "name": "originCountry", "type": "string" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "registerProduct",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "eventType", "type": "string" },
      { "internalType": "string", "name": "location", "type": "string" },
      { "internalType": "uint256", "name": "additionalCO2", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" }
    ],
    "name": "addLifecycleEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "recycleProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getProduct",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "productName", "type": "string" },
          { "internalType": "string", "name": "manufacturer", "type": "string" },
          { "internalType": "uint256", "name": "carbonFootprint", "type": "uint256" },
          { "internalType": "uint256", "name": "productionDate", "type": "uint256" },
          { "internalType": "uint256", "name": "sustainabilityScore", "type": "uint256" },
          { "internalType": "string", "name": "materialComposition", "type": "string" },
          { "internalType": "string", "name": "originCountry", "type": "string" },
          { "internalType": "bool", "name": "isRecycled", "type": "bool" },
          { "internalType": "uint256", "name": "recycledDate", "type": "uint256" },
          { "internalType": "address", "name": "currentOwner", "type": "address" }
        ],
        "internalType": "struct ProductPassport.ProductData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getLifecycleEvents",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "eventType", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "uint256", "name": "additionalCO2", "type": "uint256" },
          { "internalType": "string", "name": "description", "type": "string" }
        ],
        "internalType": "struct ProductPassport.LifecycleEvent[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalProducts",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "ownerOf",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenURI",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "productName", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "manufacturer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "sustainabilityScore", "type": "uint256" }
    ],
    "name": "ProductRegistered",
    "type": "event"
  }
] as const;
