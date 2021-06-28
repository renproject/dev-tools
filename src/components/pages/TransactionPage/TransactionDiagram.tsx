import React from "react";
import {
  BurnAndReleaseTransaction,
  LockAndMintTransaction,
} from "@renproject/interfaces";
import { TransactionSummary } from "../../../lib/searchResult";
import { ChainIcon } from "../../common/ChainIcon";
import BigNumber from "bignumber.js";

interface Props {
  queryTx:
    | {
        result: LockAndMintTransaction;
        isMint: true;
        summary: TransactionSummary;
      }
    | {
        result: BurnAndReleaseTransaction;
        isMint: false;
        summary: TransactionSummary;
      };
}

export const TransactionDiagram: React.FC<Props> = ({ queryTx }) => {
  const from = queryTx.summary.fromChain
    ? queryTx.summary.fromChain.name
    : queryTx.summary.from;

  const to = queryTx.summary.toChain
    ? queryTx.summary.toChain.name
    : queryTx.summary.to;

  return (
    <div
      style={{
        display: "flex",
        paddingBottom: 20,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          padding: "6px 10px",
          backgroundColor: "#001732",
          color: "white",
          borderRadius: "5px",
          border: "2px solid #001732",
          display: "flex",
          alignItems: "center",
          flex: "1",
        }}
      >
        <ChainIcon style={{ marginRight: 5 }} chainName={from} />
        {from}
      </div>
      <span style={{ margin: "0px 10px" }}>{" → "}</span>
      <div
        style={{
          fontSize: "16px",
          padding: "6px 10px",
          color: "#001732",
          borderRadius: "5px",
          border: "2px solid #001732",
          flex: "1",
        }}
      >
        {queryTx.summary.amountIn && !queryTx.summary.amountIn.isNaN()
          ? queryTx.summary.amountIn.toFixed()
          : ""}{" "}
        {queryTx.summary.asset}
      </div>
      <span style={{ margin: "0px 10px" }}>{" → "}</span>
      <div
        style={{
          fontSize: "16px",
          padding: "6px 10px",
          backgroundColor: "#001732",
          color: "white",
          borderRadius: "5px",
          border: "2px solid #001732",
          display: "flex",
          alignItems: "center",
          flex: "1",
        }}
      >
        <ChainIcon style={{ marginRight: 5 }} chainName={to} />
        {to}
      </div>
    </div>
  );
};
