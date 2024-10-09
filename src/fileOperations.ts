import * as fs from "fs";
import * as path from "path";
import { workspace, window, Webview, ConfigurationTarget } from "vscode";
import { parse } from "yaml";

export async function readYAMLFile(webview: Webview) {
  const config = workspace.getConfiguration("config");
  const yamlFilePath = config.get<string>("yamlFilePath", "");

  if (!yamlFilePath) {
    window.showErrorMessage("YAML file path is not set in user settings.");
    return;
  }

  // Read the YAML file
  try {
    const fileContent = fs.readFileSync(yamlFilePath, "utf8");
    const data: any = parse(fileContent);

    // Now 'data' contains the parsed YAML content
    window.showInformationMessage("YAML file read successfully.");

    // Process the extracted data as needed
    // For demonstration, let's log the data to the console
    console.log(data);

    // If you want to display specific data from the YAML
    if (typeof data === "object") {
      setTimeout(() => {
        webview.postMessage({
          command: "services",
          payload: { services: data.service },
        });
      }, 1000);

      window.showInformationMessage("YAML file read successfully.");
      return data;
    }
  } catch (error: any) {
    window.showErrorMessage(`Error reading YAML file: ${error.message}`);
  }
}

export async function selectYAMLFilePath() {
  const fileUri = await window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    openLabel: "Select YAML File",
    filters: { "YAML files": ["yml", "yaml"] },
  });

  if (fileUri && fileUri.length > 0) {
    const selectedFilePath = fileUri[0].fsPath;
    const selectedFileName = path.basename(selectedFilePath);
    const desiredFileName = "config.yaml";

    // Check if the selected file name matches the desired file name
    if (selectedFileName !== desiredFileName) {
      // You can choose to rename it, or just alert the user
      const newFilePath = path.join(
        path.dirname(selectedFilePath),
        desiredFileName
      );

      // Optionally rename the file
      fs.rename(selectedFilePath, newFilePath, (err) => {
        if (err) {
          window.showErrorMessage("Error renaming file: " + err.message);
          return;
        }
      });

      window.showInformationMessage(`File renamed to: ${desiredFileName}`);
      // Use the new file path
      await saveFilePathToSettings(newFilePath);
    } else {
      // If the file name is correct, use it directly
      await saveFilePathToSettings(selectedFilePath);
    }
  } else {
    window.showErrorMessage("No file selected.");
  }
}

async function saveFilePathToSettings(filePath: string) {
  const config = workspace.getConfiguration("config");
  await config.update("yamlFilePath", filePath, ConfigurationTarget.Global);
  window.showInformationMessage(`YAML file path set globally to: ${filePath}`);
}
