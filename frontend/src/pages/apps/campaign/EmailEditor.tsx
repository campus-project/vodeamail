/* eslint-disable react-hooks/exhaustive-deps */

import React, { useMemo, useRef, useState } from "react";
import EmailEditor from "react-email-editor";
import Component, {
  HtmlExport,
  MergeTag,
  UnlayerOptions,
} from "react-email-editor";
import { Box, Button } from "@material-ui/core";
import useStyles from "./style";
import axios from "axios";

const PageEmailEditor: React.FC<any> = () => {
  const classes = useStyles();
  const emailEditorRef = useRef(null);
  const [eventRegistered, setEventRegistered] = useState<boolean>(false);

  const emailEditorOptions: UnlayerOptions = {
    projectId: 8698,
    displayMode: "email",
    mergeTags: emailEditorAvailableTags,
  };

  const exportHtml = () => {
    if (emailEditorRef.current !== null) {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.exportHtml(async (data: HtmlExport) => {
        const { design } = data;

        const emailData = JSON.stringify({
          displayMode: "email",
          design: design,
          mergeTags: emailEditorValueTags,
        });

        await axios
          .post("https://api.unlayer.com/v2/export/image", emailData, {
            headers: {
              Authorization:
                "Basic QXQ2QTZ3d2haeGZwd2JCdlBONG5sVXN4Vk9PUEZseHk4UTlqUUYzSFd0eEdqWlUzblFSV3FGdjVSMjBJbjY0Zw==",
            },
          })
          .then((resp) => {
            console.log(resp.data.data.url);
          })
          .catch((err) => console.error("error:" + err));
      });
    }
  };

  const onLoad = () => {
    if (emailEditorRef.current !== null) {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.loadDesign(design);
    }
  };

  useMemo(() => {
    if (emailEditorRef.current !== null && !eventRegistered) {
      const emailEditor = (emailEditorRef.current as unknown) as Component;
      emailEditor.addEventListener("design:updated", function (updates) {
        // Design is updated by the user

        emailEditor.exportHtml(function (data) {
          const { design } = data;
          console.log(design);
        });
      });

      setEventRegistered(true);
    }
  }, [emailEditorRef]);

  return (
    <Box className={classes.containerEmailWrapper}>
      <Box className={"container-control-button"}>
        <Button variant={"contained"} color={"primary"} onClick={exportHtml}>
          test
        </Button>
      </Box>
      <Box className={"container-email-editor"}>
        <EmailEditor
          ref={emailEditorRef}
          onLoad={onLoad}
          options={emailEditorOptions}
          appearance={{
            theme: "dark",
          }}
        />
      </Box>
    </Box>
  );
};

const emailEditorAvailableTags: MergeTag[] = [
  {
    name: "Contact",
    mergeTags: [
      { name: "Email", value: "{{ email }}" },
      { name: "Name", value: "{{ name }}" },
      { name: "Mobile Phone", value: "{{ mobile_phone }}" },
      { name: "Address Line 1", value: "{{ address_line_1 }}" },
      { name: "Address Line 2", value: "{{ address_line_2 }}" },
      { name: "Country", value: "{{ country }}" },
      { name: "Province", value: "{{ province }}" },
      { name: "City", value: "{{ city }}" },
      { name: "Postal Code", value: "{{ postal_code }}" },
    ],
  },
];

const emailEditorValueTags = {
  email: "example@mail.com",
  name: "John Doe",
  mobile_phone: "+628811223344",
  address_line_1: "Jln. Gremet No. 74",
  address_line_2: "Perumahan Gremet Indah ",
  country: "Indonesia",
  province: "Jawa Barat",
  city: "Bekasi",
  postal_code: "32757",
};

export default PageEmailEditor;

