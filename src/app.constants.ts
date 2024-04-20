export const PORT = 'PORT';
export const USER_SERVICE_ENDPOINT = 'http://localhost/api/users';
export const DEPLOYMENT_ERROR_DEPLOYMENT_ID_USER_ID_DO_NOT_MATCH =
  'DEPLOYMENT_ERROR_1: UserId from token and deployment do not match';
export const DEPLOYMENT_ERROR_USER_INACTIVE =
  'DEPLOYMENT_ERROR_2: user is not active';

export const DEPLOYMENT_ERROR_WEBSITE_IDENTIFIER_MISSING =
  'DEPLOYMENT_ERROR_3: websiteIdentifier is required but missing';

export const DEPLOYMENT_ERROR_CONCURRENT_DEPLOYMENT =
  'DEPLOYMENT_ERROR_4: another deployment is already in progress';

export const DEPLOYMENT_ERROR_SAVE_RESUME_USER_NOT_PREMIUM =
  'DEPLOYMENT_ERROR_5: Error saving resume, user is not premium';

export const DEPLOYMENT_ERROR_SAVE_RESUME_USER_TOO_MANY_RESUMES =
  'DEPLOYMENT_ERROR_5: Error saving resume, too many resumes';

export const DEPLOYMENT_ERROR_NOT_GITHUB_USERNAME =
  'DEPLOYMENT_ERROR_6: Cannot create deployment for GitHub, no GitHub username';
