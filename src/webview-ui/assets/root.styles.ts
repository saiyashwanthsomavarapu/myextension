import { makeStyles, tokens } from "@fluentui/react-components";

export const rootStyles = makeStyles({
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
  hideArrows: {
    // Hide the arrow icons in most modern browsers
    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
      display: "none",
      "-webkit-appearance": "none",
      margin: 0,
    },
    // Hide the arrow icons in Firefox
    "&[type=number]": {
      "-moz-appearance": "textfield",
    },
  },
});
