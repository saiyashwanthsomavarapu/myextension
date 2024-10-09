import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    TableBody,
    TableCell,
    TableRow,
    Table,
    TableHeader,
    TableHeaderCell,
    TableCellLayout,
    FluentProvider,
    webDarkTheme,
    makeStyles,
    Button,
} from "@fluentui/react-components";
import './main.css';
import { SelectBox } from './components/SelectBox';

const styles = makeStyles({
    root: {
        backgroundColor: "var(--vscode-activityBar-background)",
        // color: "var(--vscode-editor-foreground)",
    },
    btn: {
        width: "100%",
        marginTop: "20px",
    },
    table: {
        marginTop: "20px",
    }
})

function Sidebar() {
    const [metricsData, setMetricsData] = useState<any>([]);
    const [ymlData, setYmlData] = useState<any>([]);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [selectService, setSelectServices] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);
    const style = styles();
    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
    const backgroundColor = getComputedStyle(document.body).getPropertyValue('--background-color');


    useEffect(() => {
        window.addEventListener('message', (event) => {
            console.log(event.data);
            const transferedData = event.data;
            if (transferedData.command === 'sendData') {
                setMetricsData(transferedData.payload.mertics)
            }
            if (transferedData.command === 'services') {
                console.log(transferedData.payload.ser);
                setYmlData(transferedData.payload.services);
            }
        });
    }, [])

    const handleSubmit = () => {
        window.vscode.postMessage({
            command: 'fetchApiData',
            payload: { metrics: metricsData, type: selectedOption },
        });
    }

    return (
        <div className={style.root}>
            <SelectBox label="Select service" options={Object.keys(ymlData)} onChange={(event) => setSelectServices(event.target.value)} />
            {selectService !== '' && <SelectBox label="Select Option" options={ymlData[selectService].options} onChange={(event) => setSelectedOption(event.target.value)} />}
            <Button className={style.btn} appearance="primary" onClick={handleSubmit}>Example</Button>
            <Table className={style.table} arial-label="Default table" style={{ minWidth: "510px" }}>
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
                                    {metrics.dimensionMap['dt.entity.host']}
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
        </div>
    )
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <FluentProvider theme={webDarkTheme}>
            <Sidebar />
        </FluentProvider>
    </React.StrictMode>
)