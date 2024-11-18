export interface IColumnDefinition {
  fieldName: string;
  type: string;
  linkField?: string;
  name: string;
}
export const model = {
  dynatrace: [
    {
      fieldName: "id",
      name: "Id",
      type: 'text'
    },
    {
      fieldName: "host_name",
      name: "Host Name",
      type: 'text'
    },
    { fieldName: "matric_value", name: "Matric Value" , type: 'text'},
  ] as IColumnDefinition[],
  blazemeter: [
    {
      fieldName: "labelName",
      name: "Label name",
      linkField: "labelName",
      type: 'link'
    },
    {
      fieldName: "maxResponseTime",
      name: "Maximum time",
      type: 'text'
    },
    {
      fieldName: "minResponseTime",
      name: "Minimum time ",
      type: 'text'
    },
  ] as IColumnDefinition[],
  serviceMap: [
    {
      fieldName: "answer",
      name: "Answer",
      type: 'text'
    }
  ] as IColumnDefinition[]
};
