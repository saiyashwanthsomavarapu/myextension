// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ExtensionContext, Disposable } from "vscode";
import { SidebarProvider } from "./panels/SidebarPanel";
import { selectYAMLFilePath } from "fileOperations";

let disposables: Disposable[] = [];
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function activate(context: ExtensionContext) {
  // Sidebar view
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("higway-sidebar", sidebarProvider)
  );

  // Select yml file path
  context.subscriptions.push(
    vscode.commands.registerCommand("nudge.selectYAMLFile", selectYAMLFilePath)
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("config.yamlFilePath")) {
        // Refresh the sidebar when the YAML file path is modified
        sidebarProvider.refresh();
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
