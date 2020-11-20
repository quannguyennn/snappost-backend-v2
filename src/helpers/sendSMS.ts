/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import AWS from 'aws-sdk';
import libphonenumber, { PhoneNumberFormat } from 'google-libphonenumber';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY_ACCESS,
  region: process.env.AWS_SNS_REGION,
});

export async function sendSMS(message: string, number: string) {
  const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
  const numberV = phoneUtil.parseAndKeepRawInput(number, 'VN');
  const phone = phoneUtil.format(numberV, PhoneNumberFormat.E164);
  console.log(phone);
  const params = {
    Message: message,
    PhoneNumber: phone,
    MessageAttributes: {
      'AWS.SNS.SMS.SenderID': {
        DataType: 'String',
        StringValue: 'KLC',
      },
    },
  };
  const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

  try {
    const result = await publishTextPromise;
    console.log('ok', result);
    return true;
  } catch (err) {
    console.log('errr', err);
    return false;
  }
}
