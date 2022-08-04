import {
    RenVMProvider,
    RenVMTransaction,
    ResponseQueryTx,
    unmarshalRenVMTransaction,
} from "@renproject/provider";
import RenJS from "@renproject/ren";
import { Chain, utils } from "@renproject/utils";

import { allChains } from "../chains/chains";
import {
    RenVMGateway,
    RenVMTransactionError,
    TransactionSummary,
    TransactionType,
} from "../searchResult";
import { errorMatches, TaggedError } from "../taggedError";
import { summarizeTransaction } from "./searchRenVMHash";
import { SearchTactic } from "./searchTactic";

export const queryGateway = async (
    provider: RenVMProvider,
    gatewayAddress: string,
    getChain: (chainName: string) => Chain | null,
): Promise<{
    result: RenVMTransaction;
    transactionType: TransactionType.Mint;
    summary: TransactionSummary;
}> => {
    let response: ResponseQueryTx;
    try {
        response = await provider.sendMessage(
            "ren_queryGateway" as any,
            { gateway: gatewayAddress },
            1,
        );
    } catch (error: any) {
        console.error(error);
        if (errorMatches(error, "not found")) {
            throw new TaggedError(
                error,
                RenVMTransactionError.TransactionNotFound,
            );
        }
        throw error;
    }

    // Unmarshal transaction.
    const unmarshalled = unmarshalRenVMTransaction(response.tx);
    return {
        result: unmarshalled,
        transactionType: TransactionType.Mint as const,
        summary: await summarizeTransaction(unmarshalled, getChain),
    };
};

const OR = (left: boolean, right: boolean) => left || right;

export const searchGateway: SearchTactic<RenVMGateway> = {
    match: (
        searchString: string,
        getChain: (chainName: string) => Chain | null,
    ) =>
        allChains
            .map((chain) => getChain(chain.chain))
            .map((chain) =>
                utils.doesntError(() =>
                    chain ? chain.validateAddress(searchString) : false,
                )(),
            )
            .reduce(OR, false),

    search: async (
        searchString: string,
        updateStatus: (status: string) => void,
        getChain: (chainName: string) => Chain | null,
        renJS: RenJS,
    ): Promise<RenVMGateway> => {
        updateStatus("Looking up Gateway...");

        let queryTx = await queryGateway(
            renJS.provider,
            searchString,
            getChain,
        );

        return RenVMGateway(searchString, queryTx);
    },
};
