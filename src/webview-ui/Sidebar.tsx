import React, { useEffect, useState } from "react";
import {
    makeStyles,
    Button,
    Input,
    Spinner,
} from "@fluentui/react-components";
import "./main.css";
import { SelectBox } from "./components/SelectBox";
import { model } from "./models/model";
import { rootStyles } from "./assets/root.styles";
import { ErrorComponent, IError } from "./components/ErrorComponent";
import { Initialize } from "./initialize";
import { apiRequest, getApiData } from "./utils";
import TableComponent from "./components/TableComponent";

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
    spinner: {
        margin: "20px auto", // Center the spinner
    },
});

function Sidebar() {
    const [metricsData, setMetricsData] = useState<any>([]);
    const [persona, setPersona] = useState<string>("");
    const [ymlData, setYmlData] = useState<any>({});
    const [services, setServices] = useState<any>([]);
    const [dynatraceValues, setDynatraceValues] = useState<{
        query: string;
        appId: string;
    }>({
        query: "",
        appId: "",
    });
    const [error, setError] = useState<IError>({
        message: "",
        intent: "info",
    });
    const [selectService, setSelectServices] = useState<string>("");
    const [blazemeterValue, setBlazemeterValue] = useState<{
        projectId: string;
        workspaceId: string;
        appId: string;
    }>({ projectId: "", workspaceId: "", appId: "" });
    const [apiEndpoints, setApiEndpoints] = useState<{ [key: string]: string }>(
        {}
    );
    const [loading, setLoading] = useState<boolean>(false);

    const style = styles();
    const rootStyle = rootStyles();

    useEffect(() => {
        const savedState = window.vscode.getState();
        console.log("useState", savedState);
        if (savedState) {
            initialize(savedState);
        }
        window.addEventListener("message", (event) => {
            console.log("transformation:", event.data);
            const { command, payload } = event.data;
            if (command === "sendData") {
                console.log("payload", payload);
                setMetricsData(getApiData(payload));
                setError({
                    message: "",
                    intent: "info",
                });
            }
            if (command === "services") {
                window.vscode.setState(payload);
                initialize(payload);
            }
            if (command === "error") {
                setMetricsData([]);
                setError({
                    message: payload.error,
                    intent: "error",
                });
            }
            setLoading(false);
        });
    }, []);

    const initialize = (payload: any) => {
        console.log("payload", payload);
        setYmlData(payload);
        setApiEndpoints(payload.apiEndpoints);
        setPersona(payload.userPersona);
        setDynatraceValues({
            ...dynatraceValues,
            appId: payload.appId.toString(),
        });
        setBlazemeterValue({
            ...blazemeterValue,
            appId: payload.appId.toString(),
        });
        setServices(payload.services)
    }

    const handleSubmit = () => {
        setLoading(true);
        if (selectService === "dynatrace") {
            const value = services.dynatrace.commands.find(
                (command: { queryString: string }) =>
                    command.queryString === dynatraceValues.query
            );
            apiRequest({
                serviceName: selectService,
                apiQuery: apiEndpoints[selectService],
                queryString: {
                    metricsSelector: dynatraceValues.query.replace(
                        "$$$",
                        dynatraceValues.appId
                    ),
                    dimensionName: value.dimensionName,
                },
            });
            setDynatraceValues({
                query: "",
                appId: "",
            });
        }
        if (selectService === "blazemeter") {
            apiRequest({
                serviceName: selectService,
                apiQuery: apiEndpoints[selectService],
                queryString: {
                    ...blazemeterValue,
                    persona,
                    userid: ymlData.userId.toString(),
                    appid: blazemeterValue.appId.toString()
                },
            });
            setBlazemeterValue({ projectId: "", workspaceId: "", appId: "" });
        }

        if (selectService === "serviceMap") {
            apiRequest({
                serviceName: selectService,
                apiQuery: apiEndpoints[selectService],
                queryString: {
                    prompt: dynatraceValues.query
                },
            });
            setDynatraceValues({ query: "", appId: "" });
        }
    };

    function validateInput() {
        // Validate query
        if (!dynatraceValues.query) {
            return false;
        }

        // Validate appId only if $$$ is present in query
        if (dynatraceValues.query.includes("$$$")) {
            if (!dynatraceValues.appId) {
                return false;
            }
        }

        return true;
    }

    const handelSelectService = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectServices(event.target.value);
        setMetricsData([]);
    };

    const isBlazemeterValid = Object.values(blazemeterValue).every(
        (value) => value.trim() !== ""
    );
    const isDynatraceValid = validateInput();

    const isSubmitDisabled =
        selectService === "blazemeter"
            ? !isBlazemeterValid
            : ["dynatrace", "serviceMap"].includes(selectService)
                ? !isDynatraceValid
                : true;

    return (
        <div className={style.root}>
            <SelectBox
                label="Select service"
                options={Object.keys(services).map((key) => ({
                    label: key,
                    value: key,
                }))}
                onChange={handelSelectService}
            />
            {["dynatrace", 'serviceMap'].includes(selectService) && (
                <>
                    <SelectBox
                        label="Select command"
                        options={services[selectService].commands.map((command: any) => ({
                            label: command.commandName,
                            value: command.queryString,
                        }))}
                        onChange={(event) =>
                            setDynatraceValues((prev) => ({
                                ...prev,
                                query: event.target.value,
                            }))
                        }
                    />
                    {services[selectService].commands.map((command: any) =>
                        command.queryString === dynatraceValues.query &&
                            command.queryString.includes("$$$") ? (
                            <div className={rootStyle.base}>
                                <div className={rootStyle.field}>
                                    <Input
                                        className={rootStyle.hideArrows}
                                        placeholder={"App ID"}
                                        name={"AppId"}
                                        type="number"
                                        value={dynatraceValues.appId}
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
                services[selectService].requestInput.map((input: string) => (
                    <div className={rootStyle.base}>
                        <div className={rootStyle.field} key={input}>
                            <Input
                                key={input}
                                placeholder={input}
                                name={input}
                                className={rootStyle.hideArrows}
                                type="number"
                                value={blazemeterValue[input as keyof typeof blazemeterValue]}
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
            <Button
                className={style.btn}
                appearance="primary"
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
            >
                Submit
            </Button>
            {loading && <Spinner className={style.spinner} size="large" />}
            {metricsData.length > 0 && (
               <TableComponent body={metricsData} headers={model[selectService as keyof typeof model]} />
            )}
            {error.message !== "" && (
                <ErrorComponent message={error.message} intent={error.intent} />
            )}
        </div>
    );
}

Initialize(Sidebar);
