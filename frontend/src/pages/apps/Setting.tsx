import React from "react";
import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const Setting: React.FC<any> = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: "en-US" | "id-ID") => {
    i18n.changeLanguage(lang);
  };
  return (
    <>
      <div>Setting</div>

      <hr />
      <div>
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={() => changeLanguage("id-ID")}
        >
          Indonesia
        </Button>

        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={() => changeLanguage("en-US")}
        >
          English US
        </Button>
      </div>
    </>
  );
};

export default Setting;
