import * as React from "react";
import { DismissRegular } from "@fluentui/react-icons";
import {
    MessageBar,
    MessageBarActions,
    MessageBarTitle,
    MessageBarBody,
    Button,
    Link,
    MessageBarIntent,
} from "@fluentui/react-components";

export interface IError {
    message: string;
    intent: MessageBarIntent;
}
export const ErrorComponent = (props: IError) => {
    const { message, intent } = props;
    return (
        <MessageBar intent={intent}>
            <MessageBarBody>
                <MessageBarTitle></MessageBarTitle>
                {message}{" "}
            </MessageBarBody>
        </MessageBar>
    )
}