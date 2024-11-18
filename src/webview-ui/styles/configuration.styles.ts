import { makeStyles } from "@fluentui/react-components";

export const useStyles = makeStyles({
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
