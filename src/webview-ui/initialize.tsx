import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import React from "react";
import { createRoot } from "react-dom/client";

export const Initialize = (Component: React.FC) => {
    return createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
            <FluentProvider theme={webDarkTheme}>
                <Component />
            </FluentProvider>
        </React.StrictMode>
    );
}

