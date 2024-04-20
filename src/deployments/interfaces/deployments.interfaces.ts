export interface IWebsiteDetails {
  title: string;
  description: string;
  extraConfigurationOptions?: Map<string, any>;
  profilePicture?: string;
  resumeDocument?: string;
  resumeS3URI?: string;
  profilePictureS3URI?: string;
}
