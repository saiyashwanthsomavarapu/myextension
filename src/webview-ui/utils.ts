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

export const getApiData = (payload: any) => {
  switch (payload.serviceName) {
    case 'dynatrace':
      return payload.metrics.data;
    case 'blazemeter':
      return payload.metrics['AggregateReport'];
    case 'serviceMap':{
      console.log(payload.metrics)
      return [{sessionId:payload.metrics['llmResponse'].sessionId }];
    }
    default:
      return [];
  }
};