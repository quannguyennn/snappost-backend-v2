export interface IErrorName {
  [key: string]: string;
}

export const errorName: IErrorName = {
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_EXIST: 'USER_NOT_EXIST',
  USER_DEACTIVE: '계정이 비활성화되었습니다. 사이트 관리자에게 문의하십시오.',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_FORMAT: 'INVALID_FORMAT',
  FIND_USER_NOT_EXIST: '등록된 연락처 또는 이름이 아닙니다. 다시 확인해주세요.',
  COUPON_EXIST: 'COUPON_EXIST',
  COUPON_NOT_EXIST: 'COUPON_NOT_EXIST',
  LAUNDRY_CODE_EXIST: 'LAUNDRY_CODE_EXIST',
  LAUNDRY_CODE_NOT_EXIST: 'LAUNDRY_CODE_NOT_EXIST',
  EMAIL_EXIST: '해당 이메일은 이미 사용중입니다.',
  PHONE_EXIST: '이미 사용 중인 전화번호입니다.',

  LOGIN_SNS_FAIL: 'LOGIN_SNS_FAIL',
  INVALID_EMAIL_PASSWORD: '이메일 또는비밀번호가 일치하지 않습니다.',
  EMAIL_NOT_EXIST: '이메일이 없습니다.',
  CONFIRM_PASSWORD_DONT_MATCH: '입력하신 비밀번호가 일치하지 않습니다.',
  INVALID_PASSWORD: '8~15자의 영문 대/소문자, 숫자 및 특수문자 조합으로 입력하셔야 합니다.',
  INVALID_OTP: '인증번호가 정확하지 않습니다.',
  INVALID_EMAIL: 'Email invalidate',
  TOO_SHORT: '$property is too short. Maximal length is $constraint1 characters',
  TOO_LONG: '$property is too long. Maximal length is $constraint1 characters',

  MANY_REQUEST: 'MANY_REQUEST',
  INVALID_SNS_TOKEN: 'INVALID_SNS_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  SLOT_DISABLED: '사용할 수없는 시간',
  PAYMENT_FAILED: '결제 실패',

  INVALIDE_TIME: '시작 시간은 종료 시간보다 작아야합니다.',
  INVALID_OLD_PASSWORD: '비밀번호가 맞지 않습니다',
};
