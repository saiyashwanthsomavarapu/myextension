import React, { useEffect, useState, useRef } from 'react';
import Messages from './components/Messages';
import { Button, Input, RadioGroupOnChangeData } from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { apiRequest, clearState, getApiData, setState } from './helperFunctions';
import { useStyles } from './styles/chatLayout.styles';
import './main.css';
import { Initialize } from './initialize';
import { Suggestions } from './components/SuggestionComponent';
import { projectId, workspaceId } from './appConstants';



interface IMessage {
    text?: string;
    sender: 'user' | 'bot';
    type: string;
    options?: Array<any>;
}

const ChatLayout = () => {
    const classes = useStyles();
    const [ymlData, setYmlData] = useState<any>({});
    const [services, setServices] = useState<any>([]);
    const [dynatraceValues, setDynatraceValues] = useState<{
        query: string;
        appId: string
    }>({
        query: "",
        appId: ""
    })
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState(['dynatrace', 'blazemeter', 'serviceMap']);
    const [selectedService, setSelectedService] = useState<string>('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    // Scroll to the bottom (newest message) whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            setState({messages: messages});
        }
    }, [messages]);


    useEffect(() => {
        const savedState = window.vscode.getState();
        initializeData(savedState);
        window.addEventListener("message", handleMessageEvent);
        return () => {
            window.removeEventListener('message', () => { });
        };
    }, []);

    const initializeData = (savedState: any) => {
        if (savedState) {
            const { ymlData: savedYmlData, messages: savedMessages = [] } = savedState;
            setYmlData(savedYmlData);
            setServices(savedYmlData?.services ?? []);
            setMessages(savedMessages);
            setSuggestions(Object.keys(savedYmlData?.services ?? {}));
            setDynatraceValues((prev) => ({
                ...prev,
                appId: savedYmlData?.appId ?? '',
            }));
        } else {
            clearState();
        }
    };

    const handleMessageEvent = (event:MessageEvent) => {
        const { command, payload } = event.data;
        if (command === 'config' && !payload.saveData) {
            setState({saveData: payload.saveData, messages: []});
            setMessages([]);
        }
        if (command === "sendData") {
            addBotMessage('table',payload.serviceName,getApiData(payload));
        }
        if (command === "services") {
            setState({ymlData: payload});
            setYmlData(payload);
            setSuggestions(Object.keys(payload.services));
            setDynatraceValues({
                ...dynatraceValues,
                appId: payload.appId
            });
            setServices(payload.services);
        }
    }

    const addBotMessage = (type: string, text: string, options: any[] = []) => {
        setMessages((prevMessages) => [
            ...prevMessages,
           {
                sender: 'bot',
                type,
                text,
                ...(options?.length > 0 ? {options} : {} )
            },
        ]);
      };
      
      const addUserMessage = (text: string) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: 'user',
                type: 'text',
                text: text.trim(),
            },
        ]);
      };

    const apiRequestWithErrorHandling = async (service: string, payload: any) => {
        try {
            await apiRequest(service, payload);
        } catch (error) {
            console.error(`API request failed for ${service}:`, error);
            addBotMessage('An error occurred while processing your request.', 'text');
        }
    };

    const handleInputChange = (targetValue: string) => {
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
        addUserMessage(inputValue.trim());
        setInputValue('');
        setShowSuggestions(false);
        if (suggestions.includes(currentValue)) {
            setSelectedService(currentValue);
            if (['dynatrace', 'serviceMap'].includes(currentValue)) {
                addBotMessage('radio',currentValue,services[currentValue].commands)
                return;
            }

            if (currentValue === 'blazemeter') {
                addBotMessage('text','Enter the App Id:')
            }
        } else {
            if (selectedService === 'blazemeter') {
                apiRequestWithErrorHandling(selectedService,
                    {
                        workspaceId, // This property is not required and need to be removed in future development
                        projectId, // This property is not required and need to be removed in future development
                        appid: inputValue || ymlData.appId.toString(),
                        userid: ymlData.userId.toString(),
                        persona: 'quality'
                    }
                );
            }

            if (selectedService === 'serviceMap') {
                apiRequestWithErrorHandling(selectedService, {
                    prompt: dynatraceValues.query,
                    userid: ymlData.userId.toString(),
                    persona: 'observability',
                });
            }

            if (selectedService === 'dynatrace') {
                const value = services.dynatrace.commands.find((command: { commandName: string; }) => command.commandName === dynatraceValues.query);
                setDynatraceValues({
                    ...dynatraceValues,
                    appId: inputValue
                })
                apiRequestWithErrorHandling(selectedService, {
                    metricsSelector: value.queryString.replace('$$$', inputValue),
                    dimensionName: value.dimensionNam,
                    userid: ymlData.userId.toString(),
                    persona: 'observability',
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
            setDynatraceValues({
                ...dynatraceValues,
                query: value.commandName ?? ''
            })
            if (!value.queryString.includes('$$$')) {
                addUserMessage(data?.value ?? '');
                apiRequestWithErrorHandling(selectedService, {
                    metricsSelector: value.queryString.replace('$$$', inputValue),
                    dimensionName: value.dimensionName,
                    userid: ymlData.userId.toString(),
                    persona: 'observability',
                });
                return;
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
            apiRequestWithErrorHandling(selectedService, {
                prompt: data.value,
                userid: ymlData.userId.toString(),
                persona: 'observability',
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className={classes.root}>
            {/* Messages container with scrollable content */}
            <div className={classes.messagesContainer}>
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
                    onKeyDown={handleKeyDown}
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



Initialize(ChatLayout);