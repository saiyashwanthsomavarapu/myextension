import { makeStyles, Radio, RadioGroup, RadioGroupOnChangeData } from '@fluentui/react-components';
import React from 'react'
import TableComponent from './TableComponent';
import { model } from '../models/model';

const useStyles = makeStyles({
    chatWindow: {
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: "10px",
        gap: "10px",
        backgroundColor: "var(--vscode-sidebar-panel)",
        borderRadius: "4px",
        border: "1px solid var(--vscode-input-border)",
    },
    message: {
        padding: "10px",
        borderRadius: "10px",
        maxWidth: "60%",
        wordBreak: "break-word",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "var(--vscode-input-background)",
        color: "var(--vscode-input-foreground)",
    },
    botMessage: {
        alignSelf: "flex-start",
        backgroundColor: "var(--vscode-list-hoverBackground)",
        color: "var(--vscode-input-foreground)",
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
});

interface IMessage {
    text?: string
    sender: 'user' | 'bot'
    type: string
    options?: Array<any>
}

interface IMessageProps {
    messages: IMessage[],
    handleRadio: (ev: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => void
}


const Messages = (props: IMessageProps) => {
    const { messages, handleRadio } = props;
    const classes = useStyles();
    return (
        <div className={classes.chatWindow}>
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`${classes.message} ${message.sender === 'user' ? classes.userMessage : classes.botMessage
                        }`}
                >
                    {message.type === 'text' && message.text}
                    {message.type === 'radio' && (
                        <RadioGroup onChange={handleRadio}>
                            {message?.options?.map((command) => (
                                <Radio key={command.commandName} label={command.commandName} value={command.commandName} />
                            ))}
                        </RadioGroup>
                    )}
                    {message.type === 'table' && <TableComponent body={message.options ?? []} headers={model[(message.text) as keyof typeof model]} />}
                </div>
            ))}
        </div>
    )
}

export default Messages