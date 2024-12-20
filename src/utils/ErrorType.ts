export enum ErrorType {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SIGN_UP_FIRST = 'SIGN_UP_FIRST',
  INVALID_URL = 'INVALID_URL',
  INVALID_STATE = 'INVALID_STATE',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  OIDC_NOT_FOUND = 'OIDC_NOT_FOUND',
  OIDC_INITIALIZE_FAILED = 'OIDC_INITIALIZE_FAILED',
  OIDC_INVALID_PROVIDER = 'OIDC_INVALID_PROVIDER',
  NO_FILE_UPLOADED = 'NO_FILE_UPLOADED',
  NO_FILE_PATH_PROVIDED = 'NO_FILE_PATH_PROVIDED',
  UPLOADING_FILE_FAILED = 'UPLOADING_FILE_FAILED',
  INVALID_FORM_VALUES = 'INVALID_FORM_VALUES',
  INVALID_INPUT = 'INVALID_INPUT',
  UPDATING_PROFILE_PIC_FAILED = 'UPDATING_PROFILE_PIC_FAILED',
}
