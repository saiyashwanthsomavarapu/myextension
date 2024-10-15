import { makeStyles, Select, tokens, useId } from "@fluentui/react-components";
import type { SelectProps } from "@fluentui/react-components";

interface IOption {
    label: string;
    value: string;
}
interface SelectBoxProps extends SelectProps {
    label: string;
    options: IOption[];
}

const useStyles = makeStyles({
    base: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "500px",
    },
    field: {
        display: "grid",
        gridRowGap: tokens.spacingVerticalXXS,
        marginTop: tokens.spacingVerticalMNudge,
    },
});



export const SelectBox = (props: SelectBoxProps) => {
    const { label, options } = props;
    const selectId = useId();
    const styles = useStyles();


    return (
        <div className={styles.base}>
            <div className={styles.field}>
                <label htmlFor={selectId}>{label}</label>
                <Select id={selectId} {...props}>
                    <option value="">Select an option</option>
                    {options.map((option: IOption, index: number) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </div>
        </div>
    );
};