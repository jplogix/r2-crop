import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

let r2Client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables.",
      )
    }

    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  return r2Client
}

export async function uploadToR2(buffer: Buffer, key: string, bucketName: string): Promise<string> {
  const client = getR2Client()

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  })

  await client.send(command)

  // Using custom R2 domain for public access
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || "r2crop.unifywebservices.com"
  const publicUrl = `https://${publicDomain}/${key}`

  return publicUrl
}
