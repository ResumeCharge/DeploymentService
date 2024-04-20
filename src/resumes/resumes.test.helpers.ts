import { CreateResumeDto } from './dto/create-resume.dto';

export const createResumeDtoArray: Array<CreateResumeDto> = [
  {
    userId: '123',
    nickname: 'Cool resume',
    skills: { skills: 'my awesome skills' },
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
  },
];
