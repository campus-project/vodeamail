import React from "react";
import AntTabs from "./AntTabs";
import AntTab from "./AntTab";

interface IMuiTabs {
  value: any;
  name: string;
  tabs: string[];
  onChange: (value: any) => void;
}

const MuiTabs: React.FC<IMuiTabs> = ({ value, name, onChange, tabs }) => {
  return (
    <AntTabs
      value={value}
      onChange={(event: React.ChangeEvent<{}>, newValue: number) =>
        onChange(newValue)
      }
      aria-label={`${name} tab`}
    >
      {tabs.map((tab) => (
        <AntTab key={tab} label={tab} />
      ))}
    </AntTabs>
  );
};

export default MuiTabs;
