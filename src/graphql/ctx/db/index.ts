import { Knex } from 'knex';

import { AccountReader } from './loaders/Account';
import { AccountRoleReader } from './loaders/AccountRole';
import { AccountSubjectReader } from './loaders/AccountSubject';
import { CountryReader } from './loaders/Country';
import { CourseReader } from './loaders/Course';
import { CourseSubjectReader } from './loaders/CourseSubject';
import { FileReader } from './loaders/File';
import { LanguageReader } from './loaders/Language';
import { OpenidClientReader } from './loaders/OpenidClient';
import { SubjectReader } from './loaders/Subject';

export type ReadersType = {
  Account: AccountReader;
  AccountRole: AccountRoleReader;
  AccountSubject: AccountSubjectReader;
  Country: CountryReader;
  Course: CourseReader;
  CourseSubject: CourseSubjectReader;
  File: FileReader;
  Language: LanguageReader;
  OpenidClient: OpenidClientReader;
  Subject: SubjectReader;
};

export function createLoaders(db: Knex): ReadersType {
  return {
    Account: new AccountReader(db),
    AccountRole: new AccountRoleReader(db),
    AccountSubject: new AccountSubjectReader(db),
    Country: new CountryReader(db),
    Course: new CourseReader(db),
    CourseSubject: new CourseSubjectReader(db),
    File: new FileReader(db),
    Language: new LanguageReader(db),
    OpenidClient: new OpenidClientReader(db),
    Subject: new SubjectReader(db),
  };
}
