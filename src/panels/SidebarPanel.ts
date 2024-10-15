import { WebviewViewProvider, WebviewView, Uri, window } from "vscode";
import axios from "axios";
import { readYAMLFile } from "../fileOperations";
import { getUri, getNonce } from "../utils"; // Helper functions for nonce and URIs

export class SidebarProvider implements WebviewViewProvider {
  private _view?: WebviewView;
  public ymlData: any;

  constructor(private readonly _extensionUri: Uri) {}

  public async resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    // Allow scripts to run
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set the HTML content for the webview
    webviewView.webview.html = this._getWebviewContent(webviewView.webview);

    // Listen for messages from the webview (React UI)
    this._setMessageListener(webviewView.webview);

    // Fetch API data
    this.ymlData = await readYAMLFile(this._view.webview);

    // Automatically call the API when the sidebar is loaded
    this._fetchApiData("max");
  }

  public async refresh() {
    if (this._view) {
      await this.resolveWebviewView(this._view);
      window.showInformationMessage(
        "Sidebar refreshed after YAML path update."
      );
    }
  }

  private _getWebviewContent(webview: any): string {
    const scriptUri = getUri(webview, this._extensionUri, [
      "out",
      "webview-ui",
      "sidebar.js", // Bundled React component
    ]);
    const styleUri = getUri(webview, this._extensionUri, ["media", "main.css"]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
   

        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
            window.vscode = vscode;
          </script>
          <script src="${scriptUri}" nonce="${nonce}"></script>
        </body>
      </html>
    `;
  }

  // Listen for messages from the React component in the sidebar
  private _setMessageListener(webview: any) {
    webview.onDidReceiveMessage((message: any) => {
      const command = message.command;
      if (command === "fetchApiData") {
        this._fetchApiData(message.payload); // Handle API request from React
      }
    });
  }

  // Axios call to fetch data
  private async _fetchApiData(query: any) {
    console.log(query);
    const data = {
      result: [
        {
          data: [
            {
              dimensions: ["1", "2"],
              dimensionMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionMap: {
                "dt.entity.host.name": "1",
                "dt.entity.host": "2",
              },
              timestamps: ["234343"],
              values: [33.96],
            },
            {
              dimensions: ["1", "2"],
              dimensionMap: {
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
    try {
      //   const response = await axios.get(
      //     `https://api.example.com/data?q=${query}`
      //   );
      // Send the data back to the React component

      setTimeout(() => {
        this._view?.webview.postMessage({
          command: "sendData",
          payload: { mertics: data.result[0].data, type: query },
        });
      }, 1000);
      console.log("API Response:", data.result[0].data);
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  }
}
