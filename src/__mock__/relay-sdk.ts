import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { ethers } from "hardhat";

import { FEE_COLLECTOR, GELATO_RELAY, NATIVE_TOKEN } from "../constants";

/**
 * Emulates relay behaviour locally
 * https://github.com/gelatodigital/rel-example-unit-tests
 */

export const callWithSyncFee = async (request: CallWithSyncFeeRequest) => {
  if (request.feeToken !== NATIVE_TOKEN)
    throw new Error("Only native token supported");

  const fee = ethers.utils.parseEther("0.01");

  const data = ethers.utils.solidityPack(
    ["bytes", "address", "address", "uint256"],
    [request.data, FEE_COLLECTOR, request.feeToken, fee]
  );

  const relay = await ethers.getImpersonatedSigner(GELATO_RELAY);
  const feeCollector = await ethers.getImpersonatedSigner(FEE_COLLECTOR);

  await setBalance(relay.address, ethers.utils.parseEther("1"));

  const balanceBefore = await feeCollector.getBalance();
  const tx = await relay.sendTransaction({ to: request.target, data });
  const balanceAfter = await feeCollector.getBalance();

  if (balanceAfter.sub(balanceBefore).lt(fee))
    throw new Error("Insufficient relay fee");

  return tx;
};
