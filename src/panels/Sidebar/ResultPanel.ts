import {
  WebviewViewProvider,
  WebviewView,
  Uri,
  ExtensionContext,
} from "vscode";
import { getUri, getNonce, getGlobalState } from "../../utils"; // Helper functions for nonce and URIs

export class ResultPanel implements WebviewViewProvider {
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
  }

  public refreshData() {
    const data = getGlobalState(this._context, "update");
    if (this._view) {
      this._view.webview.postMessage({ command: "update", data });
    } else {
      console.error("View is not available to refresh data", this._view);
    }
  }

  public async refresh() {
    if (this._view) {
      await this.resolveWebviewView(this._view);
    }
  }

  private _getWebviewContent(webview: any): string {
    const scriptUri = getUri(webview, this._extensionUri, [
      "out",
      "webview-ui",
      "result.js", // Bundled React component
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
  private _setMessageListener(webview: any) {
    webview.onDidReceiveMessage((message: any) => {
      console.log("result.ts:", message);
      //   const command = message.command;
      if (message.command === "update") {
        const data = getGlobalState(this._context, message.key);
        webview.postMessage({ command: "update", payload: data });
      }
    });
  }
}
