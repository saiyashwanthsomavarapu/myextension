import { useEffect, useState } from 'react';
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
} from "@fluentui/react-components";

function App() {
  const [metricsData, setMetricsData] = useState<any>([])

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const transferedData = event.data;
      if (transferedData.command === 'sendData') {
        // Update state with the data from the message
        setMetricsData(transferedData.payload.mertics)
      }
    });

  }, [])

  return (
    <>
      <Table arial-label="Default table" style={{ minWidth: "510px" }}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell >
              Id
            </TableHeaderCell>
            <TableHeaderCell >
              Host
            </TableHeaderCell>
            <TableHeaderCell >
              Timestamps
            </TableHeaderCell>
            <TableHeaderCell >
              Values
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metricsData.map((metrics: any, index: number) => (
            <TableRow key={index}>
              <TableCell>
                <TableCellLayout>
                  {index + 1}
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>
                  {metrics.dimensionsMap['dt.entity.host']}
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>
                  {metrics.timestamps?.join()}
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>
                  {metrics.values.join()}
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default App
