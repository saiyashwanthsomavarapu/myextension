import { Link, makeStyles, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components'
import { IColumnDefinition } from 'webview-ui/models/model';

interface ITableProps {
    headers: IColumnDefinition[],
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
                        headers.map((column: IColumnDefinition) => (
                            <TableHeaderCell>{column.name}</TableHeaderCell>
                        ))
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {body.length > 0 && body.map((item: any, index: number) => (
                    <TableRow key={index}>
                        {headers.map((column: IColumnDefinition) => (
                            <TableCell>

                                {column.type === 'text' && <TableCellLayout> {item[column.fieldName]}</TableCellLayout>}
                                {column.type === 'link' && <TableCellLayout>
                                    <Link href={item[column?.linkField || column.fieldName]}>
                                        click here
                                    </Link>
                                </TableCellLayout>}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default TableComponent