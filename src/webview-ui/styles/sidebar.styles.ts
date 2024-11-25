import { makeStyles } from "@fluentui/react-components";

export const useStyles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        wordBreak: "break-word",
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