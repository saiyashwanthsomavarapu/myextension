export interface IColumnDefinition {
  fieldName: string;
  name: string;
}
export const model = {
  dynatrace: [
    {
      fieldName: "id",
      name: "Id",
    },
    {
      fieldName: "host_name",
      name: "Host Name",
    },
    { fieldName: "matric_value", name: "Matric Value" },
  ] as IColumnDefinition[],
  blazemeter: [
    {
      fieldName: "test_id",
      name: "Test Id",
    },
    {
      fieldName: "test_name",
      name: "Test Name",
    },
  ] as IColumnDefinition[],
};
