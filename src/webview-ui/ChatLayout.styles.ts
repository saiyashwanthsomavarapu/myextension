import { makeStyles } from "@fluentui/react-components";

export const useStyles = makeStyles({
  root: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    backgroundColor: "var(--vscode-panel-background)",
    borderRadius: "4px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
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
    backgroundColor: "var(--vscode-dropdown-background)",
    color: "var(--vscode-dropdown-foreground)",
    border: "1px solid var(--vscode-input-border)",
    borderRadius: "4px",
    padding: "5px",
    zIndex: 1000,
    position: "absolute",
    bottom: "50px", // Positioned just above the input box
    left: "10px",
    right: "10px",
  },
  suggestionItem: {
    padding: "5px 10px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "var(--vscode-list-hoverBackground)",
    },
  },
});