const design = {
  counters: {
    u_row: 6,
    u_column: 6,
    u_content_text: 8,
    u_content_image: 2,
    u_content_button: 1,
    u_content_social: 1,
  },
  body: {
    rows: [
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "text",
                values: {
                  containerPadding: "10px",
                  color: "#afb0c7",
                  textAlign: "center",
                  lineHeight: "170%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_1",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 170%;"><span style="font-size: 14px; line-height: 23.8px;">View Email in Browser</span></p>',
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_1",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_1",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "image",
                values: {
                  containerPadding: "20px",
                  src: {
                    url:
                      "https://cdn.templates.unlayer.com/assets/1597218426091-xx.png",
                    width: 537,
                    height: 137,
                    maxWidth: "32%",
                    autoWidth: false,
                  },
                  textAlign: "center",
                  altText: "Image",
                  action: {
                    name: "web",
                    values: {
                      href: "",
                      target: "_blank",
                    },
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_image_1",
                    htmlClassNames: "u_content_image",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_2",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "#ffffff",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_2",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "image",
                values: {
                  containerPadding: "40px 10px 10px",
                  src: {
                    url:
                      "https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png",
                    width: 335,
                    height: 93,
                    maxWidth: "26%",
                    autoWidth: false,
                  },
                  textAlign: "center",
                  altText: "Image",
                  action: {
                    name: "web",
                    values: {
                      href: "",
                      target: "_blank",
                    },
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_image_2",
                    htmlClassNames: "u_content_image",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideMobile: false,
                },
              },
              {
                type: "text",
                values: {
                  containerPadding: "10px",
                  color: "#e5eaf5",
                  textAlign: "center",
                  lineHeight: "140%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_3",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 140%;"><strong>T H A N K S&nbsp; &nbsp;F O R&nbsp; &nbsp;S I G N I N G&nbsp; &nbsp;U P !</strong></p>',
                  hideMobile: false,
                },
              },
              {
                type: "text",
                values: {
                  containerPadding: "0px 10px 31px",
                  color: "#e5eaf5",
                  textAlign: "center",
                  lineHeight: "140%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_4",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 140%;"><span style="font-size: 28px; line-height: 39.2px;"><strong><span style="line-height: 39.2px; font-size: 28px;">Verify Your E-mail Address&nbsp;</span></strong></span></p>',
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_3",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "#003399",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_3",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "text",
                values: {
                  containerPadding: "33px 55px",
                  color: "#000000",
                  textAlign: "center",
                  lineHeight: "160%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_6",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Hi, </span></p>\n<p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">You\'re almost ready to get started. Please click on the button below to verify your email address and enjoy exclusive cleaning services with us!&nbsp;</span></p>',
                  hideMobile: false,
                },
              },
              {
                type: "button",
                values: {
                  containerPadding: "10px",
                  href: {
                    name: "web",
                    values: {
                      href: "",
                      target: "_blank",
                    },
                  },
                  buttonColors: {
                    color: "#FFFFFF",
                    backgroundColor: "#ff6600",
                    hoverColor: "#FFFFFF",
                    hoverBackgroundColor: "#3AAEE0",
                  },
                  size: {
                    autoWidth: true,
                    width: "100%",
                  },
                  textAlign: "center",
                  lineHeight: "120%",
                  padding: "14px 44px 13px",
                  border: {},
                  borderRadius: "4px",
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_button_1",
                    htmlClassNames: "u_content_button",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<span style="font-size: 16px; line-height: 19.2px;"><strong><span style="line-height: 19.2px; font-size: 16px;">VERIFY YOUR EMAIL</span></strong></span>',
                  hideMobile: false,
                  calculatedWidth: 234,
                  calculatedHeight: 46,
                },
              },
              {
                type: "text",
                values: {
                  containerPadding: "33px 55px 60px",
                  color: "#000000",
                  textAlign: "center",
                  lineHeight: "160%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_7",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">Thanks,</span></p>\n<p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">The Company Team</span></p>',
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_4",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "#ffffff",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_4",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "text",
                values: {
                  containerPadding: "41px 55px 18px",
                  color: "#003399",
                  textAlign: "center",
                  lineHeight: "160%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_5",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 160%;"><span style="font-size: 20px; line-height: 32px;"><strong>Get in touch</strong></span></p>\n<p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">+11 111 333 4444</span></p>\n<p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">Info@YourCompany.com</span></p>',
                  hideMobile: false,
                },
              },
              {
                type: "social",
                values: {
                  containerPadding: "10px 10px 33px",
                  icons: {
                    iconType: "circle-black",
                    icons: [
                      {
                        url: "https://facebook.com/",
                        name: "Facebook",
                      },
                      {
                        url: "https://linkedin.com/",
                        name: "LinkedIn",
                      },
                      {
                        url: "https://instagram.com/",
                        name: "Instagram",
                      },
                      {
                        url: "https://youtube.com/",
                        name: "YouTube",
                      },
                      {
                        url: "https://email.com/",
                        name: "Email",
                      },
                    ],
                  },
                  align: "center",
                  spacing: 17,
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_social_1",
                    htmlClassNames: "u_content_social",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_5",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "#e5eaf5",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_5",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
      {
        cells: [1],
        columns: [
          {
            contents: [
              {
                type: "text",
                values: {
                  containerPadding: "10px",
                  color: "#fafafa",
                  textAlign: "center",
                  lineHeight: "180%",
                  linkStyle: {
                    inherit: true,
                    linkColor: "#0000ee",
                    linkHoverColor: "#0000ee",
                    linkUnderline: true,
                    linkHoverUnderline: true,
                  },
                  hideDesktop: false,
                  _meta: {
                    htmlID: "u_content_text_8",
                    htmlClassNames: "u_content_text",
                  },
                  selectable: true,
                  draggable: true,
                  duplicatable: true,
                  deletable: true,
                  text:
                    '<p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights &copy; Company All Rights Reserved</span></p>',
                  hideMobile: false,
                },
              },
            ],
            values: {
              _meta: {
                htmlID: "u_column_6",
                htmlClassNames: "u_column",
              },
              border: {},
              padding: "0px",
              backgroundColor: "",
            },
          },
        ],
        values: {
          displayCondition: null,
          columns: false,
          backgroundColor: "",
          columnsBackgroundColor: "#003399",
          backgroundImage: {
            url: "",
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false,
          },
          padding: "0px",
          hideDesktop: false,
          _meta: {
            htmlID: "u_row_6",
            htmlClassNames: "u_row",
          },
          selectable: true,
          draggable: true,
          duplicatable: true,
          deletable: true,
          hideMobile: false,
          noStackMobile: false,
        },
      },
    ],
    values: {
      backgroundColor: "#f9f9f9",
      backgroundImage: {
        url: "",
        fullWidth: true,
        repeat: false,
        center: true,
        cover: false,
      },
      contentWidth: "600px",
      contentAlign: "center",
      fontFamily: {
        label: "Cabin",
        value: "'Cabin',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Cabin:400,700",
        defaultFont: true,
      },
      preheaderText: "",
      linkStyle: {
        body: true,
        linkColor: "#0000ee",
        linkHoverColor: "#0000ee",
        linkUnderline: true,
        linkHoverUnderline: true,
      },
      _meta: {
        htmlID: "u_body",
        htmlClassNames: "u_body",
      },
    },
  },
  schemaVersion: 5,
};
