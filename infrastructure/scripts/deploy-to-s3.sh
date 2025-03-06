#!/bin/bash
# S3にウェブサイトをデプロイするスクリプト

echo "Starting deployment process..."

# S3バケット名を取得
BUCKET=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME}-s3-resources --query "Stacks[0].Outputs[?ExportName=='${STACK_NAME}-s3-resources-WebsiteBucketName'].OutputValue" --output text)

if [ -z "$BUCKET" ]; then
  echo "Error: Could not retrieve bucket name"
  exit 1
fi

echo "Found bucket: $BUCKET"

# S3バケットに同期
aws s3 sync . s3://$BUCKET/ --delete

echo "Deployment completed successfully"
