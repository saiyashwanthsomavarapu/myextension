import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
} from "vscode";
import { getNonce, getUri } from "../utils";
import axios from "axios";
import * as https from "https";

export class TodoPanel {
  public static currentPanel: TodoPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  // private async fetchApiData(name: string) {
  //   try {
  //     const response = await axios.get(
  //       `https://dummyjson.com/users/search?q=${name}`
  //     );

  //     // Send the API data to the webview (React app)
  //     this._panel.webview.postMessage({
  //       command: "sendData",
  //       payload: { users: response.data.users, specificUser: name },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching API data:", error);
  //   }
  // }

  public static async render(extensionUri: Uri, inputValue: string = "") {
    const data = {
      result: [
        {
          data: [
            {
              dimensions: ["1", "2"],
              dimensionsMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionsMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionsMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionsMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
          ],
        },
      ],
    };
    https.globalAgent.options.rejectUnauthorized = false;
    /* https://ssy45929.live.dynatrace.com/api/v2/metrics/query?metricSelector=builtin:host.cpu.usage:filter(and(or(in("dt.entity.host", entitySelector("type(host),tag(~"[AWS]Appld:4534~")"))))):splitBy("dt.entity.host"):sort(value(auto,descending)):limit (20):fold(${inpuValue}):na
     mes */
    const res = await axios.get(
      `https://dummyjson.com/users/search?q=${inputValue}`
    );
    if (TodoPanel.currentPanel) {
      // If the webview panel already exists reveal it
      TodoPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "higway",
        // Panel title
        "Higway",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/dist"),
          ],
        }
      );

      TodoPanel.currentPanel = new TodoPanel(panel, extensionUri);
      // res.data.result[0].data // data from API
      setTimeout(() => {
        panel.webview.postMessage({
          command: "sendData",
          payload: { mertics: data.result[0].data, specificUser: "" },
        });
      }, 1000);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    TodoPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "dist",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "dist",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            
            <link rel="stylesheet" type="text/css" href="${stylesUri}">
            <title>Todo</title>
          </head>
          <body>
            <div id="root"></div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi(); // Exposes the VS Code API globally
                window.vscode = vscode;
            </script>
            <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
          </body>
        </html>
      `;
  }

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const updatedData: any = message.payload;

        switch (command) {
          case "ready":
            console.log("Webview is ready");
            break;

          case "updateTask":
            // Here you can handle the updated data, save it, or do any logic
            window.showInformationMessage(
              `Task updated to: ${updatedData.task}`
            );
            break;
          // case "fetchApiData":
          //   this.fetchApiData(updatedData.specificUser);
          //   break;
        }
      },
      undefined,
      this._disposables
    );
  }
}
