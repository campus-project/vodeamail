import { State } from "@hookstate/core";

export const $cloneState = (value: State<any>) => {
  return $clone(value.value);
};

export const $clone = (value: any) => {
  return JSON.parse(JSON.stringify(value));
};
