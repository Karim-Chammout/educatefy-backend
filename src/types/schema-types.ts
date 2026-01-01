export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date custom scalar type */
  Date: { input: any; output: any; }
};

/** The properties of the account */
export type Account = {
  __typename?: 'Account';
  /** The role of the account. */
  accountRole: AccountRole;
  /** The avatar url of this account (provided by the openid-provider) */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** The bio of the teacher. */
  bio?: Maybe<Scalars['String']['output']>;
  /** The current country the user stated to live in. */
  country?: Maybe<Country>;
  /** The date of birth of this account */
  date_of_birth?: Maybe<Scalars['Date']['output']>;
  /** A detailed overview about this teacher. */
  description?: Maybe<Scalars['String']['output']>;
  /** The first name of the account */
  first_name?: Maybe<Scalars['String']['output']>;
  /** The gender of the account */
  gender?: Maybe<Gender>;
  /** A unique id of this account */
  id: Scalars['ID']['output'];
  /** The last name of the account */
  last_name?: Maybe<Scalars['String']['output']>;
  /** The name of the account */
  name?: Maybe<Scalars['String']['output']>;
  /** The nationality of the user */
  nationality?: Maybe<Country>;
  /** The nickname of the account */
  nickname?: Maybe<Scalars['String']['output']>;
  /** The preferred language for the account */
  preferredLanguage: Scalars['String']['output'];
  /** Statistics for the current user. */
  statistics?: Maybe<Statistics>;
  /** Represents the subjects a teacher is specialized in for teaching. */
  subjects: Array<Subject>;
};

