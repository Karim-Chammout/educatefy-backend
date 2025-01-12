import { Knex } from 'knex';

import { AccountReader } from './loaders/Account';
import { AccountRoleReader } from './loaders/AccountRole';
import { AccountSubjectReader } from './loaders/AccountSubject';
import { ContentComponentReader } from './loaders/ContentComponent';
import { CountryReader } from './loaders/Country';
import { CourseReader } from './loaders/Course';
import { CourseObjectiveReader } from './loaders/CourseObjective';
import { CourseRequirementReader } from './loaders/CourseRequirement';
import { CourseSubjectReader } from './loaders/CourseSubject';
import { EnrollmentReader } from './loaders/Enrollment';
import { EnrollmentHistoryReader } from './loaders/EnrollmentHistory';
import { FileReader } from './loaders/File';
import { LanguageReader } from './loaders/Language';
import { LessonReader } from './loaders/Lesson';
import { OpenidClientReader } from './loaders/OpenidClient';
import { SubjectReader } from './loaders/Subject';
import { TextContentReader } from './loaders/TextContent';
import { VideoContentReader } from './loaders/VideoContent';

export type ReadersType = {
  Account: AccountReader;
  AccountRole: AccountRoleReader;
  AccountSubject: AccountSubjectReader;
  ContentComponent: ContentComponentReader;
  Country: CountryReader;
  Course: CourseReader;
  CourseObjective: CourseObjectiveReader;
  CourseRequirement: CourseRequirementReader;
  CourseSubject: CourseSubjectReader;
  Enrollment: EnrollmentReader;
  EnrollmentHistory: EnrollmentHistoryReader;
  File: FileReader;
  Language: LanguageReader;
  Lesson: LessonReader;
  OpenidClient: OpenidClientReader;
  Subject: SubjectReader;
  TextContent: TextContentReader;
  VideoContent: VideoContentReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    Account: new AccountReader(db),
    AccountRole: new AccountRoleReader(db),
    AccountSubject: new AccountSubjectReader(db),
    ContentComponent: new ContentComponentReader(db),
    Country: new CountryReader(db),
    Course: new CourseReader(db),
    CourseObjective: new CourseObjectiveReader(db),
    CourseRequirement: new CourseRequirementReader(db),
    CourseSubject: new CourseSubjectReader(db),
    Enrollment: new EnrollmentReader(db),
    EnrollmentHistory: new EnrollmentHistoryReader(db),
    File: new FileReader(db),
    Language: new LanguageReader(db),
    Lesson: new LessonReader(db),
    OpenidClient: new OpenidClientReader(db),
    Subject: new SubjectReader(db),
    TextContent: new TextContentReader(db),
    VideoContent: new VideoContentReader(db),
  };
}
