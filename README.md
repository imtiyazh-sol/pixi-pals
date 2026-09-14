# PixiPals Play to Earn Metaverse Game

This project demonstrates a basic implementation of a development stack for building a decentralized Play-to-Earn (P2E) metaverse game. The workspace ships with a `Solidity` smart contract and an `Angular` frontend dApp that integrates `Three.js` to render the game in a 3D environment and interact with the contract.

## Development

**Browser**
- Install the MetaMask extension to provide a web3 provider.

**Blockchain**
- Start an Ethereum node with `npx hardhat node`.
- Open the Ethereum Remix plugin for Visual Studio Code.
- Compile and deploy `./contracts/pixi-pals.sol` via the Remix plugin.
- Connect MetaMask to the local Hardhat node.
- Import the demo Ethereum wallet addresses into MetaMask.

**dApp**
- Install dependencies with `npm install`.
- Run the project with `npm run start`.
- Open `localhost:4200` in the browser to view the dApp.
