import { useEffect, useState } from "react";
import { Card, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";

import { Gateway } from "@renproject/ren";

import { UIContainer } from "../../../containers/UIContainer";
import { LoadAdditionalDetails } from "../TransactionPage/LoadAdditionalDetails";
import { RecipientRow } from "../TransactionPage/rows/RecipientRow";
import { SearchForDepositsToGateway } from "../TransactionPage/SearchForDepositsToGateway";
import { TransactionDiagram } from "../TransactionPage/TransactionDiagram";
import { TransactionError } from "../TransactionPage/TransactionError";
import {
  TransactionPageContainer,
  TransactionPageTitle,
  TransactionSpinner,
} from "../TransactionPage/TransactionPageStyles";

export const GatewayPage = () => {
  const { gateway, handleGatewayURL } = UIContainer.useContainer();

  const { address } = useParams<{ address: string }>();

  useEffect(() => {
    if (!address) {
      return;
    }
    handleGatewayURL(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const queryGateway =
    gateway && !(gateway instanceof Error) && gateway.queryGateway;

  const [lockAndMint, setLockAndMint] = useState<
    Gateway | Error | null | undefined
  >(undefined);

  const lockAndMintInstance =
    lockAndMint ||
    (gateway && !(gateway instanceof Error) && gateway.lockAndMint) ||
    undefined;

  return (
    <TransactionPageContainer>
      {gateway instanceof Error ? (
        <>Error</>
      ) : gateway ? (
        <>
          <TransactionPageTitle>
            <span>Gateway</span>
            <span style={{ overflow: "ellipsis`" }}>{gateway.address}</span>
          </TransactionPageTitle>

          <Card>
            <Card.Body>
              {queryGateway ? (
                queryGateway instanceof Error ? (
                  <TransactionError
                    txHash={gateway.address}
                    error={queryGateway}
                  />
                ) : (
                  <>
                    <TransactionDiagram queryTx={queryGateway} />

                    <Table>
                      <tbody>
                        <tr>
                          <td>Gateway Address</td>
                          <td>{gateway.address}</td>
                        </tr>
                        <RecipientRow
                          queryTx={queryGateway}
                          deposit={lockAndMintInstance}
                          legacy={false}
                        />
                      </tbody>
                    </Table>

                    <LoadAdditionalDetails
                      legacy={false}
                      gateway={true}
                      queryTx={queryGateway}
                      deposit={lockAndMintInstance}
                      setLockAndMint={setLockAndMint}
                    />
                    <SearchForDepositsToGateway
                      lockAndMint={lockAndMintInstance}
                    />
                  </>
                )
              ) : (
                <TransactionSpinner>
                  <Spinner
                    animation="border"
                    role="status"
                    variant="success"
                  ></Spinner>
                </TransactionSpinner>
              )}
            </Card.Body>
          </Card>
        </>
      ) : null}
    </TransactionPageContainer>
  );
};
