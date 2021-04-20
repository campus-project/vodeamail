import { EmailTemplate } from "../../../models";
import EmailTemplateRepository from "../../../repositories/EmailTemplateRepository";
import { AxiosResponse } from "axios";
import { Resource } from "../../../contracts";

export const EMAIL_CAMPAIGN_SET_EMAIL_TEMPLATE =
  "[EMAIL_CAMPAIGN] EMAIL CAMPAIGN SET EMAIL TEMPLATE";

export function setEmailCampaignTemplate(emailTemplates: EmailTemplate[]) {
  return {
    type: EMAIL_CAMPAIGN_SET_EMAIL_TEMPLATE,
    payload: emailTemplates,
  };
}

export function loadEmailTemplates() {
  return async (dispatch: any) => {
    await EmailTemplateRepository.all({
      order_by: "updated_at",
      sorted_by: "desc",
    })
      .then((resp: AxiosResponse<Resource<EmailTemplate[]>>) => {
        const { data: templates } = resp.data;

        dispatch(setEmailCampaignTemplate(templates));
      })
      .catch();
  };
}
