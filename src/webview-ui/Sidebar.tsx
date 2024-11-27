import React, { useEffect, useState } from "react";
import {
    Button,
    Input,
    Spinner,
    Label,
} from "@fluentui/react-components";
import "./main.css";
import { SelectBox } from "./components/SelectBox";
import { model } from "./models/model";
import { rootStyles } from "./assets/root.styles";
import { ErrorComponent, IError } from "./components/ErrorComponent";
import { Initialize } from "./initialize";
import { apiRequest, clearState, getApiData, setState } from "./helperFunctions";
import TableComponent from "./components/TableComponent";
import { useStyles } from "./styles/sidebar.styles";
import { projectId, workspaceId } from "./appConstants";
import { userInfo } from "os";


function Sidebar() {
    const [metricsData, setMetricsData] = useState<any>([]);
    const [ymlData, setYmlData] = useState<any>({});
    const [services, setServices] = useState<any>([]);
    const [payloadRequest, setPayloadRequest] = useState<{
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
    const [loading, setLoading] = useState<boolean>(false);

    const style = useStyles();
    const rootStyle = rootStyles();

    useEffect(() => {
        const savedState = window.vscode.getState();
        if (savedState?.ymlData) {
            initialize(savedState?.ymlData);
            setMetricsData(savedState?.nudge?.metrics ?? []);
            setSelectServices(savedState?.nudge?.selectedService ?? '');
        } else {
            clearState()
        }
        window.addEventListener("message", ({ data }) => {
            const { command, payload } = data;
            if (command === 'config' && !payload.saveData) {
                setState({ saveData: payload.saveData, nudge: { metricsData: [], selectedService: '' } })
                setMetricsData([]);
                setSelectServices('');
            }
            if (command === "sendData") {
                const response = getApiData(payload);
                setState({ nudge: { metrics: response, selectedService: payload.serviceName } });
                setMetricsData(response);
                setError({
                    message: response.length > 0 ? "" : "Data not found",
                    intent: "info",
                });
            }
            if (command === "services") {
                setState({ saveData: true, ymlData: payload });
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
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    const initialize = (fileContent: any) => {
        setYmlData(fileContent);
        setPayloadRequest({
            ...payloadRequest,
            appId: fileContent.appId.toString(),
        });
        setServices(fileContent.services)

    }

    const handleSubmit = () => {
        setLoading(true);
        if (selectService === "dynatrace") {
            const value = services.dynatrace.commands.find(
                (command: { queryString: string }) =>
                    command.queryString === payloadRequest.query
            );
            apiRequest(selectService, {
                metricsSelector: payloadRequest.query.replace(
                    "$$$",
                    payloadRequest.appId
                ),
                dimensionName: value.dimensionName,
                userid: ymlData.userId.toString(),
                persona: 'observability',
            });
            setPayloadRequest({
                query: "",
                appId: "",
            });
        }
        if (selectService === "blazemeter") {
            apiRequest(selectService, {
                persona: 'quality',
                userid: ymlData.userId.toString(),
                workspaceId, // This property is not required and need to be removed in future development
                projectId, // This property is not required and need to be removed in future development
                appid: payloadRequest.appId.toString()
            });
            setPayloadRequest({ query: "", appId: "" });
        }

        if (selectService === "serviceMap") {
            apiRequest(selectService, {
                prompt: payloadRequest.query,
                userId: ymlData.userId.toString(),
                persona: 'observability'
            });
            setPayloadRequest({ query: "", appId: "" });
        }
    };

    function validateInput() {
        // Validate query
        if (!payloadRequest.query) {
            return false;
        }
        // Validate appId only if $$$ is present in query
        if (payloadRequest.query.includes("$$$")) {
            if (!payloadRequest.appId) {
                return false;
            }
        }

        return true;
    }

    const handelSelectService = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setState({ nudge: { metrics: metricsData, selectedService: event.target.value } })
        setSelectServices(event.target.value);
        setPayloadRequest({
            ...payloadRequest,
            query: ''
        });
        setMetricsData([]);
    };

    const isBlazemeterValid = payloadRequest.appId !== "";
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
                value={selectService}
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
                        value={payloadRequest.query}
                        onChange={(event) =>
                            setPayloadRequest((prev) => ({
                                ...prev,
                                query: event.target.value,
                            }))
                        }
                    />
                    {services[selectService].commands.map((command: any) =>
                        command.queryString === payloadRequest.query &&
                            command.queryString.includes("$$$") ? (
                            <div className={rootStyle.base}>
                                <div className={rootStyle.field}>
                                    <Label htmlFor={"AppId"}>
                                        App ID
                                    </Label>
                                    <Input
                                        className={rootStyle.hideArrows}
                                        placeholder={"App ID"}
                                        name={"AppId"}
                                        value={payloadRequest.appId}
                                        onChange={(event) =>
                                            setPayloadRequest({
                                                ...payloadRequest,
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
                            <Label htmlFor={input}>
                                App ID
                            </Label>
                            <Input
                                key={input}
                                placeholder={input}
                                name={input}
                                className={rootStyle.hideArrows}
                                value={payloadRequest[input as keyof typeof payloadRequest]}
                                onChange={(event) =>
                                    setPayloadRequest({
                                        ...payloadRequest,
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
