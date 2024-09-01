import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect } from 'mongoose';
import { CreateDeploymentDto } from '../../src/deployments/dto/create-deployment.dto';
import { Collection, ObjectId } from 'mongodb';
import { CreateResumeDto } from '../../src/resumes/dto/create-resume.dto';
import { CreateTemplateDto } from '../../src/templates/dto/create-template.dto';
import { SENT_TO_GITHUB } from '../../src/deployments/deployment.status.constants';

let mongod: MongoMemoryServer;
let mongoUri: string;

export let RESUME_ID;
export const TEMPLATE_ID = 'template-id';

export const startServer = async () => {
  if (!mongoUri) {
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    return mongoUri;
  }
  return mongoUri;
};

export const stopServer = async () => {
  await mongod.stop();
};

export const clearCollection = async (collectionString: string) => {
  const mongoConnection = (await connect(mongoUri)).connection;
  const collection = mongoConnection.collection(collectionString);
  await collection.deleteMany({});
};

export const clearDb = async () => {
  const mongoConnection = (await connect(mongoUri)).connection;
  const deploymentsCollection = mongoConnection.collection('deployments');
  const resumesCollection = mongoConnection.collection('resumes');
  const templatesCollection = mongoConnection.collection('websitetemplates');
  await deploymentsCollection.deleteMany({});
  await resumesCollection.deleteMany({});
  await templatesCollection.deleteMany({});
};

export const seedDb = async () => {
  const mongoConnection = (await connect(mongoUri)).connection;
  const deploymentsCollection = mongoConnection.collection('deployments');
  const resumesCollection = mongoConnection.collection('resumes');
  const templatesCollection = mongoConnection.collection('websitetemplates');
  await seedDeployments(
    deploymentsCollection,
    resumesCollection,
    templatesCollection,
  );
};

const seedDeployments = async (
  deploymentsCollection: Collection,
  resumesCollection: Collection,
  templatesCollection: Collection,
) => {
  const newResume = await resumesCollection.insertOne(resume);
  RESUME_ID = newResume.insertedId.toString();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await templatesCollection.insertOne(template);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const deployment: CreateDeploymentDto = {
    userId: '123',
    websiteDetails: {
      title: 'My Website',
      description: 'My Cool Website',
      profilePicture: 'http://link.com',
      resumeDocument: 'http://link2.com',
      resumeFile: 'resume.pdf',
      profilePictureFile: 'picture.jpeg',
    },
    resumeId: RESUME_ID,
    templateId: TEMPLATE_ID,
    seoTag: 'my-tag',
  };
  const deployment2: CreateDeploymentDto = {
    userId: '123',
    websiteDetails: {
      title: 'My Website 2',
      description: 'My Cool Website 2',
      profilePicture: 'http://link.com',
      resumeDocument: 'http://link2.com',
      resumeFile: 'resume.pdf',
      profilePictureFile: 'picture.jpeg',
    },
    resumeId: RESUME_ID,
    templateId: TEMPLATE_ID,
    seoTag: 'my-tag',
    deploymentProvider: 'GITHUB',
  };
  const deployment3: CreateDeploymentDto = {
    userId: '123',
    websiteDetails: {
      title: 'My Website 2',
      description: 'My Cool Website 2',
      profilePicture: 'http://link.com',
      resumeDocument: 'http://link2.com',
      resumeFile: 'resume.pdf',
      profilePictureFile: 'picture.jpeg',
    },
    resumeId: RESUME_ID,
    templateId: TEMPLATE_ID,
    seoTag: 'my-tag',
    deploymentProvider: 'GITHUB',
  };
  await deploymentsCollection.insertOne(deployment);
  await deploymentsCollection.insertOne(deployment2);
  const deployment3Object = await deploymentsCollection.insertOne(deployment3);
  const filter = { _id: deployment3Object.insertedId };
  const update = {
    $set: {
      status: SENT_TO_GITHUB,
    },
  };
  await deploymentsCollection.findOneAndUpdate(filter, update);
};

const resume: CreateResumeDto = {
  userId: '123',
  nickname: 'Cool resume',
  skills: { skills: 'My skills!' },
  projectsList: [
    {
      details: '**Discord Bot built with python**',
      title: 'Discord Bot',
    },
    {
      details: '* sadfasd\n* sadf\n* asdfa\n',
      title: 'Tic Tac Toe',
    },
  ],
  workExperienceList: [
    {
      details: '**fsafdasdf**\n\n# sdfasdfsa\n* sadfasd\n* sadf\n* asdfa\n',
      endDate: 'March 2018',
      startDate: 'September 2012',
      location: 'Toronto',
      company: 'Amazon',
      roleName: 'Senior Software Engineer',
    },
    {
      details: 'Did some cool stuff',
      endDate: 'December 2018',
      startDate: 'September 2005',
      location: 'Prague, Czech Republic',
      company: 'Google',
      roleName: 'QA Tester',
    },
  ],
  educationList: [
    {
      details: '**Discrete** math was fun :)',
      endDate: 'December 2021',
      startDate: 'September 2017',
      university: 'University of Ottawa',
      degree: 'B.ASc Software Engineering',
    },
    {
      details: "**Let's get that bread**",
      endDate: 'May 2011',
      startDate: 'January 2007',
      university: 'University of Ottawa - Telfer',
      degree: 'B.Comm',
    },
  ],
  careerSummary: {
    summary: 'I had an awesome career',
  },
  extraLinkList: [
    {
      linkValue: 'somecoolname',
      linkName: 'twitter',
    },
    {
      linkValue: 'MyLongBitBucketUsername',
      linkName: 'bitbucket',
    },
  ],
  awardsAndAccoladesList: [],
  extraWebsiteDetails: new Map<string, string>(),
  aboutMe: { aboutMe: 'this is my about me' },
  personalDetails: {
    languages: [],
    linkedin: 'alaws057',
    github: 'adam99lawson',
    website: 'adamlawson.dev',
    phone: '6136065783',
    email: 'adamlawson@gmail.com',
    avatar: 'someFile.exe',
    lastName: 'Lawson',
    firstName: 'Adam',
  },
};

const template: CreateTemplateDto = {
  _id: 'template-id',
  name: 'template',
  description: 'some template',
  mainImage: 'main-image-link',
};
