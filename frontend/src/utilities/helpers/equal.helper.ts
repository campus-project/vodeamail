import * as _ from "lodash";

export const equalNumberString = (
  val: string | number,
  comparison: string | number
): boolean => {
  return _.isEqual(val, comparison);
};
