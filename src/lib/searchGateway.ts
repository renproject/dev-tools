import {
    RenVMCrossChainTransaction,
    RenVMProvider,
} from "@renproject/provider";
import RenJS from "@renproject/ren";
import { GatewayParams } from "@renproject/ren/build/main/params";
import { Chain, ContractChain, RenNetwork, utils } from "@renproject/utils";
import BigNumber from "bignumber.js";

import { NETWORK } from "../environmentVariables";
import { getContractChainParams } from "./chains/chains";
import { RenVMGateway, TransactionSummary } from "./searchResult";
import { queryGateway } from "./searchTactics/searchGateway";

export const searchGateway = async (
    gateway: RenVMGateway,
    getChain: (chainName: string) => Chain | null,
): Promise<RenVMGateway | null> => {
    const provider = new RenVMProvider(NETWORK);

    if (!gateway.queryGateway) {
        gateway.queryGateway = await queryGateway(
            provider,
            gateway.address,
            getChain,
        );
    }

    return gateway;
};

export const getGatewayInstance = async (
    renJS: RenJS,
    searchDetails: RenVMCrossChainTransaction,
    _network: RenNetwork,
    summary: TransactionSummary,
) => {
    const inputs = searchDetails.in as unknown as {
        amount: BigNumber;
        ghash: string;
        gpubkey: string;
        nhash: string;
        nonce: string;
        payload: string;
        phash: string;
        to: string;
        txid: string;
        txindex: string;
    };

    if (!summary.fromChain) {
        throw new Error(
            `Fetching transaction details not supported yet for ${summary.from}.`,
        );
    }

    if (!summary.toChain) {
        throw new Error(
            `Fetching transaction details not supported yet for ${summary.to}.`,
        );
    }

    const params: GatewayParams = {
        asset: summary.asset,
        from: summary.fromChain,
        to: await getContractChainParams(
            summary.toChain as ContractChain,
            inputs.to,
            inputs.payload,
            summary.asset,
        ),
        nonce: inputs.nonce,
        shard: {
            gPubKey: utils.toBase64(searchDetails.in.gpubkey),
        },
    };

    const gatewayInstance = await renJS.gateway(params);

    return gatewayInstance;
};
