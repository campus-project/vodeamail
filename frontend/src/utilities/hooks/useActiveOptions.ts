import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActiveOption } from "../../contracts";

export const useIsMounted = () => {
  const { t } = useTranslation();

  const [activeOptions, setActiveOptions] = useState<ActiveOption[]>([
    { value: 1, name: t("common:active") },
    { value: 0, name: t("common:in_active") },
  ]);

  return { activeOptions, setActiveOptions };
};

export default useIsMounted;
