import React, { useEffect, useState } from 'react';
import { Button, Combobox, ComboboxProps, FluentProvider, Input, makeStyles, Option, OptionOnSelectData, RadioGroupOnChangeData, useComboboxFilter, webDarkTheme } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview';
import { createRoot } from 'react-dom/client';
import { apiRequest } from './utils';
import Messages from './components/Messages';
import './main.css';
import { useStyles } from './ChatLayout.styles';

interface IMessage {
    text?: string;
    sender: 'user' | 'bot';
    type: string;
    options?: Array<any>;
}

const ChatLayout = () => {
    const classes = useStyles();
    // const [metricsData, setMetricsData] = useState<any>([]);
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
    const [values, setValues] = useState<string[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions] = useState(['dynatrace', 'blazemeter']);
    const [selectedService, setSelectedService] = useState<string>('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [focus, setFocus] = useState(false);
    const [isDynatraceSelected, setIsDynatraceSelected] = useState(false);
    // const children = useComboboxFilter(inputValue, ['@dynatrace', '@blazemeter'], {
    //     noOptionsMessage: "No animals match your search.",
    // });
    // const onOptionSelect: ComboboxProps["onOptionSelect"] = (e, data) => {
    //     setInputValue(data.optionText ?? "");
    // };

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
                // setMetricsData(payload.metrics);
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

    // const handleInputChange = (value: string) => {
    //     setInputValue(value);
    //     if (value === '@') {
    //         setShowSuggestions(true); // Show initial suggestions on "@"
    //         setFilteredSuggestions(suggestions);
    //     } else if (value.startsWith('@dynatrace:')) {
    //         setShowSuggestions(true); // Show Dynatrace commands on selecting "@dynatrace"
    //     } else {
    //         setShowSuggestions(false); // Hide suggestions otherwise
    //     }
    // };
    function extractAtSymbols(input: string): string[] {
        return input.match(/@\w*/g) || [];
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log(value, value.charAt(value.length - 1) === ' ');
        setInputValue(value);
        setValues(extractAtSymbols(value));

        const atIndex = value.lastIndexOf('@');
        const colonIndex = value.lastIndexOf(':');
        const spaceAfterColon = value.charAt(value.length - 1) === ' ';
        const service = value.slice(atIndex + 1, colonIndex);
        setSelectedService(service);

        console.log(atIndex, colonIndex, spaceAfterColon, service);
        // Scenario 1: Input is just "@"
        if (value === "@" || value.charAt(value.length - 1) === '@') {
            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
            setIsDynatraceSelected(false);
        }
        // Scenario 2: Input starts with "@", show suggestions for "dynatrace" and "blazemeter"
        else if (atIndex === 0 && colonIndex === -1) {
            console.log('2')
            const query = value.slice(1).toLowerCase(); // Everything after "@"
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().startsWith(query)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        }
        // Scenario 3: Selected @dynatrace and input is "@dynatrace:", show dynatrace commands
        else if (suggestions.includes(service) && !spaceAfterColon) {
            console.log('3')
            setIsDynatraceSelected(true);
            if (ymlData[service].commands) {
                setFilteredSuggestions(ymlData[service].commands.map((command: { commandName: string; }) => command.commandName));
            } else {
                setFilteredSuggestions([]);
            }
            setShowSuggestions(true);
        }
        // Scenario 4: Space added after "@dynatrace:", hide the suggestions
        else if (value.charAt(value.length - 1) === ' ') {
            console.log('4')
            setShowSuggestions(false);
        }
        // Scenario 4: After "@dynatrace:", adding another "@" (like "@dynatrace: @") show main suggestions
        else if (atIndex === 0 && colonIndex !== -1 && value[colonIndex + 1] === " " && value.includes('@', colonIndex + 2)) {
            console.log('@dynatrace: @', suggestions)
            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
        }
        // Scenario 5: Any value that doesn't contain "@", hide suggestions
        else if (value.trim() && !value.includes('@')) {
            console.log('5')
            setShowSuggestions(false);
        }
        // Scenario 6: Input contains "@", show main suggestions
        else if (value.includes('@')) {
            console.log('6')
            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
        }
        // Default: Hide suggestions if not in any of the above cases
        else {
            setShowSuggestions(false);
        }
    };


    const handleSuggestionClick = (suggestion: string) => {
        const value = inputValue !== '' ? inputValue : '';
        if (isDynatraceSelected) {
            setInputValue(`${value}${suggestion}`);
            setShowSuggestions(false);
        } else {
            setInputValue(`${value}${suggestion}:`);
            setShowSuggestions(false);
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
            // setSelectedService(currentValue);
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


    // const handleSuggestionClick = (suggestion: string) => {
    //     const atIndex = inputValue.lastIndexOf('@');
    //     const newValue = inputValue.slice(0, atIndex + 1) + suggestion;
    //     setInputValue(newValue);
    //     setShowSuggestions(false);
    // };

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
            {showSuggestions && filteredSuggestions.length > 0 && (
                <Suggestions suggestions={filteredSuggestions} handleSuggestionClick={handleSuggestionClick} />
            )}
            {JSON.stringify(values)}
            {/* Input box and send button */}
            <div className={classes.inputWrapper}>
                <Input
                    name="chatInput"
                    autoFocus={focus}
                    className={classes.input}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => handleInputChange(e)}
                />
                {/* <Combobox
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
                </Combobox> */}
                <Button className={classes.btn} disabled={!inputValue} appearance="primary" icon={<SendRegular />} onClick={handleSendMessage} />
            </div>
        </div>
    );
};

interface ISuggestionProps {
    suggestions: string[];
    handleSuggestionClick: (suggestion: string) => void;
}

const Suggestions = (props: ISuggestionProps) => {
    const { suggestions, handleSuggestionClick } = props;
    const classes = useStyles();
    return (
        <div className={classes.suggestions}>
            <List navigationMode='items'>
                {suggestions.map((suggestion) => (
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
    );
}


createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <ChatLayout />
        </FluentProvider>
    </React.StrictMode>
);

