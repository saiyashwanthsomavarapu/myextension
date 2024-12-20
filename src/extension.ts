// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ExtensionContext, Disposable } from "vscode";
import { SidebarPanel1 } from "./panels/Sidebar/Panel1";
import { selectYAMLFilePath } from "./fileOperations";
import { SidebarPanel2 } from "./panels/Sidebar/Panel2";
import { InitializePanel } from "panels/Sidebar/InitializePanel";

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
  // Sidebar view
  const initializePanel = new InitializePanel(context.extensionUri); // InitializePanel
  const sidebarPanel1 = new SidebarPanel1(context.extensionUri);
  const sidebarPanel2 = new SidebarPanel2(context.extensionUri);

  // Refresh the sidebar when the YAML file path is modified
  showSidebarWebview();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("initialize-yml", initializePanel)
  );
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
    vscode.commands.registerCommand("nudge.deleteSidebarData", () => {
      sidebarPanel1.updateConfig();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("nudge.deleteChatData", ()=>{
      sidebarPanel2.updateConfig();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("config.saveData")) {
        vscode.commands.executeCommand('setContext', 'saveData', vscode.workspace.getConfiguration("config").get("saveData"));
      }
      if (e.affectsConfiguration("config.yamlFilePath") || e.affectsConfiguration("config.userId") || e.affectsConfiguration("config.appId")) {
        sidebarPanel1.refresh();
        sidebarPanel2.refresh();
        showSidebarWebview();
      }
    })
  );
}

function showSidebarWebview() {
  const newFilePath = vscode.workspace.getConfiguration().get<string>('config.yamlFilePath');
  const userId = vscode.workspace.getConfiguration().get<string>('config.userId');
  const appId = vscode.workspace.getConfiguration().get<string>('config.appId');
  // Refresh the sidebar when the YAML file path is modified
  vscode.commands.executeCommand('setContext', 'yamlFilePathSet', newFilePath !== '' && userId !== '' && appId !== '');
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
