import React, { useEffect, useState } from 'react';
import { Button, Combobox, ComboboxProps, FluentProvider, Input, makeStyles, Option, OptionOnSelectData, RadioGroupOnChangeData, useComboboxFilter, webDarkTheme } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview';
import { createRoot } from 'react-dom/client';
import { apiRequest } from './utils';
import Messages from './components/Messages';
import './main.css';

const useStyles = makeStyles({
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
        '&:hover': {
            backgroundColor: "var(--vscode-list-hoverBackground)",
        },
    },
});

interface IMessage {
    text?: string;
    sender: 'user' | 'bot';
    type: string;
    options?: Array<any>;
}

const ChatLayout = () => {
    const classes = useStyles();
    const [metricsData, setMetricsData] = useState<any>([]);
    const [ymlData, setYmlData] = useState<any>([]);
    const [dynatraceValues, setDynatraceValues] = useState<{
        query: string;
        appId: string
    }>({
        query: "",
        appId: ""
    })
    const [apiEndpoints, setApiEndpoints] = useState<{ [key: string]: string }>(
        {}
    );
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions] = useState(['dynatrace', 'blazemeter']);
    const [selectedService, setSelectedService] = useState<string>('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const children = useComboboxFilter(inputValue, ['@dynatrace', '@blazemeter'], {
        noOptionsMessage: "No animals match your search.",
    });
    const onOptionSelect: ComboboxProps["onOptionSelect"] = (e, data) => {
        setInputValue(data.optionText ?? "");
    };

    useEffect(() => {
        const savedState = window.vscode.getState();
        console.log('useState', savedState)
        if (savedState) {
            setYmlData(savedState.services);
            setApiEndpoints(savedState.apiEndpoints);
        }

        window.addEventListener("message", (event) => {
            console.log("chat:", event.data);
            const { command, payload } = event.data;
            if (command === "sendData") {
                setMetricsData(payload.metrics);
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'table',
                    text: payload.serviceName,
                    options: payload.metrics
                }]);
            }
            if (command === "services") {
                window.vscode.setState(payload);
                setApiEndpoints(payload.apiEndpoints);
                setYmlData(payload.services);
            }
        });
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    const handleInputChange = (targetValue: string) => {
        console.log(targetValue)
        const value = targetValue;
        setInputValue(value);

        if (value === "/") {
            // Show all suggestions if the input is only "/"
            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
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
        }
    };

    const handleSendMessage = () => {
        const currentValue = inputValue.slice(1);
        const newUserMessage: IMessage = {
            sender: 'user',
            type: 'text',
            text: inputValue.trim(),
        };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setInputValue('');
        setShowSuggestions(false);
        if (suggestions.includes(currentValue)) {
            setSelectedService(currentValue);
            if (newUserMessage.text === '@dynatrace') {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'radio',
                    text: inputValue.slice(1),
                    options: ymlData.dynatrace.commands,
                }])
                return;
            }

            if (newUserMessage.text === '@blazemeter') {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'text',
                    text: `Enter the following parameters: ${ymlData.blazemeter.requestInput.join(',')} with comma separated values`
                }])
            }
        } else {
            if (selectedService === 'blazemeter') {
                const value = inputValue.split(',').map(item => item.trim());
                apiRequest(
                    {
                        apiQuery: apiEndpoints[selectedService],
                        serviceName: selectedService,
                        queryString: {
                            workspaceId: value[0],
                            projectId: value[1],
                        }
                    }
                )
            }

            if (selectedService === 'dynatrace') {
                const value = ymlData.dynatrace.commands.find((command: { commandName: string; }) => command.commandName === dynatraceValues.query);
                setDynatraceValues({
                    ...dynatraceValues,
                    appId: inputValue
                })
                apiRequest({
                    apiQuery: apiEndpoints[selectedService],
                    serviceName: selectedService,
                    queryString: {
                        metricsSelector: value.queryString.replace('$$$', inputValue),
                        dimensionName: value.dimensionName
                    }
                });
            }
        }
    };


    const handleSuggestionClick = (suggestion: string) => {
        const atIndex = inputValue.lastIndexOf('@');
        const newValue = inputValue.slice(0, atIndex + 1) + suggestion;
        setInputValue(newValue);
        setShowSuggestions(false);
    };

    const handleRadioChange = (_: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
        if (selectedService === 'dynatrace') {
            const value = ymlData.dynatrace.commands.find((command: { commandName: string; }) => command.commandName === data.value);
            console.log(value);
            setDynatraceValues({
                ...dynatraceValues,
                query: value.commandName ?? ''
            })
            if (!value.queryString.includes('$$$')) {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'user',
                    type: 'text',
                    text: data?.value ?? ''
                }]);
                apiRequest({
                    apiQuery: apiEndpoints[selectedService],
                    serviceName: selectedService,
                    queryString: {
                        metricsSelector: value.queryString.replace('$$$', inputValue),
                        dimensionName: value.dimensionName
                    }
                });
            } else {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'user',
                    type: 'text',
                    text: data?.value ?? ''
                },
                {
                    sender: 'bot',
                    type: 'text',
                    text: 'Enter the App Id:'
                }
                ]);
            }

        }
    };


    return (
        <div className={classes.root}>
            {/* Chat messages window */}
            <Messages messages={messages} handleRadio={handleRadioChange} />

            {/* Show suggestions if applicable */}
            {/* {showSuggestions && filteredSuggestions.length > 0 && (
                <Suggestions suggestions={filteredSuggestions} handleSuggestionClick={handleSuggestionClick} />
            )} */}

            {/* Input box and send button */}
            <div className={classes.inputWrapper}>
                <Combobox
                    placeholder="Type your message..."
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                            handleSendMessage();
                        }
                    }}
                    onOptionSelect={onOptionSelect}
                >
                    {children}
                </Combobox>
                <Button className={classes.btn} disabled={!inputValue} appearance="primary" icon={<SendRegular />} onClick={handleSendMessage} />
            </div>
        </div>
    );
};

interface ISuggestionProps {
    suggestions: string[];
    handleSuggestionClick: (suggestion: string) => void;
}

// const Suggestions = (props: ISuggestionProps) => {
//     const { suggestions, handleSuggestionClick } = props;
//     const classes = useStyles();
//     return (
//         <div className={classes.suggestions}>
//             <List>
//                 {suggestions.map((suggestion) => (
//                     <ListItem
//                         key={suggestion}
//                         className={classes.suggestionItem}
//                         onClick={() => handleSuggestionClick(suggestion)}
//                     >
//                         {suggestion}
//                     </ListItem>
//                 ))}
//             </List>
//         </div>
//     );
// }


createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <ChatLayout />
        </FluentProvider>
    </React.StrictMode>
);

