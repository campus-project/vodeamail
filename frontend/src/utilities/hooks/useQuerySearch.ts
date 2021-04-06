import * as qs from "query-string";

const useQuerySearch = () => {
  return qs.parse(window.location.search);
};

export default useQuerySearch;
