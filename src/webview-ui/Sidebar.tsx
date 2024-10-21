import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    FluentProvider,
    webDarkTheme,
    makeStyles,
    Button,
    Input,
} from "@fluentui/react-components";
import "./main.css";
import { SelectBox } from "./components/SelectBox";
import { model } from "./models/model";
import { rootStyles } from "./assets/root.styles";

const styles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        // color: "var(--vscode-editor-foreground)",
    },
    btn: {
        width: "100%",
        marginTop: "20px",
    },
    table: {
        marginTop: "20px",
    },
});

function Sidebar() {
    const [metricsData, setMetricsData] = useState<any>([]);
    const [ymlData, setYmlData] = useState<any>([]);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [selectService, setSelectServices] = useState<string>("");
    const [balzemeterValue, setBalzemeterValue] = useState<{
        projectId: string;
        workspaceId: string;
    }>({ projectId: '', workspaceId: '' });
    const [apiEndpoints, setApiEndpoints] = useState<{ [key: string]: string }>(
        {}
    );
    const style = styles();
    const rootStyle = rootStyles();
    const primaryColor = getComputedStyle(document.body).getPropertyValue(
        "--primary-color"
    );
    const backgroundColor = getComputedStyle(document.body).getPropertyValue(
        "--background-color"
    );

    useEffect(() => {
        window.addEventListener("message", (event) => {
            console.log("transformation:", event.data);
            const transferedData = event.data;
            if (transferedData.command === "sendData") {
                setMetricsData(transferedData.payload.mertics);
            }
            if (transferedData.command === "services") {
                setApiEndpoints(transferedData.payload.apiEndpoints);
                setYmlData(transferedData.payload.services);
            }
        });
    }, []);

    const handleSubmit = () => {
        if (selectService === "dynatrace") {
            window.vscode.postMessage({
                command: "fetchApiData",
                payload: {
                    metrics: metricsData,
                    apiQuery: apiEndpoints[selectService],
                    queryString: {
                        query: selectedOption,
                    }
                },
            });
        }
        if (selectService === "balzemeter") {
            window.vscode.postMessage({
                command: "fetchApiData",
                payload: {
                    metrics: metricsData,
                    apiQuery: apiEndpoints[selectService],
                    queryString: balzemeterValue,
                },
            });
        };
    }

    return (
        <div className={style.root}>
            <SelectBox
                label="Select service"
                options={Object.keys(ymlData).map((key) => ({
                    label: key,
                    value: key,
                }))}
                onChange={(event) => setSelectServices(event.target.value)}
            />
            {selectService === "dynatrace" && (
                <SelectBox
                    label="Select command"
                    options={ymlData[selectService].commands.map((command: any) => ({
                        label: command.commandName,
                        value: command.queryString,
                    }))}
                    onChange={(event) => setSelectedOption(event.target.value)}
                />
            )}
            {selectService === "balzemeter" &&
                ymlData[selectService].requestInput.map((input: string) => (
                    <div className={rootStyle.base}>
                        <div className={rootStyle.field} key={input}>
                            <Input
                                key={input}
                                placeholder={input}
                                onChange={(event) =>
                                    setBalzemeterValue({
                                        ...balzemeterValue,
                                        [input]: event.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                ))}
            <Button className={style.btn} appearance="primary" onClick={handleSubmit}>
                Submit
            </Button>
            {metricsData.length > 0 && <Table
                className={style.table}
                arial-label="Default table"
                style={{ minWidth: "510px" }}
            >
                <TableHeader>
                    <TableRow>
                        {
                            model[selectService as keyof typeof model].map((key: string) => (
                                <TableHeaderCell>{key}</TableHeaderCell>
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {metricsData.map((metrics: any, index: number) => (
                        <TableRow key={index}>
                            {model[selectService as keyof typeof model].map((key: string) => (
                                <TableCell>
                                    <TableCellLayout>{metrics[key]}</TableCellLayout>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>}
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <Sidebar />
        </FluentProvider>
    </React.StrictMode>
);
