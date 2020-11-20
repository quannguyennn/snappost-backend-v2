/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PORT: string;
    readonly DATABASE_PORT?: string;
    readonly DATABASE_HOST?: string;
    readonly DATABASE_USER?: string;
    readonly DATABASE_PASSWORD?: string;
    readonly DATABASE_NAME?: string;
    readonly DATABASE_ACL_NAME?: string;
    readonly DATABASE_SYNC?: 'true' | 'false';
    readonly DATABASE_LOGGING?: 'true' | 'false';

    // Amazon
    readonly AWS_ACCESS_KEY_ID?: string;
    readonly AWS_SECRET_KEY_ACCESS?: string;
    readonly AWS_S3_BUCKET_NAME?: string;
    readonly AWS_SES_REGION?: string;
    readonly AWS_SNS_REGION?: string;
    readonly AWS_SES_SENDER_EMAIL: string;

    readonly GOOGLE_DOMAIN: string;
    readonly KAKAO_DOMAIN: string;
    readonly NAVER_DOMAIN: string;
    readonly PAYCO_DOMAIN: string;
    readonly PAYCO_CLIENT_ID: string;
  }
}
