import { makeStyles, Persona, Radio, RadioGroup, RadioGroupOnChangeData } from '@fluentui/react-components';
import React, { useEffect, useRef } from 'react';
import TableComponent from './TableComponent';
import { model } from '../models/model';

const useStyles = makeStyles({
    chatWindow: {
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        height: "94vh",
        gap: "10px",
        borderRadius: "4px",
        boxSizing: "border-box",
    },
    message: {
        padding: "10px",
        borderRadius: "10px",
        maxWidth: "100%",
        wordBreak: "break-word",
        boxSizing: "border-box",
    },
    userMessage: {
        alignSelf: "flex-end",
        margin: '0.5rem',
        backgroundColor: "var(--vscode-input-background)",
        color: "var(--vscode-input-foreground)",
    },
    botMessage: {
        alignSelf: "flex-start",
    },
    botContainer: {
        display: 'flex',
        marginRight: '2.5rem',
        flexDirection: 'row'
    },
    userContainer: {
        display: 'flex', flexDirection: 'row-reverse'
    },
    tableContainer: {
        border: "1px solid var(--vscode-input-border)",
        borderRadius: "4px",
        overflowX: 'auto',
        maxWidth: '100%'
    },
    persona: {
        '& .fui-Persona__primaryText': {
            display: 'none'
        }
    }
});

interface IMessage {
    text?: string;
    sender: 'user' | 'bot';
    type: string;
    options?: Array<any>;
}

interface IMessageProps {
    messages: IMessage[];
    handleRadio: (ev: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => void;
}

const Messages = (props: IMessageProps) => {
    const { messages, handleRadio } = props;
    const classes = useStyles();
    const chatWindowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to the bottom when messages change
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={chatWindowRef} className={classes.chatWindow}>
            {messages.map((message, index) => (
                <div className={`${message.sender === 'user' ? classes.userContainer : classes.botContainer}`}>
                    <Persona
                        className={classes.persona}
                        name={message.sender}
                        textAlignment="start"
                        presence={{ status: "available" }}
                    />
                    <div
                        key={index}
                        className={`${classes.message} ${message.sender === 'user' ? classes.userMessage : classes.botMessage}`}
                    >
                        {message.type === 'text' && <span>{message.text}</span>}
                        {message.type === 'radio' && (
                            <RadioGroup onChange={handleRadio}>
                                {message?.options?.map((command) => (
                                    <Radio key={command.commandName} label={command.commandName} value={command.commandName} />
                                ))}
                            </RadioGroup>
                        )}
                        {message.type === 'table' && (
                            <div className={classes.tableContainer}>
                                <TableComponent body={message.options ?? []} headers={model[(message.text) as keyof typeof model]} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Messages;