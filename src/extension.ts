// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ExtensionContext, commands, Disposable, window } from "vscode";
import axios from "axios";
import https from "https";
import { TodoPanel } from "./panels/TodoPanel";

let disposables: Disposable[] = [];
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// async function fetchUsers() {
//   try {
//     // const agent = new https.Agent({rejectUnauthorized: false});
//     // axios.defaults.httpsAgent = agent;
//     const httpsAgent = new https.Agent({
//       rejectUnauthorized: false,
//       minVersion: "TLSv1",
//     });
//     const response = await axios.get(
//       "https://jsonplaceholder.typicode.com/users",
//       { httpsAgent: httpsAgent }
//     );
//     const users = response.data;
//     console.log("List of users:");
//     console.log(users);
//     return users;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//   }
// }

async function promptExecution(prompt: string) {
  try {
    const promptAPI = "https://jsonplaceholder.typicode.com/users";
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      minVersion: "TLSv1",
    });
    const response = await axios.post(
      promptAPI,
      {
        prompt: `RE-SQUAD: ${prompt}`,
      },
      {
        httpsAgent: httpsAgent,
        headers: { Accept: "application/json" },
      }
    );
    const respPrompt = response.data;
    console.log("Prompt Response:");
    console.log(respPrompt);
    return respPrompt;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// async function dt_appslo() {
//   try {
//     const response = await fetch(
//       "https://internal-app-4868-dev-1-ue1-docsn-alb-1-183475484.us-east-1.elb.amazonaws.com",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           appID: "5050",
//         }),
//       }
//     );
//     const appSlos: any = await response.json();
//     console.log("API Response:");
//     console.log(appSlos);
//     console.log("List of users:");
//     console.log(appSlos.dtInformation.slo);
//     return appSlos.dtInformation.slo;

// const agent = new https.Agent({rejectUnauthorized: false});
// axios.defaults.httpsAgent = agent;
// const httpsAgent = new https.Agent({rejectUnauthorized: false, minVersion: 'TLSv1',});
// const response = await axios.post('https://internal-app-4868-dev-1-ue1-docsn-alb-1-183475484.us-east-1.elb.amazonaws.com',
// {
// 	appID : "5050"
// },
// {
// 	httpsAgent: httpsAgent,
// 	headers: {Accept: "application/json"}
// });
// const appSlos =  response.data;
// console.log('API Response:');
// console.log(response.data);
// console.log('List of users:');
// console.log(appSlos.dtInformation.slo);
// return appSlos.dtInformation.slo;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//   }
// }

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("HIGWAY.getByMax", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Max value",
        placeHolder: "Enter max value",
      });

      TodoPanel.render(context.extensionUri, input);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("HIGWAY.run", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Enter some input",
        placeHolder: "e.g., type something here",
      });

      if (input) {
        vscode.window.showInformationMessage(`You entered: ${input}`);
      }
      TodoPanel.render(context.extensionUri);
    })
  );

  commands.registerCommand("HIGWAY.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    window.showInformationMessage("Hello World from HIGWAY!");
  });

  commands.registerCommand("HIGWAY.FirstCommand", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    window.showInformationMessage("First Command Test from HIGWAY!");
  });

  commands.registerCommand("HIGWAY.ScanDocument", function () {
    // Get the active text editor
    window.showInformationMessage("Start Scanning Document!");
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      let document = editor.document;

      // Get the document text
      const documentText = document.getText();
      const documentName = document.fileName;
      window.showInformationMessage("Document Name: " + documentName);
      window.showInformationMessage("Document Text: " + documentText);
      // DO SOMETHING WITH `documentText`
      vscode.commands.executeCommand(
        "github.copilot.interactiveEditor.explain"
      );

      //   dt_appslo().then((slo: any[]) => {
      //     slo.forEach((object) => {
      //       console.log(
      //         JSON.stringify({
      //           name: object.name,
      //           status: object.status,
      //           error: object.error,
      //           warning: object.warning,
      //           errorBudget: object.errorBudget,
      //           errorBudgetBurnRate: object.errorBudgetBurnRate,
      //         })
      //       );

      //       if (object.name.includes("Usage Stats Availability QA")) {
      //         window.showErrorMessage(
      //           "SLO For APP-5050: " +
      //             JSON.stringify({
      //               name: object.name,
      //               status: object.status,
      //               error: object.error,
      //               warning: object.warning,
      //               errorBudget: object.errorBudget,
      //               errorBudgetBurnRate: object.errorBudgetBurnRate,
      //             })
      //         );
      //       } else {
      //         window.showInformationMessage(
      //           "SLO For APP-5050: " +
      //             JSON.stringify({
      //               name: object.name,
      //               status: object.status,
      //               error: object.error,
      //               warning: object.warning,
      //               errorBudget: object.errorBudget,
      //               errorBudgetBurnRate: object.errorBudgetBurnRate,
      //             })
      //         );
      //       }
      //     });
      //   });
    }
    vscode.commands.executeCommand(
      "github.copilot.interactiveEditor.generateTests"
    );

    window.showInformationMessage("Complete Scanning Document!");

    vscode.commands.executeCommand("github.copilot.git.generateCommitMessage");
  });

  vscode.commands.registerCommand("HIGWAY.PromptTest", async () => {
    // The code you place here will be executed every time your command is executed
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      // User Input to name saved snippet
      let userInput = await vscode.window.showInputBox({
        placeHolder: "Name your snippet",
        prompt: "Snippet title",
      });
      if (userInput !== undefined) {
        if (userInput === "") {
          vscode.window.showErrorMessage(
            "A title for the snippet is mandatory!"
          );
        } else {
          // const tags = vscode.window.activeTextEditor?.document.languageId;
          // const fileSystemPath = vscode.window.activeTextEditor?.document.fileName;
          // const file = fileSystemPath?.split(/[\\/]/).pop();
          // const workspace = vscode.workspace.name;
          // const newSnippetUrl = `https://www.bing.com/search?q=${userInput}`;
          // const newSnippetUri = Uri.parse(newSnippetUrl);
          // vscode.env.openExternal(newSnippetUri);

          promptExecution(userInput).then((respPrompt) => {
            const message = `Prompt: ${respPrompt.question} \n Answer: ${respPrompt.answer}`;
            window.showInformationMessage(message);
          });
        }
      }
    }
  });

  vscode.commands.registerCommand("HIGWAY.TerminalTest", async () => {
    // The code you place here will be executed every time your command is executed
    let NEXT_TERM_ID = 1;
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      // User Input to name saved snippet
      let userInput = await vscode.window.showInputBox({
        placeHolder: "Name your snippet",
        prompt: "Snippet title",
      });
      if (userInput !== undefined) {
        if (userInput === "") {
          vscode.window.showErrorMessage(
            "Terminal command to execute is mandatory!"
          );
        } else {
          const terminal = vscode.window.createTerminal(
            `Ext Terminal #${NEXT_TERM_ID++}`
          );
          terminal.sendText(`${userInput}`);
        }
      }
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
}
