import AWS from "aws-sdk";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;

if (accessKeyId && secretAccessKey && region) {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region,
  });
}

const s3 = new AWS.S3({ signatureVersion: "v4" });

export interface UploadInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

function assertS3Config() {
  if (!bucketName || !accessKeyId || !secretAccessKey || !region) {
    throw new Error("Missing AWS S3 environment variables.");
  }
}

function getBucketName(): string {
  assertS3Config();
  return bucketName as string;
}

export async function uploadFile(file: UploadInput): Promise<{ key: string; url: string }> {
  const bucket = getBucketName();

  const key = `documents/${Date.now()}-${file.fileName.replace(/\s+/g, "-").toLowerCase()}`;
  const result = await s3
    .upload({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
      ACL: "private",
    })
    .promise();

  return {
    key,
    url: result.Location,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const bucket = getBucketName();

  await s3
    .deleteObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();
}