/** Input for updating an account information */
export type AccountInfoInput = {
  /** The current country of the user */
  countryId: Scalars['ID']['input'];
  /** The date of birth of the user. */
  dateOfBirth: Scalars['Date']['input'];
  /** The first name of the user. */
  firstName: Scalars['String']['input'];
  /** The gender of the user. */
  gender: Gender;
  /** The last name of the user. */
  lastName: Scalars['String']['input'];
  /** The nationality of the user */
  nationalityId: Scalars['ID']['input'];
  /** The nickname name of the user. */
  nickname: Scalars['String']['input'];
  /** The preferred language for the user. */
  selectedLanguage: Scalars['String']['input'];
  /** The short bio about the teacher. */
  teacherBio?: InputMaybe<Scalars['String']['input']>;
  /** The short description about the teacher. */
  teacherDescription?: InputMaybe<Scalars['String']['input']>;
  /** List of subject IDs a teacher is specialized in for teaching. */
  teacherSpecialties?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** The role of the account. */
export enum AccountRole {
  Student = 'student',
  Teacher = 'teacher'
}

/** The result of the changeProfilePicture mutation. */
export type ChangeProfilePictureResult = {
  __typename?: 'ChangeProfilePictureResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
  /** The updated user information. */
  user?: Maybe<Account>;
};

/** The parent table name of the component */
export enum ComponentParentType {
  Lesson = 'lesson'
}

/** The type of the component. */
export enum ComponentType {
  Text = 'text',
  Video = 'video',
  Youtube = 'youtube'
}

/** A content component which can be of various types. */
export type ContentComponent = TextContent | VideoContent | YouTubeContent;

export type ContentComponentBaseInput = {
  /** The denomination of the component. */
  denomination: Scalars['String']['input'];
  /** A flag indicating whether the component is published. */
  isPublished: Scalars['Boolean']['input'];
  /** A flag indicating whether the component is required to continue. */
  isRequired: Scalars['Boolean']['input'];
  /** The ID of the parent of the component. */
  parentId: Scalars['ID']['input'];
  /** The parent table name of the component */
  parentType: ComponentParentType;
  /** The type of the component. */
  type: ComponentType;
};

/** Progress tracking for content components */
export type ContentComponentProgress = {
  __typename?: 'ContentComponentProgress';
  /** When the component was completed */
  completed_at?: Maybe<Scalars['Date']['output']>;
  /** The content component ID */
  content_component_id: Scalars['Int']['output'];
  /** The unique identifier of the progress record */
  id: Scalars['ID']['output'];
  /** Flag to indicate if the content component is completed */
  is_completed: Scalars['Boolean']['output'];
};

/** Result of updating content component progress */
export type ContentComponentProgressResult = {
  __typename?: 'ContentComponentProgressResult';
  /** The updated content component progress. */
  contentComponentProgress?: Maybe<ContentComponentProgress>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The country info */
export type Country = {
  __typename?: 'Country';
  /** The name of this country */
  denomination: Scalars['String']['output'];
  /** A unique id of this country */
  id: Scalars['ID']['output'];
  /** The iso code of this country */
  iso: Scalars['String']['output'];
  /** The iso3 code of this country */
  iso3?: Maybe<Scalars['String']['output']>;
  /** The num_code code of this country */
  num_code?: Maybe<Scalars['String']['output']>;
  /** The phone_code code of this country */
  phone_code: Scalars['String']['output'];
};

/** The course info. */
export type Course = {
  __typename?: 'Course';
  /** The date of when this course was created. */
  created_at: Scalars['Date']['output'];
  /** The denomination of this course. */
  denomination: Scalars['String']['output'];
  /** The description of this course. */
  description: Scalars['String']['output'];
  /** The end date of the course */
  end_date?: Maybe<Scalars['Date']['output']>;
  /** A link to an external resource. */
  external_resource_link?: Maybe<Scalars['String']['output']>;
  /** A unique id of this course. */
  id: Scalars['ID']['output'];
  /** The image of this course */
  image?: Maybe<Scalars['String']['output']>;
  /** The name of the instructor for this course */
  instructor: Teacher;
  /** A flag to indicate whether this course is published or not */
  is_published: Scalars['Boolean']['output'];
  /** The language of this course */
  language: Scalars['String']['output'];
  /** The difficulty level of this course. */
  level: CourseLevel;
  /** The objectives of this course. */
  objectives: Array<CourseObjective>;
  /** The number of participants enrolled in this course (or completed it) */
  participationCount: Scalars['Int']['output'];
  /** Average star rating for this course */
  rating: Scalars['Float']['output'];
  /** Total number of ratings for this course */
  ratingsCount: Scalars['Int']['output'];
  /** The requirements of this course. */
  requirements: Array<CourseRequirement>;
  /** The reviews of this course. */
  reviews: Array<CourseReview>;
  /** The sections of this course. */
  sections: Array<CourseSection>;
  /** A unique slug of this course. */
  slug: Scalars['String']['output'];
  /** The start date of the course */
  start_date?: Maybe<Scalars['Date']['output']>;
  /** The status of the course for the current user */
  status: CourseStatus;
  /** The subjects linked to this course. */
  subjects: Array<Subject>;
  /** The subtitle of this course. */
  subtitle: Scalars['String']['output'];
  /** The date of when this course was last updated. */
  updated_at: Scalars['Date']['output'];
  /** Review by the current viewer for this course */
  viewerReview?: Maybe<CourseReview>;
};

/** Input for creating a course record. */
export type CourseInfoInput = {
  /** The denomination of this course. */
  denomination: Scalars['String']['input'];
  /** The description of this course. */
  description: Scalars['String']['input'];
  /** The end date of the course. */
  end_date?: InputMaybe<Scalars['Date']['input']>;
  /** A link to an external resource. */
  external_resource_link?: InputMaybe<Scalars['String']['input']>;
  /** The image of this course. */
  image?: InputMaybe<Scalars['String']['input']>;
  /** A flag to indicate whether this course is published or not. */
  is_published: Scalars['Boolean']['input'];
  /** The language of this course. */
  language: Scalars['String']['input'];
  /** The difficulty level of this course. */
  level: CourseLevel;
  /** List of objectives for the course */
  objectives?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of requirements for the course */
  requirements?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The slug of this course. */
  slug: Scalars['String']['input'];
  /** The start date of the course. */
  start_date?: InputMaybe<Scalars['Date']['input']>;
  /** List of subject IDs to associate with the course */
  subjectIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The subtitle of this course. */
  subtitle: Scalars['String']['input'];
};

/** The difficulty level of a course. */
export enum CourseLevel {
  Advanced = 'advanced',
  Beginner = 'beginner',
  Intermediate = 'intermediate'
}

/** The course objective info */
export type CourseObjective = {
  __typename?: 'CourseObjective';
  /** A unique id of this course objective. */
  id: Scalars['ID']['output'];
  /** The objective of this course. */
  objective: Scalars['String']['output'];
};

/** Input for a course objective record. */
export type CourseObjectiveInput = {
  /** A unique id of this course objective. */
  id: Scalars['ID']['input'];
  /** The objective of this course. */
  objective: Scalars['String']['input'];
};

/** The course requirement info */
export type CourseRequirement = {
  __typename?: 'CourseRequirement';
  /** A unique id of this course requirement. */
  id: Scalars['ID']['output'];
  /** The requirement of this course. */
  requirement: Scalars['String']['output'];
};

/** Input for a course requirement record. */
export type CourseRequirementInput = {
  /** A unique id of this course requirement. */
  id: Scalars['ID']['input'];
  /** The requirement of this course. */
  requirement: Scalars['String']['input'];
};

/** The review details of a course */
export type CourseReview = {
  __typename?: 'CourseReview';
  /** The date when the review was created */
  created_at: Scalars['Date']['output'];
  /** Id of this course review */
  id: Scalars['ID']['output'];
  /** Whether the review can be edited by the user */
  isEditable: Scalars['Boolean']['output'];
  /** 1-5 star rating value given by the reviewer */
  rating?: Maybe<Scalars['Float']['output']>;
  /** The review text given by the reviewer */
  review?: Maybe<Scalars['String']['output']>;
  /** The reviewer who wrote the review */
  reviewer: PublicAccount;
};

/** The course section info */
export type CourseSection = {
  __typename?: 'CourseSection';
  /** The denomination of this course section */
  denomination: Scalars['String']['output'];
  /** A unique id of this course section. */
  id: Scalars['ID']['output'];
  /** A flag to indicate whether this course section is published or not */
  is_published: Scalars['Boolean']['output'];
  /** The course section items */
  items: Array<CourseSectionItem>;
  /** The rank of this course section */
  rank: Scalars['Int']['output'];
};

/** Input for creating a course section record. */
export type CourseSectionInfoInput = {
  /** The ID of the course. */
  courseId: Scalars['ID']['input'];
  /** The denomination of this course section. */
  denomination: Scalars['String']['input'];
  /** A flag to indicate whether this course section is published or not. */
  is_published: Scalars['Boolean']['input'];
};

/** Course section item which contains the course curriculum (e.g. lesson) */
export type CourseSectionItem = Lesson;

/** The status of the course for the current user. */
export enum CourseStatus {
  /** This course is available for enrollment. */
  Available = 'available',
  /** This course has been completed by the user. */
  Completed = 'completed',
  /** The user is currently enrolled in this course. */
  Enrolled = 'enrolled',
  /** The user unenrolled from this course. */
  Unenrolled = 'unenrolled'
}

/** Input for updating a course status. */
export type CourseStatusInput = {
  /** The ID of the course */
  id: Scalars['ID']['input'];
  /** The new status of the course */
  status: CourseStatus;
};

/** The result of the creating or updating a content component. */
export type CreateOrUpdateContentComponent = {
  __typename?: 'CreateOrUpdateContentComponent';
  /** The created or updated content component. */
  component?: Maybe<ContentComponent>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The result of the creating or updating a course. */
export type CreateOrUpdateCourseResult = {
  __typename?: 'CreateOrUpdateCourseResult';
  /** The created or updated course information. */
  course?: Maybe<Course>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The result of the creating or updating a course section. */
export type CreateOrUpdateCourseSectionResult = {
  __typename?: 'CreateOrUpdateCourseSectionResult';
  /** The created or updated course section. */
  courseSection?: Maybe<CourseSection>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The result of the creating or updating mutation. */
export type CreateOrUpdateLessonResult = {
  __typename?: 'CreateOrUpdateLessonResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** The created or updated lesson. */
  lesson?: Maybe<Lesson>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The result of the creating or updating a program. */
export type CreateOrUpdateProgramResult = {
  __typename?: 'CreateOrUpdateProgramResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** The created or updated program information. */
  program?: Maybe<Program>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Input for deleting a course rating */
export type DeleteCourseRatingInput = {
  /** The ID of the course. */
  courseId: Scalars['ID']['input'];
  /** The ID of the course rating to delete. */
  courseRateId: Scalars['ID']['input'];
};

/** An object type that wraps an error */
export type Error = {
  __typename?: 'Error';
  /** The message of this error. */
  message: Scalars['String']['output'];
};

/** Input for following/unfollowing a teacher */
export type FollowTeacherInput = {
  /** The ID of the teacher to follow/unfollow */
  teacherId: Scalars['String']['input'];
};

/** Result of following/unfollowing a teacher */
export type FollowTeacherResult = {
  __typename?: 'FollowTeacherResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Whether the student is now following the teacher */
  isFollowing?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Gender of the account. */
export enum Gender {
  Female = 'female',
  Male = 'male',
  Unknown = 'unknown'
}

/** The language info */
export type Language = {
  __typename?: 'Language';
  /** The code of this language */
  code: Scalars['String']['output'];
  /** The name of this language */
  denomination: Scalars['String']['output'];
  /** A unique id of this language */
  id: Scalars['ID']['output'];
};

/** The lesson info */
export type Lesson = {
  __typename?: 'Lesson';
  /** The content components of this lesson. */
  components: Array<ContentComponent>;
  /** The denomination of this lesson. */
  denomination: Scalars['String']['output'];
  /** The duration of this lesson. */
  duration: Scalars['Int']['output'];
  /** A unique id of this lesson. */
  id: Scalars['ID']['output'];
  /** A flag to indicate whether this lesson is published or not */
  is_published: Scalars['Boolean']['output'];
  /** The ID of the section item this lesson belongs to. */
  itemId: Scalars['ID']['output'];
};

/** Input for creating a lesson record. */
export type LessonInfoInput = {
  /** The ID of the course. */
  courseId: Scalars['ID']['input'];
  /** The denomination of this lesson. */
  denomination: Scalars['String']['input'];
  /** The duration of the lesson in minutes. */
  duration: Scalars['Int']['input'];
  /** A flag to indicate whether this lesson is published or not. */
  is_published: Scalars['Boolean']['input'];
  /** The ID of the section where the lesson item is located. */
  sectionId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change the profile picture of a user. */
  changeProfilePicture?: Maybe<ChangeProfilePictureResult>;
  /** Creates a content component. */
  createContentComponent?: Maybe<CreateOrUpdateContentComponent>;
  /** Creates a course. */
  createCourse?: Maybe<CreateOrUpdateCourseResult>;
  /** Creates a course section. */
  createCourseSection?: Maybe<CreateOrUpdateCourseSectionResult>;
  /** Creates a lesson. */
  createLesson?: Maybe<CreateOrUpdateLessonResult>;
  /** Creates a program. */
  createProgram?: Maybe<CreateOrUpdateProgramResult>;
  /** Deletes a content component. */
  deleteContentComponent?: Maybe<MutationResult>;
  /** Deletes a course. */
  deleteCourse?: Maybe<MutationResult>;
  /** Delete a course rating. */
  deleteCourseRating?: Maybe<MutationResult>;
  /** Deletes a course section. */
  deleteCourseSection?: Maybe<MutationResult>;
  /** Deletes a course section item. */
  deleteCourseSectionItem?: Maybe<MutationResult>;
  /** Deletes a lesson. */
  deleteLesson?: Maybe<MutationResult>;
  /** Deletes a program. */
  deleteProgram?: Maybe<MutationResult>;
  /** Follow or unfollow a teacher. Toggles the follow status. */
  followTeacher?: Maybe<FollowTeacherResult>;
  /** Rate a course. */
  rateCourse?: Maybe<RateCourseResult>;
  /** Remove the profile picture of a user. */
  removeProfilePicture?: Maybe<ChangeProfilePictureResult>;
  /** Updates a user account information. */
  updateAccountInfo?: Maybe<MutationResult>;
  /** Updates a content component. */
  updateContentComponent?: Maybe<CreateOrUpdateContentComponent>;
  /** Updates the progress of a content component. */
  updateContentComponentProgress?: Maybe<ContentComponentProgressResult>;
  /** Updates the ranks of multiple content components. */
  updateContentComponentRanks?: Maybe<MutationResult>;
  /** Updates a course. */
  updateCourse?: Maybe<CreateOrUpdateCourseResult>;
  /** Updates a course section. */
  updateCourseSection?: Maybe<CreateOrUpdateCourseSectionResult>;
  /** Updates the ranks of multiple course section items. */
  updateCourseSectionItemRanks?: Maybe<MutationResult>;
  /** Updates the ranks of multiple course sections. */
  updateCourseSectionRanks?: Maybe<MutationResult>;
  /** Updates the status of a course. */
  updateCourseStatus?: Maybe<UpdateCourseStatusResult>;
  /** Updates a lesson. */
  updateLesson?: Maybe<CreateOrUpdateLessonResult>;
  /** Updates a user profile details. */
  updateProfile?: Maybe<UpdateProfileResult>;
  /** Updates a program. */
  updateProgram?: Maybe<CreateOrUpdateProgramResult>;
};


export type MutationChangeProfilePictureArgs = {
  profilePictureDetails: ProfilePictureDetailsInput;
};


export type MutationCreateContentComponentArgs = {
  baseComponentInfo: ContentComponentBaseInput;
  textContent?: InputMaybe<TextContentInput>;
  videoContent?: InputMaybe<VideoContentInput>;
  youtubeContent?: InputMaybe<YouTubeContentInput>;
};


export type MutationCreateCourseArgs = {
  courseInfo: CourseInfoInput;
};


export type MutationCreateCourseSectionArgs = {
  courseSectionInfo: CourseSectionInfoInput;
};


export type MutationCreateLessonArgs = {
  lessonInfo: LessonInfoInput;
};


export type MutationCreateProgramArgs = {
  programInfo: ProgramInfoInput;
};


export type MutationDeleteContentComponentArgs = {
  componentId: Scalars['ID']['input'];
  componentType: ComponentType;
};


export type MutationDeleteCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCourseRatingArgs = {
  ratingInfo: DeleteCourseRatingInput;
};


export type MutationDeleteCourseSectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCourseSectionItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLessonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProgramArgs = {
  id: Scalars['ID']['input'];
};


export type MutationFollowTeacherArgs = {
  followTeacherInfo: FollowTeacherInput;
};


export type MutationRateCourseArgs = {
  ratingInfo: RateCourse;
};


export type MutationUpdateAccountInfoArgs = {
  accountInfo: AccountInfoInput;
};


export type MutationUpdateContentComponentArgs = {
  baseComponentInfo: UpdateContentComponentBaseInput;
  textContent?: InputMaybe<TextContentInput>;
  videoContent?: InputMaybe<VideoContentInput>;
  youtubeContent?: InputMaybe<YouTubeContentInput>;
};


export type MutationUpdateContentComponentProgressArgs = {
  progressInput: UpdateContentComponentProgressInput;
};


export type MutationUpdateContentComponentRanksArgs = {
  componentRanks: Array<UpdateContentComponentRankInput>;
};


export type MutationUpdateCourseArgs = {
  updateCourseInfo: UpdateCourseInfoInput;
};


export type MutationUpdateCourseSectionArgs = {
  courseSectionInfo: UpdateCourseSectionInfo;
};


export type MutationUpdateCourseSectionItemRanksArgs = {
  sectionItemRanks: Array<UpdateCourseSectionItemRankInput>;
};


export type MutationUpdateCourseSectionRanksArgs = {
  sectionRanks: Array<UpdateCourseSectionRankInput>;
};


export type MutationUpdateCourseStatusArgs = {
  courseStatusInput: CourseStatusInput;
};


export type MutationUpdateLessonArgs = {
  lessonInfo: UpdateLessonInfoInput;
};


export type MutationUpdateProfileArgs = {
  profileDetails: ProfileDetailsInput;
};


export type MutationUpdateProgramArgs = {
  updateProgramInfo: UpdateProgramInfoInput;
};

/** The result of a mutation. */
export type MutationResult = {
  __typename?: 'MutationResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The open id client providers to use for auth */
export type OpenidClient = {
  __typename?: 'OpenidClient';
  /** The button background color of the OIDC */
  button_background_color?: Maybe<Scalars['String']['output']>;
  /** The icon of the OIDC that should be displayed on the button */
  button_icon?: Maybe<Scalars['String']['output']>;
  /** The text of the OIDC that should be displayed on the button */
  button_text?: Maybe<Scalars['String']['output']>;
  /** A unique id of this OIDC */
  id: Scalars['ID']['output'];
  /** The openId provider */
  identity_provider: Scalars['String']['output'];
};

/** Input for updating the user profile details */
export type ProfileDetailsInput = {
  /** The current country of the user */
  countryId?: InputMaybe<Scalars['ID']['input']>;
  /** The date of birth of the user. */
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  /** The first name of the user. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** The gender of the user. */
  gender?: InputMaybe<Gender>;
  /** The last name of the user. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** The nationality of the user */
  nationalityId?: InputMaybe<Scalars['ID']['input']>;
  /** The nickname name of the user. */
  nickname?: InputMaybe<Scalars['String']['input']>;
  /** The preferred language for the user */
  selectedLanguage?: InputMaybe<Scalars['String']['input']>;
  /** The short bio about the teacher. */
  teacherBio?: InputMaybe<Scalars['String']['input']>;
  /** The short description about the teacher. */
  teacherDescription?: InputMaybe<Scalars['String']['input']>;
  /** List of subject IDs a teacher is specialized in for teaching. */
  teacherSpecialties?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** Input for updating an account information */
export type ProfilePictureDetailsInput = {
  /** The file path in the bucket. */
  filePath: Scalars['String']['input'];
  /** The file size in bytes of this file. */
  fileSize: Scalars['Int']['input'];
  /** The mime type of the file. */
  mimeType: Scalars['String']['input'];
  /** The original file name. */
  originalFileName: Scalars['String']['input'];
  /** The uuid of the file. */
  uuid: Scalars['String']['input'];
};

/** The program info. */
export type Program = {
  __typename?: 'Program';
  /** The courses linked to this program. */
  courses: Array<Course>;
  /** The date of when this program was created. */
  created_at: Scalars['Date']['output'];
  /** The denomination of this program. */
  denomination: Scalars['String']['output'];
  /** The description of this program. */
  description: Scalars['String']['output'];
  /** Number of learners enrolled in this program. */
  enrolledLearnersCount: Scalars['Int']['output'];
  /** A link to an external resource. */
  external_resource_link?: Maybe<Scalars['String']['output']>;
  /** A unique id of this program. */
  id: Scalars['ID']['output'];
  /** The image of this program */
  image?: Maybe<Scalars['String']['output']>;
  /** The name of the instructor for this program */
  instructor: Teacher;
  /** A flag to indicate whether this program is published or not */
  is_published: Scalars['Boolean']['output'];
  /** The difficulty level of this program. */
  level: ProgramLevel;
  /** The objectives of this program. */
  objectives: Array<ProgramObjective>;
  /** Average rating across all courses in this program */
  rating: Scalars['Float']['output'];
  /** Total number of course ratings in this program */
  ratingsCount: Scalars['Int']['output'];
  /** The requirements of this program. */
  requirements: Array<ProgramRequirement>;
  /** A unique slug of this program. */
  slug: Scalars['String']['output'];
  /** The subjects linked to this program. */
  subjects: Array<Subject>;
  /** The subtitle of this program. */
  subtitle: Scalars['String']['output'];
  /** The date of when this program was last updated. */
  updated_at: Scalars['Date']['output'];
};

/** Input for creating a program record. */
export type ProgramInfoInput = {
  /** The denomination of this program. */
  denomination: Scalars['String']['input'];
  /** The description of this program. */
  description: Scalars['String']['input'];
  /** The image of this program. */
  image?: InputMaybe<Scalars['String']['input']>;
  /** A flag to indicate whether this program is published or not. */
  is_published: Scalars['Boolean']['input'];
  /** The difficulty level of this program. */
  level: ProgramLevel;
  /** List of objectives for the program */
  objectives?: InputMaybe<Array<Scalars['String']['input']>>;
  /** List of requirements for the program */
  requirements?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The slug of this program. */
  slug: Scalars['String']['input'];
  /** List of subject IDs to associate with the program */
  subjectIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The subtitle of this program. */
  subtitle: Scalars['String']['input'];
};

/** The difficulty level of a program. */
export enum ProgramLevel {
  Advanced = 'advanced',
  Beginner = 'beginner',
  Intermediate = 'intermediate'
}

/** The program objective info */
export type ProgramObjective = {
  __typename?: 'ProgramObjective';
  /** A unique id of this program objective. */
  id: Scalars['ID']['output'];
  /** The objective of this program. */
  objective: Scalars['String']['output'];
};

/** Input for a program objective record. */
export type ProgramObjectiveInput = {
  /** A unique id of this program objective. */
  id: Scalars['ID']['input'];
  /** The objective of this program. */
  objective: Scalars['String']['input'];
};

/** The program requirement info */
export type ProgramRequirement = {
  __typename?: 'ProgramRequirement';
  /** A unique id of this program requirement. */
  id: Scalars['ID']['output'];
  /** The requirement of this program. */
  requirement: Scalars['String']['output'];
};

/** Input for a program requirement record. */
export type ProgramRequirementInput = {
  /** A unique id of this program requirement. */
  id: Scalars['ID']['input'];
  /** The requirement of this program. */
  requirement: Scalars['String']['input'];
};

/** The properties of a public account */
export type PublicAccount = {
  __typename?: 'PublicAccount';
  /** The avatar url of this account */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** The first name of the account */
  first_name?: Maybe<Scalars['String']['output']>;
  /** A unique id of this account */
  id: Scalars['ID']['output'];
  /** The last name of the account */
  last_name?: Maybe<Scalars['String']['output']>;
  /** The name of the account */
  name?: Maybe<Scalars['String']['output']>;
  /** The nickname of the account */
  nickname?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** List of courses the user has completed. */
  completedCourses: Array<Course>;
  /** List of countries */
  countries: Array<Country>;
  /** Retrieve a course by its slug */
  course?: Maybe<Course>;
  /** Retrieve a course to be edited by the teacher. */
  editableCourse?: Maybe<Course>;
  /** Retrieve a program to be edited by the teacher. */
  editableProgram?: Maybe<Program>;
  /** List of courses the user is enrolled in */
  enrolledCourses: Array<Course>;
  /** Retrieve the instructor (teacher) account by its id */
  instructor?: Maybe<Teacher>;
  /** List of languages */
  languages: Array<Language>;
  /** The current user */
  me: Account;
  /** List of OpenId clients */
  openIdClients: Array<OpenidClient>;
  /** Retrieve a program by its slug */
  program?: Maybe<Program>;
  /** Retrieve a subject by its id */
  subject?: Maybe<Subject>;
  /** List of subjects */
  subjects: Array<Subject>;
  /** List of subjects that have content associated with them */
  subjectsWithLinkedContent: Array<Subject>;
  /** List of courses created by the teacher */
  teacherCourses: Array<Course>;
  /** List of programs created by the teacher */
  teacherPrograms: Array<Program>;
};


export type QueryCourseArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEditableCourseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEditableProgramArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInstructorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProgramArgs = {
  slug: Scalars['String']['input'];
};


export type QuerySubjectArgs = {
  id: Scalars['ID']['input'];
};

/** Input for rating a course. */
export type RateCourse = {
  /** The ID of the course. */
  courseId: Scalars['ID']['input'];
  /** star rating value between 1 and 5 */
  rating?: InputMaybe<Scalars['Float']['input']>;
  /** The review text given by the reviewer */
  review?: InputMaybe<Scalars['String']['input']>;
};

/** The result of the rateCourse mutation. */
export type RateCourseResult = {
  __typename?: 'RateCourseResult';
  /** The updated course information. */
  course?: Maybe<Course>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Statistics info for the current user. */
export type Statistics = {
  __typename?: 'Statistics';
  /** The number of completed courses by the user */
  completedCoursesCount: Scalars['Int']['output'];
  /** The number of enrolled courses by the user */
  enrolledCoursesCount: Scalars['Int']['output'];
};

/** The subject info */
export type Subject = {
  __typename?: 'Subject';
  /** The courses linked to this subject. */
  courses: Array<Course>;
  /** The name of this subject. */
  denomination: Scalars['String']['output'];
  /** A unique id of this subject. */
  id: Scalars['ID']['output'];
  /** The programs linked to this subject. */
  programs: Array<Program>;
};

/** The properties of a teacher account */
export type Teacher = {
  __typename?: 'Teacher';
  /** The avatar url of this teacher */
  avatar_url?: Maybe<Scalars['String']['output']>;
  /** A short biography of the teacher */
  bio?: Maybe<Scalars['String']['output']>;
  /** List of courses created by the teacher */
  courses: Array<Course>;
  /** A detailed description of the teacher */
  description?: Maybe<Scalars['String']['output']>;
  /** The first name of the teacher */
  first_name?: Maybe<Scalars['String']['output']>;
  /** A unique id of this account */
  id: Scalars['ID']['output'];
  /** Checks if the current user can follow this teacher (blocks self-follow). */
  isAllowedToFollow: Scalars['Boolean']['output'];
  /** Indicates if the current user is following this teacher */
  isFollowed: Scalars['Boolean']['output'];
  /** The last name of the teacher */
  last_name?: Maybe<Scalars['String']['output']>;
  /** The name of the teacher */
  name?: Maybe<Scalars['String']['output']>;
  /** The nickname of the teacher */
  nickname?: Maybe<Scalars['String']['output']>;
  /** List of programs created by the teacher */
  programs: Array<Program>;
};

/** A text content component. */
export type TextContent = {
  __typename?: 'TextContent';
  /** The id of the component this text content belongs to. */
  component_id: Scalars['ID']['output'];
  /** The text content. */
  content: Scalars['String']['output'];
  /** The denomination of the component. */
  denomination: Scalars['String']['output'];
  /** A unique id of this text content component. */
  id: Scalars['ID']['output'];
  /** A flag indicating whether the component is published */
  is_published: Scalars['Boolean']['output'];
  /** A flag indicating whether the component is required to continue. */
  is_required: Scalars['Boolean']['output'];
  /** The progress of this component for the current user */
  progress?: Maybe<ContentComponentProgress>;
  /** The rank of the component */
  rank: Scalars['Int']['output'];
  /** The type of the component. */
  type: ComponentType;
};

export type TextContentInput = {
  /** The text content. */
  content: Scalars['String']['input'];
};

export type UpdateContentComponentBaseInput = {
  /** The denomination of the component. */
  denomination?: InputMaybe<Scalars['String']['input']>;
  /** The content component ID. */
  id: Scalars['ID']['input'];
  /** A flag indicating whether the component is published. */
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  /** A flag indicating whether the component is required to continue. */
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
  /** The type of the component. */
  type: ComponentType;
};

/** Input for updating content component progress */
export type UpdateContentComponentProgressInput = {
  /** The content component ID */
  contentComponentId: Scalars['String']['input'];
  /** Flag to indicate if the content component is completed */
  isCompleted: Scalars['Boolean']['input'];
};

/** Input for updating a content component rank */
export type UpdateContentComponentRankInput = {
  /** The ID of the content component */
  id: Scalars['String']['input'];
  /** The new rank of the content component */
  rank: Scalars['Int']['input'];
};

/** Input for updating a course record. */
export type UpdateCourseInfoInput = {
  /** The denomination of this course */
  denomination?: InputMaybe<Scalars['String']['input']>;
  /** The description of this course */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The end date of the course */
  end_date?: InputMaybe<Scalars['Date']['input']>;
  /** A link to an external resource. */
  external_resource_link?: InputMaybe<Scalars['String']['input']>;
  /** The ID of this course */
  id: Scalars['ID']['input'];
  /** The image of this course */
  image?: InputMaybe<Scalars['String']['input']>;
  /** A flag to indicate whether this course is published or not */
  is_published?: InputMaybe<Scalars['Boolean']['input']>;
  /** The language of this course. */
  language?: InputMaybe<Scalars['String']['input']>;
  /** The difficulty level of this course */
  level?: InputMaybe<CourseLevel>;
  /** List of objectives for the course */
  objectives?: InputMaybe<Array<CourseObjectiveInput>>;
  /** List of requirements for the course */
  requirements?: InputMaybe<Array<CourseRequirementInput>>;
  /** The slug of this course */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** The start date of the course */
  start_date?: InputMaybe<Scalars['Date']['input']>;
  /** List of subject IDs to associate with the course */
  subjectIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The subtitle of this course */
  subtitle?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a course section record. */
export type UpdateCourseSectionInfo = {
  /** The denomination of this course section. */
  denomination?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the course section. */
  id: Scalars['ID']['input'];
  /** A flag to indicate whether this course section is published or not. */
  is_published?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input for updating a course section item rank */
export type UpdateCourseSectionItemRankInput = {
  /** The ID of the course section item */
  id: Scalars['String']['input'];
  /** The new rank of the course section item */
  rank: Scalars['Int']['input'];
};

/** Input for updating a course section rank */
export type UpdateCourseSectionRankInput = {
  /** The ID of the course section */
  id: Scalars['String']['input'];
  /** The new rank of the course section */
  rank: Scalars['Int']['input'];
};

/** The result of the updateCourseStatus mutation. */
export type UpdateCourseStatusResult = {
  __typename?: 'UpdateCourseStatusResult';
  /** The updated course information. */
  course?: Maybe<Course>;
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Input for updating a lesson record. */
export type UpdateLessonInfoInput = {
  /** The denomination of this lesson. */
  denomination?: InputMaybe<Scalars['String']['input']>;
  /** The duration of the lesson in minutes. */
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** The ID of the lesson. */
  id: Scalars['ID']['input'];
  /** A flag to indicate whether this lesson is published or not. */
  is_published?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The result of the updateProfile mutation. */
export type UpdateProfileResult = {
  __typename?: 'UpdateProfileResult';
  /** A list of errors that occurred executing this mutation. */
  errors: Array<Error>;
  /** Indicates if the mutation was successful. */
  success: Scalars['Boolean']['output'];
  /** The updated user information. */
  user?: Maybe<Account>;
};

/** Input for updating a program record. */
export type UpdateProgramInfoInput = {
  /** The denomination of this program */
  denomination?: InputMaybe<Scalars['String']['input']>;
  /** The description of this program */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The ID of this program */
  id: Scalars['ID']['input'];
  /** The image of this program */
  image?: InputMaybe<Scalars['String']['input']>;
  /** A flag to indicate whether this program is published or not */
  is_published?: InputMaybe<Scalars['Boolean']['input']>;
  /** The difficulty level of this program */
  level?: InputMaybe<ProgramLevel>;
  /** List of objectives for the program */
  objectives?: InputMaybe<Array<ProgramObjectiveInput>>;
  /** List of requirements for the program */
  requirements?: InputMaybe<Array<ProgramRequirementInput>>;
  /** The slug of this program */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** List of subject IDs to associate with the program */
  subjectIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The subtitle of this program */
  subtitle?: InputMaybe<Scalars['String']['input']>;
};

/** A video content component. */
export type VideoContent = {
  __typename?: 'VideoContent';
  /** The id of the component this video content belongs to. */
  component_id: Scalars['ID']['output'];
  /** The denomination of the component. */
  denomination: Scalars['String']['output'];
  /** A unique id of this video content component. */
  id: Scalars['ID']['output'];
  /** A flag indicating whether the component is published */
  is_published: Scalars['Boolean']['output'];
  /** A flag indicating whether the component is required to continue. */
  is_required: Scalars['Boolean']['output'];
  /** The progress of this component for the current user */
  progress?: Maybe<ContentComponentProgress>;
  /** The rank of the component */
  rank: Scalars['Int']['output'];
  /** The type of the component. */
  type: ComponentType;
  /** The URL of the video. */
  url: Scalars['String']['output'];
};

export type VideoContentInput = {
  /** The URL of the video. */
  url: Scalars['String']['input'];
};

/** A YouTube content component. */
export type YouTubeContent = {
  __typename?: 'YouTubeContent';
  /** The id of the component this video content belongs to. */
  component_id: Scalars['ID']['output'];
  /** The denomination of the component. */
  denomination: Scalars['String']['output'];
  /** The description of the YouTube. */
  description?: Maybe<Scalars['String']['output']>;
  /** A unique id of this video content component. */
  id: Scalars['ID']['output'];
  /** A flag indicating whether the component is published */
  is_published: Scalars['Boolean']['output'];
  /** A flag indicating whether the component is required to continue. */
  is_required: Scalars['Boolean']['output'];
  /** The progress of this component for the current user */
  progress?: Maybe<ContentComponentProgress>;
  /** The rank of the component */
  rank: Scalars['Int']['output'];
  /** The type of the component. */
  type: ComponentType;
  /** The YouTube video id. */
  youtube_video_id: Scalars['String']['output'];
};

export type YouTubeContentInput = {
  /** The description of the YouTube. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The video ID of the YouTube video. */
  videoId: Scalars['String']['input'];
};
