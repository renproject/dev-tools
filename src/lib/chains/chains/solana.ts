import { AbiCoder } from "ethers/lib/utils";

import { Solana, SolanaProvider } from "@renproject/chains";
import { resolveNetwork } from "@renproject/chains-solana/build/main/networks";
import { MintChain, RenNetwork } from "@renproject/interfaces";
import { SolanaConnector } from "@renproject/multiwallet-solana-connector";
import { Connection } from "@solana/web3.js";

// import { Connection } from "@solana/web3.js";
import { Icons } from "../icons/wallets";
import { ChainDetails } from "./types";

export const SolanaDetails: ChainDetails<Solana> = {
  chain: Solana.chain,
  chainPattern: /^(Solana|eth)$/i,
  usePublicProvider: (network: RenNetwork) =>
    getPublicSolanaProvider<Solana>(Solana, network),

  multiwalletConfig: (network: RenNetwork) => [
    ...((window as any).solana
      ? [
          {
            name: "Phantom",
            logo: Icons.Phantom,
            connector: new SolanaConnector({
              debug: true,
              providerURL: (window as any).solana,
              network,
            }),
          },
        ]
      : []),
    {
      name: "Sollet",
      logo: Icons.Sollet,
      connector: new SolanaConnector({
        debug: true,
        providerURL: "https://www.sollet.io",
        network,
      }),
    },
  ],

  nativeAssets: [],

  getMintParams: async (
    mintChain: MintChain,
    to: string,
    payload: string,
    asset: string
  ): Promise<MintChain> =>
    getSolanaMintParams(mintChain as Solana, to, payload, asset),

  getTokenAccount: async (
    mintChain: MintChain,
    asset: string
  ): Promise<string | null> => {
    const mintParameters = await (mintChain as Solana).getMintParams(asset);
    const address = mintParameters?.contractCalls?.[0].sendTo;
    const tokenAccount = await (mintChain as Solana).getAssociatedTokenAccount(
      asset,
      address
    );
    return tokenAccount?.toString();
  },

  createTokenAccount: async (
    mintChain: MintChain,
    asset: string
  ): Promise<string> => {
    const mintParameters = await (mintChain as Solana).getMintParams(asset);
    const address = mintParameters?.contractCalls?.[0].sendTo;
    const tokenAccount = await (
      mintChain as Solana
    ).createAssociatedTokenAccount(asset, address);
    return tokenAccount?.toString();
  },
};

export const getPublicSolanaProvider = <T extends Solana>(
  Class: typeof Solana,
  network: RenNetwork
): T => {
  const config = resolveNetwork(network);
  if (!config) {
    throw new Error(
      `No network configuration for ${network} and ${Class.chain}.`
    );
  }

  const provider: SolanaProvider = {
    connection: new Connection(config.endpoint),
    wallet: {} as any,
  };

  const c = new Class(provider, network) as any as T;
  return c;
};

export const getSolanaMintParams = async (
  mintChain: Solana,
  to: string,
  payload: string,
  asset: string
): Promise<MintChain> => {
  const decoded =
    payload.length > 0
      ? new AbiCoder().decode(["string"], Buffer.from(payload, "hex"))[0]
      : undefined;

  const chain = mintChain.Params({
    contractCalls: [
      {
        sendTo: to,
        contractFn: "mint",
        contractParams: decoded
          ? [
              {
                name: "recipient",
                type: "string",
                value: decoded,
              },
            ]
          : [],
      },
    ],
  });
  return chain as any as MintChain<any, any, any>;
};
