import _, { DebounceSettings } from "lodash";
import { useRef } from "react";

const useDebounce = (func: any, wait?: number, options?: DebounceSettings) => {
  return useRef(_.debounce(func, wait, options)).current;
};

export default useDebounce;
