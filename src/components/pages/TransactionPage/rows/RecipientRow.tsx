import React from "react";
import { ExternalLink } from "../../../common/ExternalLink";
import {
  SummarizedTransaction,
  TransactionType,
} from "../../../../lib/searchResult";
import { LockAndMint, LockAndMintDeposit } from "@renproject/ren";
import { TaggedText } from "../../../common/TaggedText";
import { Table } from "react-bootstrap";
import { Ox } from "@renproject/utils";
import { MaybeLink } from "../../../common/MaybeLink";
import { NETWORK } from "../../../../environmentVariables";

interface Props {
  queryTx: SummarizedTransaction;
  deposit: LockAndMint | LockAndMintDeposit | Error | undefined | null;
  legacy: boolean;
}

export const RecipientRow: React.FC<Props> = ({ queryTx, deposit, legacy }) => {
  const toChain =
    deposit && !(deposit instanceof Error)
      ? deposit.params.to
      : queryTx.summary.toChain;

  return queryTx.transactionType === TransactionType.Mint ? (
    <>
      <tr>
        <td>Recipient</td>
        <td>
          <TaggedText
            tag={
              toChain && toChain.name === "Solana"
                ? "Account"
                : "Smart Contract"
            }
          >
            <MaybeLink
              href={
                toChain && toChain.utils.addressExplorerLink
                  ? toChain.utils.addressExplorerLink(
                      queryTx.result.in.to.toString(),
                      NETWORK
                    )
                  : undefined
              }
              noUnderline
            >
              {queryTx.result.in.to.toString()}
            </MaybeLink>
          </TaggedText>
          {deposit &&
          !(deposit instanceof Error) &&
          deposit.params.contractCalls ? (
            <>
              <Table style={{ marginTop: 20 }}>
                <tbody>
                  <tr>
                    <td>Function</td>
                    <td colSpan={3}>
                      {
                        deposit.params.contractCalls[
                          deposit.params.contractCalls.length - 1
                        ].contractFn
                      }
                    </td>
                  </tr>
                  {deposit.params.contractCalls[
                    deposit.params.contractCalls.length - 1
                  ].contractParams?.map((param, i) => {
                    return (
                      <tr key={i}>
                        <td>Param {i + 1}</td>
                        <td>{param.name}</td>
                        <td>{param.type}</td>
                        <td>
                          {param.type === "address" &&
                          deposit.params.to.utils.addressExplorerLink ? (
                            <ExternalLink
                              href={deposit.params.to.utils.addressExplorerLink(
                                param.value,
                                NETWORK
                              )}
                            >
                              {param.value.toString()}
                            </ExternalLink>
                          ) : (
                            param.value.toString()
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <p></p>
            </>
          ) : null}
        </td>
      </tr>
    </>
  ) : queryTx.result.in.to ? (
    <tr>
      <td>Recipient</td>
      <td>
        <MaybeLink
          href={
            toChain && toChain.utils.addressExplorerLink
              ? toChain.utils.addressExplorerLink(
                  legacy
                    ? Buffer.from(queryTx.result.in.to, "base64").toString()
                    : queryTx.result.in.to.toString(),
                  NETWORK
                )
              : undefined
          }
        >
          {legacy
            ? Buffer.from(queryTx.result.in.to, "base64").toString()
            : queryTx.result.in.to.toString()}
        </MaybeLink>
      </td>
    </tr>
  ) : null;
};
