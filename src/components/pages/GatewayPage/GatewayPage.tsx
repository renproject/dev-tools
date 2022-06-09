import { Gateway } from "@renproject/ren";
import { useEffect, useState } from "react";
import { Card, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";

import { UIContainer } from "../../../containers/UIContainer";
import { LoadAdditionalDetails } from "../TransactionPage/LoadAdditionalDetails";
import { RecipientRow } from "../TransactionPage/rows/RecipientRow";
import { SearchForDepositsToGateway } from "../TransactionPage/SearchForDepositsToGateway";
import { TransactionDiagram } from "../TransactionPage/TransactionDiagram";
import { TransactionError } from "../TransactionPage/TransactionError";

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

    useEffect(() => {
        window.location.replace(
            `https://renproject.github.io/renvm-explorer-legacy/#/gateway/${address}`,
        );
    });

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
        <div className="mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
                <div className="flex flex-col">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 w-full py-5">
                        <div className="">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                <span className="truncate">
                                    Gateway {address}
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>

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
                                    <TransactionDiagram
                                        asset={queryGateway.summary.asset}
                                        to={queryGateway.summary.to}
                                        from={queryGateway.summary.from}
                                        amount={queryGateway.summary.amountIn}
                                    />

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
                            <div>
                                <Spinner
                                    animation="border"
                                    role="status"
                                    variant="success"
                                ></Spinner>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};
