import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

jest.mock('@aws-sdk/client-s3');
const sendMock = jest.spyOn(S3Client.prototype, 'send');
describe('S3ServiceService', () => {
  const BUCKET = 'resume-charge-resources';
  const BASE_64_REGEX = /^data.*;base64,/;
  const FILE_TYPE = {
    PDF: 'application/pdf',
    IMG: 'image/jpeg',
  };
  const PDF_PREFIX = 'data:application/pdf';
  const IMAGE_PREFIX = 'data:image';
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();
    sendMock.mockClear();
    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload an image', () => {
    service.uploadImageToBucket('some-string', 'some-id');
    expect(sendMock).toBeCalledWith(expect.any(PutObjectCommand));
  });

  it('should upload a pdf', () => {
    service.uploadPDFToBucket('some-string', 'some-id');
    expect(sendMock).toBeCalledWith(expect.any(PutObjectCommand));
  });

  it('should return a properly formatted s3 uri', () => {
    const fileName = 'file';
    const s3Uri = service.getObjectS3URI(fileName);
    expect(s3Uri).toEqual(`s3://${BUCKET}/${fileName}`);
  });

  it('should return a valid PutObjectParams with PDF', () => {
    const fileName = 'file';
    const data = `${PDF_PREFIX} data`;
    const params = service.getPutObjectParams(data, fileName);
    const b64Data = Buffer.from(data.replace(BASE_64_REGEX, ''), 'base64');
    expect(params.Bucket).toEqual(BUCKET);
    expect(params.Key).toEqual(fileName);
    expect(params.Body).toEqual(b64Data);
    expect(params.ContentType).toEqual(FILE_TYPE.PDF);
    expect(params.ContentEncoding).toEqual('base64');
  });

  it('should return a valid PutObjectParams with IMG', () => {
    const fileName = 'file';
    const data = `${IMAGE_PREFIX} data`;
    const params = service.getPutObjectParams(data, fileName);
    const b64Data = Buffer.from(data.replace(BASE_64_REGEX, ''), 'base64');
    expect(params.Bucket).toEqual(BUCKET);
    expect(params.Key).toEqual(fileName);
    expect(params.Body).toEqual(b64Data);
    expect(params.ContentType).toEqual(FILE_TYPE.IMG);
    expect(params.ContentEncoding).toEqual('base64');
  });
});
