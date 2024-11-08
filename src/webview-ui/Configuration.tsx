import { Button, Input, makeStyles, Text } from '@fluentui/react-components';
import { Settings24Regular as SettingsIcon } from '@fluentui/react-icons';
import { Initialize } from './initialize';
import { useState } from 'react';
import { rootStyles } from './assets/root.styles';

const styles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: '10px'
    },
    btn: {
        marginTop: '10px'
    }
});
function Configuration() {
    const [config, setConfig] = useState({
        userId: '',
        appId: '',
    })
    const style = styles();
    const rootStyle = rootStyles();

    const handleConfiguration = () => {
        window.vscode.postMessage({ command: "config", payload: config });

    }

    return (
        <div className={style.root}>
            <Text align="justify">Welcome to Nudge! To get started, please enter following inputs</Text>
            <div className={rootStyle.base}>
                <div className={rootStyle.field} >
                    <Input
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
                        placeholder={"App ID"}
                        name={"AppId"}
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
            <Button className={style.btn} appearance="primary" onClick={handleConfiguration}>
                Configure
            </Button>
        </div>
    )
}

Initialize(Configuration);