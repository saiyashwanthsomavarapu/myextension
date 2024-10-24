interface IPayload {
  apiQuery: string;
  serviceName: string;
  queryString: {
    [key: string]: string;
  };
}
export const apiRequest = (payload: IPayload) => {
  window.vscode.postMessage({
    command: "fetchApiData",
    payload,
  });
};
