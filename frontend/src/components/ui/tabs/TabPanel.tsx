import React from "react";
import { Box } from "@material-ui/core";

export interface TabPanelProps {
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = ({
  value,
  index,
  children,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default TabPanel;
