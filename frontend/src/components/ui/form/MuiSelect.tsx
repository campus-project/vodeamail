import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { MenuItem, Select, SelectProps } from "@material-ui/core";
import React from "react";

export interface MuiOption {
  value: string | ReadonlyArray<string> | number;
  name: string;
}

export interface MuiSelectProps extends SelectProps {
  options: MuiOption[];
}

const MuiSelect = withStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
)(({ onChange, options, ...props }: MuiSelectProps) => (
  <Select
    variant="outlined"
    fullWidth
    {...(onChange
      ? {
          onChange: (event: any, value: any) =>
            onChange(event, value.props.value),
        }
      : {})}
    {...props}
  >
    {options.map((option, index) => (
      <MenuItem value={option.value} key={index}>
        {option.name}
      </MenuItem>
    ))}
  </Select>
));

export default MuiSelect;
