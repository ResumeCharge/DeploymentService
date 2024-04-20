//do not change this import, jest does not like absolute for this one
import admin from 'firebase-admin';
import { ExecutionContext, Logger } from '@nestjs/common';

const logger = new Logger();

export const isValidIdToken = async (token: string): Promise<boolean> => {
  const auth = admin.auth();
  return await auth
    .verifyIdToken(token)
    .then(() => {
      return true;
    })
    .catch((err) => {
      logger.warn('Caught exception trying to verify id token', err);
      return false;
    });
};

export const getUserIdFromAuthToken = async (
  token: string,
): Promise<string> => {
  const auth = admin.auth();
  return await auth
    .verifyIdToken(token)
    .then((decodedToken) => {
      return decodedToken.uid;
    })
    .catch((err) => {
      logger.warn('Caught exception trying to verify id token', err);
      throw err;
    });
};

export const isValidRequest = (executionContext: ExecutionContext): boolean => {
  try {
    const token = executionContext.switchToHttp().getRequest()
      .headers.authorization;
    if (typeof token === 'undefined' || token == null) return false;
    return token.trim().length >= 1;
  } catch (exception) {
    return false;
  }
};

export const getTokenFromExecutionContext = (
  executionContext: ExecutionContext,
): string => {
  const authorizationHeader = executionContext.switchToHttp().getRequest()
    .headers.authorization;
  const authorizationHeaderParts = authorizationHeader.split(' ');
  if (authorizationHeaderParts.length != 2) {
    throw new Error(
      'Authorization header is invalid, expected length to be 2 but was ' +
        authorizationHeaderParts.length,
    );
  }
  if (authorizationHeaderParts[0] !== 'Bearer') {
    throw new Error(
      'Authorization header is invalid, expected first part to be "Bearer" but was ' +
        authorizationHeaderParts[0],
    );
  }
  return authorizationHeaderParts[1];
};
