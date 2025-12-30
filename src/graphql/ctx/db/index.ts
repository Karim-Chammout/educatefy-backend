import { Knex } from 'knex';

import { AccountReader } from './loaders/Account';
import { AccountProgramReader } from './loaders/AccountProgram';
import { AccountRoleReader } from './loaders/AccountRole';
import { AccountSubjectReader } from './loaders/AccountSubject';
import { ContentComponentReader } from './loaders/ContentComponent';
import { ContentComponentProgressReader } from './loaders/ContentComponentProgress';
import { CountryReader } from './loaders/Country';
import { CourseReader } from './loaders/Course';
import { CourseObjectiveReader } from './loaders/CourseObjective';
import { CourseProgramReader } from './loaders/CourseProgram';
import { CourseRatingReader } from './loaders/CourseRating';
import { CourseRequirementReader } from './loaders/CourseRequirement';
import { CourseSectionReader } from './loaders/CourseSection';
import { CourseSectionItemReader } from './loaders/CourseSectionItem';
import { CourseSubjectReader } from './loaders/CourseSubject';
import { EnrollmentReader } from './loaders/Enrollment';
import { EnrollmentHistoryReader } from './loaders/EnrollmentHistory';
import { FileReader } from './loaders/File';
import { LanguageReader } from './loaders/Language';
import { LessonReader } from './loaders/Lesson';
import { OpenidClientReader } from './loaders/OpenidClient';
import { ProgramReader } from './loaders/Program';
import { ProgramObjectiveReader } from './loaders/ProgramObjective';
import { ProgramProgressReader } from './loaders/ProgramProgress';
import { ProgramRequirementReader } from './loaders/ProgramRequirement';
import { ProgramSubjectReader } from './loaders/ProgramSubject';
import { StudentTeacherFollowReader } from './loaders/StudentTeacherFollow';
import { SubjectReader } from './loaders/Subject';
import { TextContentReader } from './loaders/TextContent';
import { VideoContentReader } from './loaders/VideoContent';
import { YoutubeContentReader } from './loaders/YoutubeContent';

export type ReadersType = {
  Account: AccountReader;
  AccountProgram: AccountProgramReader;
  AccountRole: AccountRoleReader;
  AccountSubject: AccountSubjectReader;
  ContentComponent: ContentComponentReader;
  ContentComponentProgress: ContentComponentProgressReader;
  Country: CountryReader;
  Course: CourseReader;
  CourseObjective: CourseObjectiveReader;
  CourseProgram: CourseProgramReader;
  CourseRating: CourseRatingReader;
  CourseRequirement: CourseRequirementReader;
  CourseSection: CourseSectionReader;
  CourseSectionItem: CourseSectionItemReader;
  CourseSubject: CourseSubjectReader;
  Enrollment: EnrollmentReader;
  EnrollmentHistory: EnrollmentHistoryReader;
  File: FileReader;
  Language: LanguageReader;
  Lesson: LessonReader;
  OpenidClient: OpenidClientReader;
  Program: ProgramReader;
  ProgramObjective: ProgramObjectiveReader;
  ProgramProgress: ProgramProgressReader;
  ProgramRequirement: ProgramRequirementReader;
  ProgramSubject: ProgramSubjectReader;
  StudentTeacherFollow: StudentTeacherFollowReader;
  Subject: SubjectReader;
  TextContent: TextContentReader;
  VideoContent: VideoContentReader;
  YoutubeContent: YoutubeContentReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    Account: new AccountReader(db),
    AccountProgram: new AccountProgramReader(db),
    AccountRole: new AccountRoleReader(db),
    AccountSubject: new AccountSubjectReader(db),
    ContentComponent: new ContentComponentReader(db),
    ContentComponentProgress: new ContentComponentProgressReader(db),
    Country: new CountryReader(db),
    Course: new CourseReader(db),
    CourseObjective: new CourseObjectiveReader(db),
    CourseProgram: new CourseProgramReader(db),
    CourseRating: new CourseRatingReader(db),
    CourseRequirement: new CourseRequirementReader(db),
    CourseSection: new CourseSectionReader(db),
    CourseSectionItem: new CourseSectionItemReader(db),
    CourseSubject: new CourseSubjectReader(db),
    Enrollment: new EnrollmentReader(db),
    EnrollmentHistory: new EnrollmentHistoryReader(db),
    File: new FileReader(db),
    Language: new LanguageReader(db),
    Lesson: new LessonReader(db),
    OpenidClient: new OpenidClientReader(db),
    Program: new ProgramReader(db),
    ProgramObjective: new ProgramObjectiveReader(db),
    ProgramProgress: new ProgramProgressReader(db),
    ProgramRequirement: new ProgramRequirementReader(db),
    ProgramSubject: new ProgramSubjectReader(db),
    StudentTeacherFollow: new StudentTeacherFollowReader(db),
    Subject: new SubjectReader(db),
    TextContent: new TextContentReader(db),
    VideoContent: new VideoContentReader(db),
    YoutubeContent: new YoutubeContentReader(db),
  };
}
