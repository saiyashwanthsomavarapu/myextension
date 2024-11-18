import { List, ListItem } from "@fluentui/react-list-preview";
import { useStyles } from "../styles/chatLayout.styles";

interface ISuggestionProps {
    suggestions: string[];
    handleSuggestionClick: (suggestion: string) => void;
}

export const Suggestions = (props: ISuggestionProps) => {
    const { suggestions, handleSuggestionClick } = props;
    const classes = useStyles();
    return (
        <div className={classes.suggestions}>
            <List>
                {suggestions.map((suggestion) => (
                    <ListItem
                        key={suggestion}
                        className={classes.suggestionItem}
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </ListItem>
                ))}
            </List>
        </div>
    );
}