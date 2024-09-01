import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { STATIC_ASSETS_DIRECTORY } from '../app.constants';
import fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class StaticAssetsService {
  BASE_64_REGEX = /^data.*;base64,/;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  saveProfilePictureToStaticAssets(imageData: string, userId: string) {
    const fileName = this.getFileName(userId, 'jpeg');
    this.saveFileToStaticAssets(fileName, imageData);
    return fileName;
  }

  saveResumeToStaticAssets(pdfData: string, userId: string) {
    const fileName = this.getFileName(userId, 'pdf');
    this.saveFileToStaticAssets(fileName, pdfData);
    return fileName;
  }

  saveFileToStaticAssets(fileName: string, data: string) {
    const staticAssetsDirectory = this.configService.get(
      STATIC_ASSETS_DIRECTORY,
    );
    if (!staticAssetsDirectory) {
      throw new InternalServerErrorException(
        'Unable to save static assets, STATIC_ASSETS_DIRECTORY is not configured',
      );
    }
    if (!fs.existsSync(staticAssetsDirectory)) {
      throw new InternalServerErrorException(
        'Unable to save static assets, directory does not exist',
      );
    }
    const filePath = `${staticAssetsDirectory}/${fileName}`;
    const base64Data = Buffer.from(
      data.replace(this.BASE_64_REGEX, ''),
      'base64',
    );
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        this.logger.error(err);
        throw err;
      }
    });
  }

  getFileName(userId: string, fileSuffix: string) {
    return `${userId}-${Date.now().toString()}.${fileSuffix}`;
  }
}
