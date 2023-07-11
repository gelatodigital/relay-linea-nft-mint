import { deployments, ethers } from "hardhat";
import { GaslessNFT } from "../typechain";
import { NATIVE_TOKEN } from "../src/constants";
import { CallWithERC2771Request, CallWithSyncFeeRequest, GelatoRelay } from "@gelatonetwork/relay-sdk";



const main = async () => {
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";



  // Initialize the wallet.
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const [deployer] = await ethers.getSigners();

  const chainId = await deployer.getChainId();
  const { address } = await deployments.get("GaslessNFT");
  const nft = (await ethers.getContractAt("GaslessNFT", address)) as GaslessNFT;

  const { data } = await nft.populateTransaction.mint();
  if (!data) throw new Error("Invalid transaction");

  const request:  CallWithERC2771Request= {
    target: nft.address,
    data: data,
    chainId: chainId,
    user:deployer.address
  };


  const relay = new GelatoRelay();
  const { taskId } = await relay.sponsoredCallERC2771(request,wallet,"i_7WlEZIpawFdyuavUqESyoNhjd8pO02xU7VcRifqK4_");

  console.log("https://api.gelato.digital/tasks/status/" + taskId);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
