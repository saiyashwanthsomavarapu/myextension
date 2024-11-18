import { Button, Input, Text } from '@fluentui/react-components';
import { Initialize } from './initialize';
import { useEffect, useState } from 'react';
import { rootStyles } from './assets/root.styles';
import { SelectBox } from './components/SelectBox';
import { ErrorComponent } from "./components/ErrorComponent";
import { useStyles } from './styles/configuration.styles';

const options = [
    {
        label: 'observability',
        value: 'observability'
    },
    {
        label: 'quality',
        value: 'quality'
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
    const style = useStyles();
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