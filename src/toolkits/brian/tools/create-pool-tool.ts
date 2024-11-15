import { BrianTool } from "@/toolkits/brian/tools/tool";
import { BrianSDK } from "@brian-ai/sdk";
import { Account, erc20Abi, Hex, parseUnits } from "viem";
import { z } from "zod";
import { getChainAndClients } from "./utils";
import { Percent, Token } from "@uniswap/sdk-core";
import {
  computePoolAddress,
  FeeAmount,
  MintOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
} from "@uniswap/v3-sdk";
import { UNISWAP_V3_POOL_ABI } from "@/abis/uniswap-v3-pool";
import { NON_FUNGIBLE_POSITION_MANAGER_ABI } from "@/abis/uniswap-v3-position-manager";
import { WETH_ABI } from "@/toolkits/cdp/tools/utils";

const getNonFungiblePositionManagerContractAddress = (
  chainId: number
): Hex | null => {
  if ([1, 10, 137, 8453, 42161].includes(chainId)) {
    return "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  }
  return null;
};

const getFactoryAddress = (chainId: number): Hex | null => {
  if ([1, 10, 137, 8453, 42161].includes(chainId)) {
    return "0x1F98431c8aD98523631AE4a59f267346ea31F984";
  }
  return null;
};

const getWethAddress = (chainId: number): Hex | null => {
  if (chainId === 1) {
    return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  }
  if (chainId === 10) {
    return "0x4200000000000000000000000000000000000006";
  }
  if (chainId === 137) {
    return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
  }
  if (chainId === 8453) {
    return "0x4200000000000000000000000000000000000006";
  }
  if (chainId === 42161) {
    return "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  }
  return null;
};

const createPoolToolSchema = z.object({
  tokenAddress: z.string(),
  tokenAmount: z.number(),
  ethAmount: z.number(),
  chainId: z.number(),
});

export const createCreatePoolTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "create_liquidity_pool_uniswap",
    description:
      "this tools creates a new pool on Uniswap using the given input tokenAddress and ETH.",
    schema: createPoolToolSchema,
    brianSDK,
    account,
    func: async ({ tokenAddress, tokenAmount, ethAmount, chainId }) => {
      try {
        const wethAddress = getWethAddress(chainId);
        if (!wethAddress) {
          return `Weth is not available on chain with id ${chainId}, maybe try with another one?`;
        }
        const { network, walletClient, publicClient } = getChainAndClients(
          account,
          chainId
        );
        const nonFungiblePositionManagerContractAddress =
          getNonFungiblePositionManagerContractAddress(chainId);

        if (!nonFungiblePositionManagerContractAddress) {
          return `Uniswap or Aerodrome is not deployed on chain with id ${chainId}, maybe try with another one?`;
        }

        const [tokenDecimals, tokenAllowance] = await Promise.all([
          publicClient.readContract({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "decimals",
          }),
          publicClient.readContract({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, nonFungiblePositionManagerContractAddress],
          }),
        ]);

        if (
          tokenAllowance < parseUnits(tokenAmount.toString(), tokenDecimals)
        ) {
          const approveTx = await walletClient.writeContract({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "approve",
            args: [
              nonFungiblePositionManagerContractAddress as `0x${string}`,
              parseUnits(tokenAmount.toString(), tokenDecimals),
            ],
          });

          console.log(
            `Approving spending of ${tokenAddress} for ${nonFungiblePositionManagerContractAddress}.`
          );

          await publicClient.waitForTransactionReceipt({ hash: approveTx });

          console.log(
            `Spending of ${tokenAddress} successfully approved for ${nonFungiblePositionManagerContractAddress}.`
          );
        }

        const wrapTx = await walletClient.writeContract({
          address: wethAddress,
          functionName: "deposit",
          abi: WETH_ABI,
          args: [],
          value: parseUnits(ethAmount.toString(), 18),
        });

        console.log(`Wrapping ETH to WETH...`);

        await publicClient.waitForTransactionReceipt({ hash: wrapTx });

        console.log(`${ethAmount} ETH successfully wrapped to WETH.`);

        const wethAllowance = await publicClient.readContract({
          abi: erc20Abi,
          address: wethAddress,
          functionName: "allowance",
          args: [account.address, nonFungiblePositionManagerContractAddress],
        });

        if (wethAllowance < parseUnits(ethAmount.toString(), 18)) {
          const approveWethTx = await walletClient.writeContract({
            abi: erc20Abi,
            address: wethAddress as `0x${string}`,
            functionName: "approve",
            args: [
              nonFungiblePositionManagerContractAddress as `0x${string}`,
              parseUnits(tokenAmount.toString(), tokenDecimals),
            ],
          });

          console.log(
            `Approving spending of ${wethAddress} for ${nonFungiblePositionManagerContractAddress}.`
          );

          await publicClient.waitForTransactionReceipt({ hash: approveWethTx });

          console.log(
            `Spending of ${wethAddress} successfully approved for ${nonFungiblePositionManagerContractAddress}`
          );
        }

        const token1: Token = new Token(chainId, tokenAddress, tokenDecimals);
        const token2: Token = new Token(chainId, wethAddress, 18);
        const poolFee: FeeAmount = FeeAmount.LOW_300;
        const poolFactoryAddress = getFactoryAddress(chainId);

        if (!poolFactoryAddress) {
          return `Uniswap or Aerodrome is not deployed on chain with id ${chainId}, maybe try with another one?`;
        }

        const createPoolTx = await walletClient.writeContract({
          abi: NON_FUNGIBLE_POSITION_MANAGER_ABI,
          address: nonFungiblePositionManagerContractAddress,
          functionName: "createAndInitializePoolIfNecessary",
          args: [
            token1.address as `0x${string}`,
            token2.address as `0x${string}`,
            poolFee,
            BigInt(Math.sqrt(ethAmount / tokenAmount) * 2 ** 96),
          ],
          //value: parseUnits(ethAmount.toString(), 18),
        });

        console.log(
          `Creating a pool using ${tokenAddress} and ${wethAddress} on ${chainId}.`
        );

        await publicClient.waitForTransactionReceipt({ hash: createPoolTx });

        const currentPoolAddress = computePoolAddress({
          factoryAddress: poolFactoryAddress,
          tokenA: token1,
          tokenB: token2,
          fee: poolFee,
          chainId,
        }) as `0x${string}`;

        console.log(
          `Pool successfully created at address ${currentPoolAddress}`
        );

        let [liquidity, slot0] = await Promise.all([
          publicClient.readContract({
            abi: UNISWAP_V3_POOL_ABI,
            address: currentPoolAddress,
            functionName: "liquidity",
          }),
          publicClient.readContract({
            abi: UNISWAP_V3_POOL_ABI,
            address: currentPoolAddress,
            functionName: "slot0",
          }),
        ]);

        const configuredPool = new Pool(
          token1,
          token2,
          poolFee,
          slot0[0].toString(),
          liquidity.toString(),
          slot0[1]
        );

        const position = Position.fromAmounts({
          pool: configuredPool,
          amount0: parseUnits(tokenAmount.toString(), tokenDecimals)
            .toString()
            .replace("n", ""),
          amount1: parseUnits(ethAmount.toString(), 18)
            .toString()
            .replace("n", ""),
          useFullPrecision: true,
          tickLower:
            nearestUsableTick(
              configuredPool.tickCurrent,
              configuredPool.tickSpacing
            ) -
            configuredPool.tickSpacing * 2,
          tickUpper:
            nearestUsableTick(
              configuredPool.tickCurrent,
              configuredPool.tickSpacing
            ) +
            configuredPool.tickSpacing * 2,
        });

        const mintOptions: MintOptions = {
          recipient: account.address,
          deadline: Math.floor(Date.now() / 1000) + 60 * 20,
          slippageTolerance: new Percent(50, 10_000),
        };

        const { calldata, value } =
          NonfungiblePositionManager.addCallParameters(position, mintOptions);

        const transaction = {
          data: calldata as `0x${string}`,
          to: nonFungiblePositionManagerContractAddress,
          value: BigInt(value),
          from: account.address,
        };

        console.log(`Creating my position on the pool..`);

        const createPositionTx = await walletClient.sendTransaction(
          transaction
        );

        await publicClient.waitForTransactionReceipt({
          hash: createPositionTx,
        });

        console.log(
          `Position successfully created. Tx hash: ${createPositionTx}`
        );

        return `Liquidity pool created successfully! I've added ${tokenAmount} ${tokenAddress} and ${ethAmount} ETH to the pool at this address: ${currentPoolAddress} - You can check the transaction here: ${network.blockExplorers?.default.url}/tx/${createPositionTx}`;
      } catch (error) {
        console.error(error);
        return `Calling create pool tool with arguments:\n\n${JSON.stringify({
          tokenAddress,
          tokenAmount,
          ethAmount,
          chainId,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
