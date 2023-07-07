import { deployments, ethers } from "hardhat";
import { GaslessNFT } from "../typechain";
import { NATIVE_TOKEN } from "../src/constants";
import { CallWithSyncFeeRequest, GelatoRelay } from "@gelatonetwork/relay-sdk";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const chainId = await deployer.getChainId();

  const { address } = await deployments.get("GaslessNFT");
  const nft = (await ethers.getContractAt("GaslessNFT", address)) as GaslessNFT;

  const { data } = await nft.populateTransaction.mint(deployer.address);
  if (!data) throw new Error("Invalid transaction");

  const request: CallWithSyncFeeRequest = {
    target: nft.address,
    data: data,
    feeToken: NATIVE_TOKEN,
    chainId: chainId,
    isRelayContext: true,
  };

  const relay = new GelatoRelay();
  const { taskId } = await relay.callWithSyncFee(request);

  console.log("https://api.gelato.digital/tasks/status/" + taskId);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
