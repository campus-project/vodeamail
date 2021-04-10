import { mapHookFormErrors } from "./hook-form.helper";

export const axiosErrorHandler = (e: any, enqueueSnackbar: any, t: any) => {
  const errorTranslation = e?.response?.status
    ? `common:error.${e.response.status}`
    : "common:error.other";

  enqueueSnackbar(t(errorTranslation), {
    variant: "error",
  });
};

export const axiosErrorSaveHandler = (
  e: any,
  setError: any,
  enqueueSnackbar: any,
  t: any
) => {
  if (e?.response?.data?.errors) {
    const errors = mapHookFormErrors(e.response.data.errors);
    Object.keys(errors).forEach((key: any) => setError(key, errors[key]));
  } else {
    const errorTranslation = e?.response?.status
      ? `common:error.${e.response.status}`
      : "common:error.other";

    enqueueSnackbar(t(errorTranslation), {
      variant: "error",
    });
  }
};

export const axiosErrorLoadDataHandler = (
  e: any,
  enqueueSnackbar: any,
  t: any
) => {
  const errorTranslation = e?.response?.status
    ? `common:error.${e.response.status}`
    : "common:error.other";

  enqueueSnackbar(t(errorTranslation), {
    variant: "error",
  });
};
