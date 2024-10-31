import React, { useEffect, useState } from 'react';
import { FluentProvider, makeStyles, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow, webDarkTheme } from '@fluentui/react-components';
import { createRoot } from 'react-dom/client';
import { model } from './models/model';
import { ErrorComponent, IError } from './components/ErrorComponent';
import './main.css';

const useStyles = makeStyles({
    root: {
        marginBottom: '10px',
        backgroundColor: "var(--vscode-panel-background)",
    },
    tableContainer: {
        // maxHeight: "100vh", // Set your desired maximum height for the table container
        // overflowY: "auto",
        border: "1px solid var(--vscode-input-border)", // Optional: add border to distinguish the scroll area
        borderRadius: "4px",
    },
    tableCell: {
        overflow: 'hidden',
        wordBreak: 'break-word',
    }
});

const Result = () => {
    const classes = useStyles();
    const [metricsData, setMetricsData] = useState<any>([]);
    const [error, setError] = useState<IError>({
        message: '',
        intent: 'info'
    });
    const [selectedService, setSelectedService] = useState<string>('');

    useEffect(() => {
        window.vscode.postMessage({
            command: 'update',
            key: 'update'
        });
        window.addEventListener("message", (event) => {
            console.log("result:event:", event.data);
            const { command, payload } = event.data;
            if (command === "update") {
                console.log('payload', payload, model);
                setMetricsData(payload.metrics);
                setError({
                    message: payload.metrics.length > 0 ? '' : 'Data not found',
                    intent: 'info'
                });
                setSelectedService(payload.serviceName);
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    return (
        <div className={classes.root}>
            <h1>{selectedService}</h1>
            {metricsData.length > 0 && (
                <div className={classes.tableContainer}>
                    <Table aria-label="Default table">
                        <TableHeader>
                            <TableRow>
                                {model[selectedService as keyof typeof model].map((key: string) => (
                                    <TableHeaderCell key={key}>{key}</TableHeaderCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metricsData.map((metrics: any, index: number) => (
                                <TableRow key={index}>
                                    {model[selectedService as keyof typeof model].map((key: string) => (
                                        <TableCell key={key} className={classes.tableCell}>
                                            <TableCellLayout>{metrics[key]}</TableCellLayout>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {error.message !== '' && <ErrorComponent message={error.message} intent={error.intent} />}
        </div>
    );
};

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <Result />
        </FluentProvider>
    </React.StrictMode>
);
