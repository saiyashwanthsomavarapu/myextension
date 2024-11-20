import { URLS } from "./appConstants";

interface IPayload {
    [key: string]: string;
}

/**
 * Posts a message to the VSCode extension to fetch API data.
 *
 * @param {string} serviceName - The name of the service to fetch data from.
 * @param {IPayload} payload - The query parameters to send to the API.
 */
export const apiRequest = (serviceName:string, payload: IPayload) => {
  window.vscode.postMessage({
    command: "fetchApiData",
    payload: {
      serviceName,
      apiQuery: URLS[serviceName as keyof typeof URLS],
      queryString: payload
    },
  });
};

/**
 * Extracts the relevant data from the API response payload.
 *
 * The structure of the payload varies depending on the service name.
 * For example, the payload for the Dynatrace service contains an array of
 * objects under the `data` key, while the payload for the Blazemeter service
 * contains an object with key `AggregateReport`.
 *
 * This function takes the payload as an argument and returns the relevant data.
 *
 * @param {any} payload - The API response payload.
 * @returns {any[]} The relevant data from the payload.
 */
export const getApiData = (payload: any) => {
  switch (payload.serviceName) {
    case 'dynatrace':
      return payload.metrics.data;
    case 'blazemeter':
      return payload.metrics['AggregateReport'];
    case 'serviceMap':
      return [{answer: payload.metrics['llmResponse'].answer }];
    default:
      return [];
  }
};

/**
 * Gets the current state of the webview.
 *
 * The state is an object that is persisted even when the user closes the webview.
 * It can be used to store data that should be preserved between sessions.
 *
 * @returns {Object} The current state of the webview.
 */
export const getState = () => {
  return window.vscode.getState();
};

/**
 * Sets the state of the webview.
 *
 * The state is an object that is persisted even when the user closes the webview.
 * It can be used to store data that should be preserved between sessions.
 *
 * If the state is null, the webview state is cleared.
 *
 * @param {Object} state - The state to be set.
 */
export const setState = (state: Object) => {
  window.vscode.setState({...(getState() ?? {}), ...state});
};

/**
 * Clears the webview state.
 *
 * When the state is cleared, all data stored in the state is deleted.
 */
export const clearState = () => {
  window.vscode.setState(null);
};