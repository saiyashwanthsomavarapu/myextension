import { makeStyles } from "@fluentui/react-components";

export const useStyles = makeStyles({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // padding: "10px",
    backgroundColor: "var(--vscode-panel-background)",
    borderRadius: "4px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    // padding: "10px",
    marginBottom: "60px", // Leaves space for the fixed input box
  },
  inputWrapper: {
    position: "fixed",
    bottom: "0px",
    left: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--vscode-panel-background)",
    borderRadius: "4px",
    padding: "10px",
  },
  input: {
    flex: 1,
    minWidth: "0",
    border: "1px solid var(--vscode-input-border)",
    backgroundColor: "var(--vscode-input-background)",
    color: "var(--vscode-input-foreground)",
  },
  btn: {
    minWidth: "50px",
    backgroundColor: "var(--vscode-button-background)",
    color: "var(--vscode-button-foreground)",
    border: "none",
    cursor: "pointer",
  },
  suggestions: {
    position: "fixed",
    bottom: "60px", // Adjust this to position it exactly above the input box
    left: "10px",
    right: "10px",
    backgroundColor: "var(--vscode-dropdown-background)",
    color: "var(--vscode-dropdown-foreground)",
    border: "1px solid var(--vscode-input-border)",
    borderRadius: "4px",
    padding: "5px",
    zIndex: 1000,
  },
  suggestionItem: {
    padding: "5px 10px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "var(--vscode-list-hoverBackground)",
    },
  },
});