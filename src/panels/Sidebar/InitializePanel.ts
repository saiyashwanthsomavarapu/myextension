import {
  commands,
  WebviewViewProvider,
  WebviewView,
  Uri,
  window,
  Webview,
  workspace,
  ConfigurationTarget,
} from "vscode";
import { getUri, getNonce } from "../../utils"; // Helper functions for nonce and URIs
import * as path from 'path';
import { readYAMLFile } from "../../fileOperations";


const ymlFilePath = path.join(__dirname, 'config.yaml');

export class InitializePanel implements WebviewViewProvider {
  private _view?: WebviewView;
  public ymlData: any;

  constructor(private readonly _extensionUri: Uri) {}

  public async resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;
    const config = workspace.getConfiguration("config");

    // Allow scripts to run
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set the HTML content for the webview
    webviewView.webview.html = this._getWebviewContent(webviewView.webview);

    // Listen for messages from the webview (React UI)
    this._setMessageListener(webviewView.webview);

    await config.update("yamlFilePath",ymlFilePath, ConfigurationTarget.Global);

    // Fetch API data
    this.ymlData = await readYAMLFile(this._view.webview);

    setTimeout(() => {
      webviewView.webview.postMessage({
        command: "initial",
        payload: {
          userPersona: this.ymlData.userpersona,
          appId: this.ymlData.appId,
          services: this.ymlData.serviceNames,
          apiEndpoints: this.ymlData.apiEndpoints,
        },
      });
    }, 1000);
  }

  public async refresh() {
    if (this._view) {
      await this.resolveWebviewView(this._view);
      window.showInformationMessage(
        "Initialize refreshed after YAML path update."
      );
    }
  }

  private _getWebviewContent(webview: any): string {
    const scriptUri = getUri(webview, this._extensionUri, [
      "out",
      "webview-ui",
      "initialize.js", // Bundled React component
    ]);

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
    webview.onDidReceiveMessage(async (message: any) => {
      const {command, payload} = message;
      if (command === "config") {  
        const config = workspace.getConfiguration("config");
        await config.update("userId", payload.userId, ConfigurationTarget.Global);
        await config.update("persona", payload.persona, ConfigurationTarget.Global);
        await config.update("appId", payload.appId, ConfigurationTarget.Global);
        window.showInformationMessage(`User Id and App Id  successfully updated.`);
      }
    });
  }
}
