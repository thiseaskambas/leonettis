import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

function getSevallaConfig() {
  const endpoint = process.env.SEVALLA_ENDPOINT;
  const bucket = process.env.SEVALLA_BUCKET;
  const accessKey = process.env.SEVALLA_ACCESS_KEY;
  const secretKey = process.env.SEVALLA_SECRET_KEY;
  const publicUrl = process.env.SEVALLA_PUBLIC_URL;

  if (!endpoint) {
    throw new Error('SEVALLA_ENDPOINT is not configured');
  }
  if (!bucket) {
    throw new Error('SEVALLA_BUCKET is not configured');
  }
  if (!accessKey || !secretKey) {
    throw new Error('Sevalla credentials are not configured');
  }
  if (!publicUrl) {
    throw new Error('SEVALLA_PUBLIC_URL is not configured');
  }

  return { endpoint, bucket, accessKey, secretKey, publicUrl };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const { endpoint, accessKey, secretKey } = getSevallaConfig();
    s3Client = new S3Client({
      endpoint,
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  return s3Client;
}

export async function uploadToSevalla(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string
): Promise<string> {
  const { bucket, publicUrl } = getSevallaConfig();
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${publicUrl.replace(/\/$/, '')}/${key}`;
}

export async function deleteFromSevalla(key: string): Promise<void> {
  const { bucket } = getSevallaConfig();
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function getSevallaPublicUrl(): string {
  return getSevallaConfig().publicUrl.replace(/\/$/, '');
}
