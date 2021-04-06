import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useIsMounted } from "./index";

const useDeleteResource = (repository: any) => {
  const { t } = useTranslation();
  const isMounted = useIsMounted();
  const confirm = useConfirm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleDelete = (id: string) => {
    return new Promise(async (resolve, reject) => {
      let isDeleteConfirmed = 0;

      await confirm({
        title: t("common:delete_confirmation_message"),
        description: t("common:delete_impact_message"),
        confirmationText: t("common:delete_confirmation_text"),
        cancellationText: t("common:delete_cancellation_text"),
        cancellationButtonProps: { color: "primary" },
        confirmationButtonProps: { color: "default" },
      })
        .then(() => (isDeleteConfirmed = 1))
        .catch(() => (isDeleteConfirmed = 0));

      if (isDeleteConfirmed) {
        deleteResource(id)
          .then((resp) => resolve(resp))
          .catch((e) => reject(e));
      }
    });
  };

  const deleteResource = (id: string) => {
    return new Promise((resolve, reject) => {
      const loadingKey = enqueueSnackbar(t("common:delete_loading_message"), {
        variant: "default",
        autoHideDuration: 5000,
        preventDuplicate: true,
      });

      repository
        .delete(id)
        .then((resp: any) => {
          if (isMounted.current) {
            closeSnackbar(loadingKey);
            enqueueSnackbar(t("common:delete_successfully"), {
              variant: "success",
            });
          }

          resolve(resp);
        })
        .catch((e: any) => {
          if (isMounted.current && e?.response?.data?.errors) {
            closeSnackbar(loadingKey);
            enqueueSnackbar(t("common:delete_failed"), {
              variant: "error",
            });
          }

          reject(e);
        });
    });
  };

  return { handleDelete, deleteResource };
};

export default useDeleteResource;
