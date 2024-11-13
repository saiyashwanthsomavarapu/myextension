import {
  commands,
  WebviewViewProvider,
  WebviewView,
  Uri,
  window,
  ExtensionContext,
  Webview,
} from "vscode";
import axios from "axios";
import { readYAMLFile } from "../../fileOperations";
import { getUri, getNonce, storeGlobalState } from "../../utils"; // Helper functions for nonce and URIs

export class SidebarPanel1 implements WebviewViewProvider {
  private _view?: WebviewView;
  public ymlData: any;

  constructor(
    private readonly _extensionUri: Uri,
    private readonly _context: ExtensionContext
  ) {}

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
          <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
        </body>
      </html>
    `;
  }

  // Listen for messages from the React component in the sidebar
  private _setMessageListener(webview: Webview) {
    webview.onDidReceiveMessage((message: any) => {
      const command = message.command;
      if (command === "fetchApiData") {
        this._fetchApiData(message.payload); // Handle API request from React
      }
    });

  }

  private async _broadcastMessage(data: any) {
    await commands.executeCommand("nudge.broadcastMessage", data);
  }

  // Axios call to fetch data
  private async _fetchApiData(apiCall: any) {
    console.log(apiCall);
    try {
      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: apiCall.apiQuery,
        headers: {
          Authorization: ``,
        },
        data: apiCall.queryString,
      };
      const response = await axios.request(config);
      const responsePayload = {
        metrics: response.data,
        serviceName: apiCall.serviceName,
      };
      // Send the data back to the React component
      setTimeout(() => {
        this._view?.webview.postMessage({
          command: "sendData",
          payload: responsePayload,
        });
      }, 1000);
      console.log("API Response:", response.data);
      
      storeGlobalState(this._context, "update", responsePayload);
      // Broadcast the data to other views
      await this._broadcastMessage({
        command: "updated",
        key: "update",
        value: responsePayload,
      });
      // this.resultPanel.refreshData();
    } catch (error) {
      this._view?.webview.postMessage({
        command: "error",
        payload: {
          error: "Error in fetching API data",
        },
      });
      console.error("Error fetching API data:", error);
    }
  }
}
