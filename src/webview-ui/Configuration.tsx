import { Button, Input, makeStyles, Text } from '@fluentui/react-components';
import { Settings24Regular as SettingsIcon } from '@fluentui/react-icons';
import { Initialize } from './initialize';
import { useEffect, useState } from 'react';
import { rootStyles } from './assets/root.styles';
import { SelectBox } from './components/SelectBox';
import { ErrorComponent } from "./components/ErrorComponent";

const styles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        // display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    btn: {
        marginTop: '10px'
    },
    infoContainer: {
        marginTop: '10px'
    }
});

const options = [
    {
        label: 'observability',
        value: 'observability'
    },
    {
        label: 'performance',
        value: 'performance'
    }
];

function Configuration() {
    const [config, setConfig] = useState({
        persona: '',
        userId: '',
        appId: '',
    })
    const style = styles();
    const rootStyle = rootStyles();

    useEffect(() => {
        window.addEventListener("message", (event) => {
            const { command, payload } = event.data;
            if (command === "initial") {
                setConfig({
                    ...payload,
                    persona: payload.userPersona
                });
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, [])
    const handleConfiguration = () => {
        window.vscode.postMessage({ command: "config", payload: config });

    }

    return (
        <div className={style.root}>
            <Text align="justify">Welcome to Nudge! To get started, please enter following inputs</Text>
            <div className={rootStyle.base}>
                <div className={rootStyle.field} >
                    <Input
                        className={rootStyle.hideArrows}
                        placeholder={"User ID"}
                        name={"UserId"}
                        type="number"
                        value={config.userId}
                        onChange={(event) =>
                            setConfig({
                                ...config,
                                userId: event.target.value
                            })
                        }
                    />
                </div>
            </div>
            <div className={rootStyle.base}>
                <div className={rootStyle.field} >
                    <Input
                        className={rootStyle.hideArrows}
                        placeholder={"App ID"}
                        name={"AppId"}
                        type="number"
                        value={config.appId}
                        onChange={(event) =>
                            setConfig({
                                ...config,
                                appId: event.target.value
                            })
                        }
                    />
                </div>
            </div>
            <SelectBox
                label="Select Persona"
                options={options}
                value={config.persona}
                onChange={(event) =>
                    setConfig({
                        ...config,
                        persona: event.target.value
                    })
                }
            />
            <div className={style.infoContainer}>
                <ErrorComponent message={'Persona - 2nd phase of Nudge'} intent={'info'} />
            </div>
            <Button className={style.btn} appearance="primary" onClick={handleConfiguration}>
                Configure
            </Button>
        </div>
    )
}

Initialize(Configuration);