import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_ENDPOINT } from '../app.constants';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthUser } from '../auth/decorators/authorization.decorator';
import { User } from './users.interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly logger: Logger) {}

  getUser = async (authUser: AuthUser): Promise<User> => {
    this.logger.log(`Attempting to getUser with Id: ${authUser.userId}`);
    const httpService = new HttpService();
    const getUserResponse = await firstValueFrom(
      httpService.get(`${USER_SERVICE_ENDPOINT}/${authUser.userId}`, {
        method: 'GET',
      }),
    );
    if (getUserResponse.status !== 200) {
      this.logger.error(
        `Failed to getUser for userId: ${
          authUser.userId
        }, response was ${JSON.stringify(getUserResponse)}`,
      );
      throw new InternalServerErrorException(getUserResponse.status);
    }
    const data = getUserResponse.data;
    this.logger.log(`Received data from user service: ${JSON.stringify(data)}`);
    return {
      isActive: data.isActive,
      isEmailVerified: data.isEmailVerified,
      email: data.email,
      lastUpdatedAt: data.lastUpdatedAt,
      createdAt: data.createdAt,
      userId: data.userId,
      websiteIdentifier: data.websiteIdentifier,
      githubUserName: data.githubUserName,
    };
  };

  getUserOAuthToken = async (authUser: AuthUser): Promise<string> => {
    this.logger.log(
      `Attempting to getUserOAuthToken for Id: ${authUser.userId}`,
    );
    const httpService = new HttpService();
    const getUserResponse = await firstValueFrom(
      httpService.get(`${USER_SERVICE_ENDPOINT}/${authUser.userId}/token`, {
        method: 'GET',
      }),
    );
    if (getUserResponse.status !== 200) {
      this.logger.error(
        `Failed to getUserOAuthToken for userId: ${
          authUser.userId
        }, response was ${JSON.stringify(getUserResponse)}`,
      );
      throw new InternalServerErrorException(getUserResponse.status);
    }
    return getUserResponse.data;
  };

  getUserGithubName = async (authUser: AuthUser): Promise<string> => {
    const httpService = new HttpService();
    const getUserResponse = await firstValueFrom(
      httpService.get(
        `${USER_SERVICE_ENDPOINT}/${authUser.userId}/githubUsername`,
        {
          method: 'GET',
        },
      ),
    );
    if (getUserResponse.status !== 200) {
      this.logger.error(
        `Failed to getUserGithubName for userId: ${
          authUser.userId
        }, response was ${JSON.stringify(getUserResponse)}`,
      );
      throw new InternalServerErrorException(getUserResponse.status);
    }
    return getUserResponse.data;
  };
}
