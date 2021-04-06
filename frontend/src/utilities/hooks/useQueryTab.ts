import React, { useEffect } from "react";
import { insertQuerySearch } from "../helpers/query-search.helper";
import { useQuerySearch } from "./index";

const useQueryTab = () => {
  const { tab: queryTab = 0 } = useQuerySearch();
  const [tab, setTab] = React.useState<number>(
    queryTab !== null && queryTab <= 1 ? Number(queryTab) : 0
  );

  useEffect(() => {
    setTimeout(() => {
      insertQuerySearch("tab", tab);
    }, 1);
  }, [tab]);

  return {
    tab,
    setTab,
  };
};

export default useQueryTab;
