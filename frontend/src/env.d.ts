declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_S3_BUCKET_NAME: string;
    REACT_APP_AWS_REGION: string;
  }
}
