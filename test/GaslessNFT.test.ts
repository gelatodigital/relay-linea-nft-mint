import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { deployments, ethers } from "hardhat";
import { GaslessNFT } from "../typechain";
import { NATIVE_TOKEN } from "../src/constants";
import { callWithSyncFee } from "../src/__mock__/relay-sdk";
import { expect } from "chai";

describe("GaslessNFT", () => {
  let nft: GaslessNFT;

  before(async () => {
    await deployments.fixture();

    const { address } = await deployments.get("GaslessNFT");
    nft = (await ethers.getContractAt("GaslessNFT", address)) as GaslessNFT;
    setBalance(address, ethers.utils.parseEther("1"));
  });

  it("mint", async () => {
    const [deployer] = await ethers.getSigners();
    const chainId = await deployer.getChainId();

    const { data } = await nft.populateTransaction.mint(deployer.address);
    if (!data) throw new Error("Invalid transaction");

    const request: CallWithSyncFeeRequest = {
      target: nft.address,
      data: data,
      feeToken: NATIVE_TOKEN,
      chainId: chainId,
      isRelayContext: true,
    };

    await expect(callWithSyncFee(request)).to.emit(nft, "Transfer");
  });
});
