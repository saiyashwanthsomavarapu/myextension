import { makeStyles, Radio, RadioGroup, RadioGroupOnChangeData } from '@fluentui/react-components';
import React, { useEffect, useRef } from 'react';
import TableComponent from './TableComponent';
import { model } from '../models/model';

const useStyles = makeStyles({
    chatWindow: {
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        // maxHeight: "100vh",
        padding: "10px",
        gap: "10px",
        // border: "1px solid var(--vscode-input-border)",
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
        backgroundColor: "var(--vscode-input-background)",
        color: "var(--vscode-input-foreground)",
    },
    botMessage: {
        alignSelf: "flex-start",
        // backgroundColor: "var(--vscode-list-hoverBackground)",
        // color: "var(--vscode-input-foreground)",
    },
    tableContainer: {
        border: "1px solid var(--vscode-input-border)",
        borderRadius: "4px",
        overflowX: 'auto',
        maxWidth: '100%'
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
                <div
                    key={index}
                    className={`${classes.message} ${message.sender === 'user' ? classes.userMessage : classes.botMessage}`}
                >
                    {message.type === 'text' && message.text}
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
            ))}
        </div>
    );
};

export default Messages;