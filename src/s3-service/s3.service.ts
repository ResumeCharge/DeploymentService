import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

@Injectable()
export class S3Service {
  FILE_TYPE = {
    PDF: 'application/pdf',
    IMG: 'image/jpeg',
  };
  REGION = 'us-east-1';
  BUCKET = 'resume-charge-resources';
  s3Client = new S3Client({ region: this.REGION });
  BASE_64_REGEX = /^data.*;base64,/;
  PDF_PREFIX = 'data:application/pdf';
  IMAGE_PREFIX = 'data:image';

  async uploadImageToBucket(
    imageEncodedInBase64String: string,
    userId: string,
  ) {
    const fileName = this.getFileName(userId, 'jpeg');
    const params = this.getPutObjectParams(
      imageEncodedInBase64String,
      fileName,
    );
    return await this.uploadFileToS3Generic(params);
  }
  async uploadPDFToBucket(pdfEncodedAsBase64String: string, userId: string) {
    const fileName = this.getFileName(userId, 'pdf');
    const params = this.getPutObjectParams(pdfEncodedAsBase64String, fileName);
    return await this.uploadFileToS3Generic(params);
  }

  async uploadFileToS3Generic(params: PutObjectCommandInput): Promise<string> {
    const fileName = params.Key;
    await this.s3Client.send(new PutObjectCommand(params));
    return this.getObjectS3URI(fileName);
  }

  getObjectS3URI(fileName: string) {
    return `s3://${this.BUCKET}/${fileName}`;
  }

  getPutObjectParams(data: string, fileName: string) {
    const base64Data = Buffer.from(
      data.replace(this.BASE_64_REGEX, ''),
      'base64',
    );
    const fileType = this.getFileType(data);
    const params: PutObjectCommandInput = {
      Bucket: this.BUCKET, // The name of the bucket. For example, 'sample_bucket_101'.
      Key: fileName, // The name of the object. For example, 'sample_upload.txt'.
      Body: base64Data, // The content of the object. For example, 'Hello world!".
      ContentType: fileType,
      ContentEncoding: 'base64',
    };
    return params;
  }

  getFileType(data: string) {
    if (data.startsWith(this.PDF_PREFIX)) {
      return this.FILE_TYPE.PDF;
    } else if (data.startsWith(this.IMAGE_PREFIX)) {
      return this.FILE_TYPE.IMG;
    } else {
      return null;
    }
  }

  getFileName(userId: string, fileSuffix: string) {
    return `${userId}-${Date.now().toString()}.${fileSuffix}`;
  }
}
