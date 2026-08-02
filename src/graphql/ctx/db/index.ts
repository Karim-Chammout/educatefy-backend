// ⚠️  This file is auto-generated. Do NOT edit it manually.
// Re-run `npm run generate-loaders` to regenerate it.

import type { Knex } from 'knex';

import { AccountBase as AccountReader } from './loaders/Account.generated.js';
import { AccountProgramReader } from './loaders/AccountProgram.js';
import { AccountRoleBase as AccountRoleReader } from './loaders/AccountRole.generated.js';
import { AccountSubjectBase as AccountSubjectReader } from './loaders/AccountSubject.generated.js';
import { AudioContentBase as AudioContentReader } from './loaders/AudioContent.generated.js';
import { ContentComponentReader } from './loaders/ContentComponent.js';
import { ContentComponentProgressReader } from './loaders/ContentComponentProgress.js';
import { CountryBase as CountryReader } from './loaders/Country.generated.js';
import { CourseReader } from './loaders/Course.js';
import { CourseObjectiveBase as CourseObjectiveReader } from './loaders/CourseObjective.generated.js';
import { CourseProgramVersionBase as CourseProgramVersionReader } from './loaders/CourseProgramVersion.generated.js';
import { CourseRatingReader } from './loaders/CourseRating.js';
import { CourseRequirementBase as CourseRequirementReader } from './loaders/CourseRequirement.generated.js';
import { CourseSectionBase as CourseSectionReader } from './loaders/CourseSection.generated.js';
import { CourseSectionItemBase as CourseSectionItemReader } from './loaders/CourseSectionItem.generated.js';
import { CourseSubjectBase as CourseSubjectReader } from './loaders/CourseSubject.generated.js';
import { DocumentContentBase as DocumentContentReader } from './loaders/DocumentContent.generated.js';
import { EmbedContentBase as EmbedContentReader } from './loaders/EmbedContent.generated.js';
import { EnrollmentReader } from './loaders/Enrollment.js';
import { EnrollmentHistoryBase as EnrollmentHistoryReader } from './loaders/EnrollmentHistory.generated.js';
import { FileReader } from './loaders/File.js';
import { ImageContentBase as ImageContentReader } from './loaders/ImageContent.generated.js';
import { LanguageBase as LanguageReader } from './loaders/Language.generated.js';
import { LessonBase as LessonReader } from './loaders/Lesson.generated.js';
import { OpenidClientBase as OpenidClientReader } from './loaders/OpenidClient.generated.js';
import { ProgramReader } from './loaders/Program.js';
import { ProgramObjectiveBase as ProgramObjectiveReader } from './loaders/ProgramObjective.generated.js';
import { ProgramRequirementBase as ProgramRequirementReader } from './loaders/ProgramRequirement.generated.js';
import { ProgramSubjectBase as ProgramSubjectReader } from './loaders/ProgramSubject.generated.js';
import { ProgramVersionBase as ProgramVersionReader } from './loaders/ProgramVersion.generated.js';
import { RefreshTokenBase as RefreshTokenReader } from './loaders/RefreshToken.generated.js';
import { StudentTeacherFollowReader } from './loaders/StudentTeacherFollow.js';
import { SubjectReader } from './loaders/Subject.js';
import { TextContentBase as TextContentReader } from './loaders/TextContent.generated.js';
import { VideoContentBase as VideoContentReader } from './loaders/VideoContent.generated.js';
import { YoutubeContentBase as YoutubeContentReader } from './loaders/YoutubeContent.generated.js';

export type ReadersType = {
  Account: AccountReader;
  AccountProgram: AccountProgramReader;
  AccountRole: AccountRoleReader;
  AccountSubject: AccountSubjectReader;
  AudioContent: AudioContentReader;
  ContentComponent: ContentComponentReader;
  ContentComponentProgress: ContentComponentProgressReader;
  Country: CountryReader;
  Course: CourseReader;
  CourseObjective: CourseObjectiveReader;
  CourseProgramVersion: CourseProgramVersionReader;
  CourseRating: CourseRatingReader;
  CourseRequirement: CourseRequirementReader;
  CourseSection: CourseSectionReader;
  CourseSectionItem: CourseSectionItemReader;
  CourseSubject: CourseSubjectReader;
  DocumentContent: DocumentContentReader;
  EmbedContent: EmbedContentReader;
  Enrollment: EnrollmentReader;
  EnrollmentHistory: EnrollmentHistoryReader;
  File: FileReader;
  ImageContent: ImageContentReader;
  Language: LanguageReader;
  Lesson: LessonReader;
  OpenidClient: OpenidClientReader;
  Program: ProgramReader;
  ProgramObjective: ProgramObjectiveReader;
  ProgramRequirement: ProgramRequirementReader;
  ProgramSubject: ProgramSubjectReader;
  ProgramVersion: ProgramVersionReader;
  RefreshToken: RefreshTokenReader;
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
    AudioContent: new AudioContentReader(db),
    ContentComponent: new ContentComponentReader(db),
    ContentComponentProgress: new ContentComponentProgressReader(db),
    Country: new CountryReader(db),
    Course: new CourseReader(db),
    CourseObjective: new CourseObjectiveReader(db),
    CourseProgramVersion: new CourseProgramVersionReader(db),
    CourseRating: new CourseRatingReader(db),
    CourseRequirement: new CourseRequirementReader(db),
    CourseSection: new CourseSectionReader(db),
    CourseSectionItem: new CourseSectionItemReader(db),
    CourseSubject: new CourseSubjectReader(db),
    DocumentContent: new DocumentContentReader(db),
    EmbedContent: new EmbedContentReader(db),
    Enrollment: new EnrollmentReader(db),
    EnrollmentHistory: new EnrollmentHistoryReader(db),
    File: new FileReader(db),
    ImageContent: new ImageContentReader(db),
    Language: new LanguageReader(db),
    Lesson: new LessonReader(db),
    OpenidClient: new OpenidClientReader(db),
    Program: new ProgramReader(db),
    ProgramObjective: new ProgramObjectiveReader(db),
    ProgramRequirement: new ProgramRequirementReader(db),
    ProgramSubject: new ProgramSubjectReader(db),
    ProgramVersion: new ProgramVersionReader(db),
    RefreshToken: new RefreshTokenReader(db),
    StudentTeacherFollow: new StudentTeacherFollowReader(db),
    Subject: new SubjectReader(db),
    TextContent: new TextContentReader(db),
    VideoContent: new VideoContentReader(db),
    YoutubeContent: new YoutubeContentReader(db),
  };
}
