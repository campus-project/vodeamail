// /* eslint-disable react-hooks/exhaustive-deps */
//
// import React, { useCallback, useMemo } from "react";
// import {
//   Box,
//   Grid,
//   Step,
//   StepLabel,
//   Stepper,
//   Typography,
// } from "@material-ui/core";
// import MuiButtonIconRounded from "../../../components/ui/button/MuiButtonIconRounded";
// import { NavigateBefore } from "@material-ui/icons";
// import { useNavigate, useParams } from "react-router";
// import { useTranslation } from "react-i18next";
// import { useIsMounted } from "../../../utilities/hooks";
// import useActiveOptions from "../../../utilities/hooks/useActiveOptions";
// import { useSnackbar } from "notistack";
// import { CampaignEmail } from "../../../models/CampaignEmail";
// import FormAction from "../../../components/ui/form/MuiFormAction";
// import { useForm } from "react-hook-form";
// import { Group } from "../../../models";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import CampaignEmailRepository from "../../../repositories/CampaignEmailRepository";
// import { AxiosResponse } from "axios";
// import { Resource } from "../../../contracts";
// import Loading from "../../../components/ui/Loading";
// import { mapHookFormErrors } from "../../../utilities/helpers";
//
// const defaultValues: CampaignEmail = {
//   name: "",
//   description: "",
//   is_visible: 1,
//   contact_ids: [],
// };
//
// const CampaignForm: React.FC<any> = () => {
//   const { id } = useParams();
//   const { t } = useTranslation();
//   const isMounted = useIsMounted();
//   const navigate = useNavigate();
//   const { activeOptions } = useActiveOptions();
//   const { enqueueSnackbar } = useSnackbar();
//
//   const [step, setStep] = React.useState(0);
//   const [steps, setSteps] = React.useState<string[]>([
//     t("pages:campaign.step.setting"),
//     t("pages:campaign.step.design"),
//     t("pages:campaign.step.preview"),
//   ]);
//
//   const [data, setData] = React.useState<CampaignEmail>(defaultValues);
//   const [onFetchData, setOnFetchData] = React.useState<boolean>(Boolean(id));
//   const [loading, setLoading] = React.useState<boolean>(false);
//
//   const loadData = useCallback(async () => {
//     if (!id) {
//       return;
//     }
//
//     if (isMounted.current) {
//       setOnFetchData(true);
//     }
//
//     await CampaignEmailRepository.show(id)
//       .then((resp: AxiosResponse<Resource<Group>>) => {
//         const { data: group } = resp.data;
//
//         Object.assign(group, {
//           description: group.description === null ? "" : group.description,
//         });
//
//         setData(group);
//
//         if (isMounted.current) {
//           setOnFetchData(false);
//         }
//       })
//       .catch((e: any) => {
//         const errorTranslation = e?.response?.status
//           ? `common:error.${e.response.status}`
//           : "common:error.other";
//
//         enqueueSnackbar(t(errorTranslation), {
//           variant: "error",
//         });
//
//         if (isMounted.current) {
//           setOnFetchData(false);
//         }
//       });
//   }, [false]);
//
//   const { handleSubmit, errors, setError, control, reset } = useForm<Group>({
//     mode: "onChange",
//     resolver: yupResolver(
//       yup.object().shape({
//         name: yup.string().required(),
//       })
//     ),
//     defaultValues: useMemo(() => {
//       (async () => {
//         await loadData();
//       })();
//
//       return data;
//     }, [id, loadData]),
//   });
//
//   const onSubmit = async (formData: Group) => {
//     setLoading(true);
//
//     console.log(formData);
//
//     await (id
//       ? CampaignEmailRepository.update(id, formData)
//       : CampaignEmailRepository.create(formData)
//     )
//       .then(() => {
//         if (isMounted.current) {
//           setLoading(false);
//         }
//
//         enqueueSnackbar(
//           t("common:successfully_created", {
//             label: t("pages:group.title"),
//           }),
//           {
//             variant: "success",
//           }
//         );
//
//         navigate(-1);
//       })
//       .catch((e: any) => {
//         if (isMounted.current) {
//           setLoading(false);
//
//           if (e?.response?.data?.errors) {
//             const errors = mapHookFormErrors(e.response.data.errors);
//             Object.keys(errors).forEach((key: any) =>
//               setError(key, errors[key])
//             );
//           } else {
//             const errorTranslation = e?.response?.status
//               ? `common:error.${e.response.status}`
//               : "common:error.other";
//
//             enqueueSnackbar(t(errorTranslation), {
//               variant: "error",
//             });
//           }
//         }
//       });
//   };
//
//   return (
//     <>
//       {onFetchData ? <Loading /> : null}
//       <Box
//         mb={3}
//         display={"flex"}
//         flexDirection={"row"}
//         alignItems={"center"}
//         style={onFetchData ? { display: "none" } : {}}
//       >
//         <Box mr={1.5}>
//           <MuiButtonIconRounded onClick={() => navigate(-1)}>
//             <NavigateBefore />
//           </MuiButtonIconRounded>
//         </Box>
//         <Typography variant={"h5"}>
//           {t("common:create_label", {
//             label: t("pages:campaign.title"),
//           })}
//         </Typography>
//       </Box>
//
//       <Grid container spacing={3}>
//         <Grid item md={6} xs={12}>
//           <Stepper alternativeLabel activeStep={step}>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel StepIconComponent={CampaignStepIcon}>
//                   {label}
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Grid>
//
//         <Grid item xs={12}>
//           {step === 0 ? <FormSetting /> : null}
//           {step === 1 ? <FormDesign /> : null}
//           {step === 2 ? <FormPreview /> : null}
//         </Grid>
//
//         <Grid item md={8} xs={12}>
//           <FormAction
//             title={t("common:save_changes")}
//             cancel={t("common:cancel")}
//             save={t("common:save")}
//             onCancel={() => navigate(-1)}
//             onSave={handleSubmit(onSubmit)}
//             saveDisable={loading}
//             saveLoading={loading}
//           />
//         </Grid>
//       </Grid>
//     </>
//   );
// };
//
// const CampaignStepIcon: React.FC<any> = (props) => {
//   const icons = ["vicon-new-document", "vicon-design", "vicon-inspection"];
//
//   return <i className={`${icons[props.icon - 1]} nav-icon`} />;
// };
//
// const FormSetting: React.FC<any> = () => {
//   return <div>step 1</div>;
// };
//
// const FormDesign: React.FC<any> = () => {
//   return <div>step 2</div>;
// };
//
// const FormPreview: React.FC<any> = () => {
//   return <div>step 3</div>;
// };
//
// export default CampaignForm;

const Form = () => {
  return <div />;
};

export default Form;
