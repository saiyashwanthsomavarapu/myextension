import { makeStyles, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components'
import React from 'react'

interface ITableProps {
    headers: string[],
    body: any[]
}

const useStyles = makeStyles({
    table: {
        marginTop: "20px",
    },

});

function TableComponent(props: ITableProps) {
    const { headers, body } = props;
    const style = useStyles();
    return (
        <Table
            className={style.table}
            arial-label="Default table"
            style={{ minWidth: "510px" }}
        >
            <TableHeader>
                <TableRow>
                    {
                        headers.map((key: string) => (
                            <TableHeaderCell>{key}</TableHeaderCell>
                        ))
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {body.length > 0 && body.map((item: any, index: number) => (
                    <TableRow key={index}>
                        {headers.map((key: string) => (
                            <TableCell>
                                <TableCellLayout>{item[key]}</TableCellLayout>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default TableComponent