import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export type UploadType = 'review';

interface PresignResult {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
  publicUrl: string;
}

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private readonly accountId: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;
  private readonly presignExpiresIn: number;

  constructor(private readonly configService: ConfigService) {
    this.accountId =
      this.configService.get<string>('r2.accountId') ??
      this.configService.get<string>('R2_ACCOUNT_ID') ??
      '';
    this.accessKeyId =
      this.configService.get<string>('r2.accessKeyId') ??
      this.configService.get<string>('R2_ACCESS_KEY_ID') ??
      '';
    this.secretAccessKey =
      this.configService.get<string>('r2.secretAccessKey') ??
      this.configService.get<string>('R2_SECRET_ACCESS_KEY') ??
      '';
    this.bucketName =
      this.configService.get<string>('r2.bucketName') ??
      this.configService.get<string>('R2_BUCKET_NAME') ??
      '';
    this.publicBaseUrl =
      this.configService.get<string>('r2.publicUrl') ??
      this.configService.get<string>('R2_PUBLIC_URL') ??
      '';

    const configuredExpires =
      this.configService.get<number>('r2.presignExpires') ??
      Number(this.configService.get<string>('R2_PRESIGN_EXPIRES') ?? '');
    this.presignExpiresIn =
      Number.isFinite(configuredExpires) && configuredExpires > 0
        ? Math.floor(configuredExpires)
        : 300;
  }

  async createPresignedUploadUrl(userId: string, type: UploadType): Promise<PresignResult> {
    const s3Client = this.getS3Client();
    const fileKey = this.buildFileKey(type, userId);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: this.presignExpiresIn,
    });

    return {
      uploadUrl,
      fileKey,
      expiresIn: this.presignExpiresIn,
      publicUrl: this.buildPublicUrl(fileKey),
    };
  }

  private buildFileKey(type: UploadType, userId: string): string {
    return `${type}/${userId}/${Date.now()}-${randomUUID()}`;
  }

  private buildPublicUrl(fileKey: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/+$/, '')}/${fileKey}`;
    }

    return fileKey;
  }

  private getS3Client(): S3Client {
    this.assertRequiredConfig(this.accountId, 'R2_ACCOUNT_ID');
    this.assertRequiredConfig(this.accessKeyId, 'R2_ACCESS_KEY_ID');
    this.assertRequiredConfig(this.secretAccessKey, 'R2_SECRET_ACCESS_KEY');
    this.assertRequiredConfig(this.bucketName, 'R2_BUCKET_NAME');

    if (this.s3Client) {
      return this.s3Client;
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    return this.s3Client;
  }

  private assertRequiredConfig(value: string, envName: string): void {
    if (!value) {
      throw new InternalServerErrorException(`${envName} is not configured`);
    }
  }
}
