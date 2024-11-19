import type { Chain } from "viem/chains";
import * as chains from "viem/chains";

export const getChain = (chainId: number): Chain => {
  for (const chain of Object.values(chains)) {
    if ("id" in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  throw new Error(`Chain with id ${chainId} not found`);
};

export const roundToFirstDecimal = (value: number) => {
  if (value >= 1) {
    return value.toFixed(1);
  }
  const decimalPlaces = 1 - Math.floor(Math.log10(value));
  return value.toFixed(decimalPlaces);
};
