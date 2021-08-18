import { useCallback, useState } from "react";
import { createContainer } from "unstated-next";
import { SummarizedTransaction } from "../lib/searchResult";
import { TxStatus } from "@renproject/interfaces";
import { NETWORK } from "../environmentVariables";
import RenJS from "@renproject/ren";
import { unmarshalTransaction } from "../lib/searchTactics/searchRenVMHash";
import { ResponseQueryTx } from "@renproject/rpc/build/main/v2";
import { UIContainer } from "./UIContainer";

function useLatestTransactionsContainer() {
  const { getChain } = UIContainer.useContainer();

  const [latestTransactions, setLatestTransactions] = useState<
    SummarizedTransaction[] | null | undefined
  >();

  const fetchLatestTransactions = useCallback(async () => {
    const renJS = new RenJS(NETWORK);
    const { txs } = (await renJS.renVM.sendMessage(
      "ren_queryTxs" as any as never,
      { latest: true } as any as never
    )) as { txs: ResponseQueryTx["tx"][] };
    let txsUnmarshalled = await Promise.all(
      txs.map((tx) =>
        unmarshalTransaction({ tx, txStatus: TxStatus.TxStatusNil }, getChain)
      )
    );

    setLatestTransactions(txsUnmarshalled);
  }, [getChain, setLatestTransactions]);

  return {
    latestTransactions,
    fetchLatestTransactions,
  };
}

export const LatestTransactionsContainer = createContainer(
  useLatestTransactionsContainer
);
