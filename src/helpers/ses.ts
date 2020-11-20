import AWS, { SES } from 'aws-sdk';
import { SendEmailRequest } from 'aws-sdk/clients/ses';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ACCESS,
});

const ses = new SES({ apiVersion: 'latest', region: process.env.AWS_SES_REGION });

export type CreateMailParam = {
  sender: string;
  receiver: string[];
  subject: string;
  content: string;
};
export const createEmailParam = ({ sender, receiver, subject, content }: CreateMailParam): SendEmailRequest => {
  const params: SendEmailRequest = {
    Destination: {
      ToAddresses: receiver,
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: content,
        },
        // Text: {
        //     Charset: 'UTF-8',
        //     Data: content,
        // },
      },
    },
    Source: sender,
  };
  return params;
};
export async function sendEmail(params: SendEmailRequest) {
  try {
    const sesResponse = await ses.sendEmail(params).promise();
    return {
      succces: true,
      response: sesResponse,
    };
  } catch (error) {
    throw new Error('Mail server error');
  }
}
