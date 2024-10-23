import React, { useState } from 'react';
import { Button, webDarkTheme, FluentProvider, Input, makeStyles } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview'; // For rendering suggestions
import { createRoot } from 'react-dom/client';
import "./main.css";

const useStyles = makeStyles({
    root: {
        position: "absolute",
        bottom: "10px",
        left: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column-reverse", // Reversed the order to show suggestions above input
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
        position: "absolute", // Make suggestions absolute for better control
        bottom: "45px", // Adjust based on input position
        left: "10px", // Align with input field
        right: "10px",
    },
    suggestionItem: {
        padding: "5px 10px",
        cursor: "pointer",
        '&:hover': {
            backgroundColor: "var(--vscode-list-hoverBackground)",
        },
    },
});

const ChatLayout = () => {
    const classes = useStyles();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions] = useState(['Dynatrace', 'BlazeMeter']);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);

        const atIndex = value.lastIndexOf('@');
        if (atIndex !== -1) {
            const query = value.slice(atIndex + 1).toLowerCase();
            const filtered = suggestions.filter((suggestion) =>
                suggestion.toLowerCase().startsWith(query)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const atIndex = inputValue.lastIndexOf('@');
        const newValue = inputValue.slice(0, atIndex + 1) + suggestion;
        setInputValue(newValue);
        setShowSuggestions(false);
    };

    return (
        <div className={classes.root}>
            {/* Show suggestions above input if applicable */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className={classes.suggestions}>
                    <List>
                        {filteredSuggestions.map((suggestion) => (
                            <ListItem
                                key={suggestion}
                                className={classes.suggestionItem}
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </ListItem>
                        ))}
                    </List>
                </div>
            )}

            <div className={classes.inputWrapper}>
                <Input
                    name="chatInput"
                    className={classes.input}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <Button className={classes.btn} appearance="primary" icon={<SendRegular />} />
            </div>
        </div>
    );
};

export default ChatLayout;

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <ChatLayout />
        </FluentProvider>
    </React.StrictMode>
);
