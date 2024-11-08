import {
  commands,
  WebviewViewProvider,
  WebviewView,
  Uri,
  window,
  Webview,
  ExtensionContext,
} from "vscode";
import axios from "axios";
import { readYAMLFile } from "../../fileOperations";
import { getUri, getNonce, storeGlobalState } from "../../utils"; // Helper functions for nonce and URIs

interface IApiParams {
  apiQuery: string;
  serviceName: string;
  queryString: {
    [key: string]: string;
  };
}

export class SidebarPanel2 implements WebviewViewProvider {
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
    this.ymlData = await this._loadYAMLData();

    // Automatically call the API when the sidebar is loaded
    // this._fetchApiData("max");
  }

  private async _loadYAMLData() {
    try {
      const data = await readYAMLFile(this._view?.webview ?? ({} as Webview));
      return data;
    } catch (error: any) {
      window.showErrorMessage("Failed to load YAML data: " + error.message);
      return null;
    }
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
      "chatlayout.js", // Bundled React component
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

  private async _broadcastMessage(data: any) {
    await commands.executeCommand("nudge.broadcastMessage", data);
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
  private async _fetchApiData(apiCall: IApiParams) {
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
      console.log(apiCall);
      // Send the data back to the React component
      setTimeout(() => {
        this._view?.webview.postMessage({
          command: "sendData",
          payload: {
            metrics: response.data.data,
            serviceName: apiCall.serviceName,
          },
        });
      }, 1000);
      console.log("API Response:", response.data.data);
      const responsePayload = {
        metrics: response.data.data,
        serviceName: apiCall.serviceName,
      };
      storeGlobalState(this._context, "update", responsePayload);
      // Broadcast the data to other views
      await this._broadcastMessage({
        command: "updated",
        key: "update",
        value: responsePayload,
      });
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
