import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    FluentProvider,
    webDarkTheme,
    makeStyles,
    Button,
    Input,
} from "@fluentui/react-components";
import "./main.css";
import { SelectBox } from "./components/SelectBox";
import { rootStyles } from "./assets/root.styles";

const styles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        // color: "var(--vscode-editor-foreground)",
    },
    btn: {
        width: "100%",
        marginTop: "20px",
    }
});

function Sidebar() {
    const [ymlData, setYmlData] = useState<any>([]);
    const [dynatraceValues, setDynatraceValues] = useState<{
        query: string;
        appId: string
    }>({
        query: "",
        appId: ""
    });
    const [selectService, setSelectServices] = useState<string>("");
    const [blazemeterValue, setBlazemeterValue] = useState<{
        projectId: string;
        workspaceId: string;
    }>({ projectId: '', workspaceId: '' });
    const [apiEndpoints, setApiEndpoints] = useState<{ [key: string]: string }>(
        {}
    );

    const style = styles();
    const rootStyle = rootStyles();

    useEffect(() => {
        const savedState = window.vscode.getState();
        console.log('useState', savedState)
        if (savedState) {
            setYmlData(savedState.services);
            setApiEndpoints(savedState.apiEndpoints);
        }
        window.addEventListener("message", (event) => {
            console.log("transformation:", event.data);
            const { command, payload } = event.data;

            if (command === "services") {
                window.vscode.setState(payload);
                setApiEndpoints(payload.apiEndpoints);
                setYmlData(payload.services);
            }
        });
    }, []);

    const handleSubmit = () => {
        if (selectService === "dynatrace") {
            const value = ymlData.dynatrace.commands.find((command: { queryString: string; }) => command.queryString === dynatraceValues.query);
            window.vscode.postMessage({
                command: "fetchApiData",
                payload: {
                    serviceName: selectService,
                    apiQuery: apiEndpoints[selectService],
                    queryString: {
                        metricsSelector: dynatraceValues.query.replace('$$$', dynatraceValues.appId),
                        dimensionName: value.dimensionName
                    }
                },
            });
            setDynatraceValues({
                query: "",
                appId: ""
            });
        }
        if (selectService === "blazemeter") {
            window.vscode.postMessage({
                command: "fetchApiData",
                payload: {
                    serviceName: selectService,
                    apiQuery: apiEndpoints[selectService],
                    queryString: blazemeterValue,
                },
            });
            setBlazemeterValue({ projectId: '', workspaceId: '' });
        };

    }

    function validateInput() {
        // Validate query
        if (!dynatraceValues.query) {
            return false;
        }
        // Validate appId only if $$$ is present in query
        if (dynatraceValues.query.includes('$$$')) {
            if (!dynatraceValues.appId) {
                return false;
            }
        }

        return true;
    }

    const handelSelectService = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectServices(event.target.value);
    }

    const isBlazemeterValid = Object.values(blazemeterValue).every(value => value.trim() !== '');
    const isDynatraceValid = validateInput()


    const isSubmitDisabled = selectService === "blazemeter" ? !isBlazemeterValid : selectService === "dynatrace" ? !isDynatraceValid : true;

    return (
        <div className={style.root}>
            <SelectBox
                label="Select service"
                options={Object.keys(ymlData).map((key) => ({
                    label: key,
                    value: key,
                }))}
                onChange={handelSelectService}
            />
            {selectService === "dynatrace" && (
                <>
                    <SelectBox
                        label="Select command"
                        options={ymlData[selectService].commands.map((command: any) => ({
                            label: command.commandName,
                            value: command.queryString,
                        }))}
                        onChange={(event) => setDynatraceValues((prev) => ({ ...prev, query: event.target.value }))}
                    />
                    {ymlData[selectService].commands.map((command: any) =>
                        command.queryString === dynatraceValues.query && command.queryString.includes('$$$') ? (
                            <div className={rootStyle.base}>
                                <div className={rootStyle.field} >
                                    <Input
                                        placeholder={"App ID"}
                                        name={"AppId"}
                                        onChange={(event) =>
                                            setDynatraceValues({
                                                ...dynatraceValues,
                                                appId: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : null
                    )}
                </>
            )}
            {selectService === "blazemeter" &&
                ymlData[selectService].requestInput.map((input: string) => (
                    <div className={rootStyle.base}>
                        <div className={rootStyle.field} key={input}>
                            <Input
                                key={input}
                                placeholder={input}
                                name={input}
                                onChange={(event) =>
                                    setBlazemeterValue({
                                        ...blazemeterValue,
                                        [input]: event.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                ))}
            <Button className={style.btn} appearance="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>
                Submit
            </Button>
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
