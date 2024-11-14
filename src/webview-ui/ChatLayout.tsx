import React, { useEffect, useState, useRef } from 'react';
import Messages from './components/Messages';
import { Button, Input, RadioGroupOnChangeData } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview';
import { apiRequest, getApiData } from './utils';
import { useStyles } from './styles/chatLayout.styles';
import './main.css';
import { Initialize } from './initialize';



interface IMessage {
    text?: string;
    sender: 'user' | 'bot';
    type: string;
    options?: Array<any>;
}

const ChatLayout = () => {
    const classes = useStyles();
    // const [metricsData, setMetricsData] = useState<any>([]);
    const [ymlData, setYmlData] = useState<any>({});
    const [services, setServices] = useState<any>([]);
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
    const [suggestions, setSuggestions] = useState(['dynatrace', 'blazemeter', 'serviceMap']);
    const [selectedService, setSelectedService] = useState<string>('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom (newest message) whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [messages]);


    useEffect(() => {
        const savedState = window.vscode.getState();
        console.log('useState', savedState)
        if (savedState) {
            setYmlData(savedState);
            setServices(savedState.services);
            setSuggestions(Object.keys(savedState.services))
            setDynatraceValues({
                ...dynatraceValues,
                appId: savedState.appId
            })
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
                    options: getApiData(payload)
                }]);
            }
            if (command === "services") {
                window.vscode.setState(payload);
                setYmlData(payload);
                setSuggestions(Object.keys(payload.services))
                setApiEndpoints(payload.apiEndpoints);
                setDynatraceValues({
                    ...dynatraceValues,
                    appId: payload.appId
                })
                setServices(payload.services);
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
            if (['dynatrace','serviceMap'].includes(currentValue)) {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'radio',
                    text: currentValue,
                    options: services[currentValue].commands,
                }])
                return;
            }

            if (newUserMessage.text === '@blazemeter') {
                setMessages((prevMessages) => [...prevMessages, {
                    sender: 'bot',
                    type: 'text',
                    text: `Enter the following parameters: ${services.blazemeter.requestInput.join(',')} with comma separated values`
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
                            appid: value[2] || ymlData.appId.toString(),
                            userid: ymlData.userId.toString(),
                            persona: ymlData.persona
                        }
                    }
                )
            }

            if (selectedService === 'serviceMap') {
                apiRequest({
                    serviceName: selectedService,
                    apiQuery: apiEndpoints[selectedService],
                    queryString: {
                        prompt: dynatraceValues.query
                    },
                });
            }

            if (selectedService === 'dynatrace') {
                const value = services.dynatrace.commands.find((command: { commandName: string; }) => command.commandName === dynatraceValues.query);
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
                setDynatraceValues({
                    query: '',
                    appId: ''
                })
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
            const value = services.dynatrace.commands.find((command: { commandName: string; }) => command.commandName === data.value);
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

        if (selectedService === 'serviceMap') {
            apiRequest({
                serviceName: selectedService,
                apiQuery: apiEndpoints[selectedService],
                queryString: {
                    prompt: data.value
                },
            });
        }
    };


    return (
        <div className={classes.root}>
            {/* Messages container with scrollable content */}
            <div className={classes.messagesContainer} ref={messagesEndRef}>
                <Messages messages={messages} handleRadio={handleRadioChange} />
            </div>

            {/* Show suggestions if applicable */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <Suggestions
                    suggestions={filteredSuggestions}
                    handleSuggestionClick={handleSuggestionClick}
                />
            )}

            {/* Fixed input box and send button */}
            <div className={classes.inputWrapper}>
                <Input
                    name="chatInput"
                    className={classes.input}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                <Button
                    className={classes.btn}
                    disabled={!inputValue}
                    appearance="primary"
                    icon={<SendRegular />}
                    onClick={handleSendMessage}
                />
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
            <List>
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

Initialize(ChatLayout);