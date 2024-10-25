// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ExtensionContext, Disposable } from "vscode";
import { SidebarPanel1 } from "./panels/Sidebar/Panel1";
import { selectYAMLFilePath } from "./fileOperations";
import { SidebarPanel2 } from "./panels/Sidebar/Panel2";

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  // Sidebar view
  const sidebarPanel1 = new SidebarPanel1(context.extensionUri);
  const sidebarPanel2 = new SidebarPanel2(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("higway-sidebar", sidebarPanel1)
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("chat-layout", sidebarPanel2)
  );

  // Select yml file path
  context.subscriptions.push(
    vscode.commands.registerCommand("nudge.selectYAMLFile", selectYAMLFilePath)
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("config.yamlFilePath")) {
        // Refresh the sidebar when the YAML file path is modified
        sidebarPanel1.refresh();
        sidebarPanel2.refresh();
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
