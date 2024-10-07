import { makeStyles, Select, tokens, useId } from "@fluentui/react-components";
import type { SelectProps } from "@fluentui/react-components";

interface SelectBoxProps extends SelectProps {
    label: string;
    options: string[];
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
                    {options.map((option: string) => (
                        <option key={option} value={option.toLowerCase()}>
                            {option}
                        </option>
                    ))}
                </Select>
            </div>
        </div>
    );
};