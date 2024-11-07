import { Button, makeStyles, Text } from '@fluentui/react-components';
import { Settings24Regular as SettingsIcon } from '@fluentui/react-icons';
import { Initialize } from './initialize';

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
    const style = styles();
    const handleConfiguration = () => {
        window.vscode.postMessage({ command: "setYmlPath" });

    }

    return (
        <div className={style.root}>
            <Text align="justify">Welcome to Nudge! To get started, please select a YAML file.</Text>
            <Button className={style.btn} appearance="primary" onClick={handleConfiguration} icon={<SettingsIcon />}>
                Configure YAML File
            </Button>
        </div>
    )
}

Initialize(Configuration);