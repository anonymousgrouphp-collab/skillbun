import { emailSignupHandlers } from '@/utils/server/emailSignupServer';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const POST = emailSignupHandlers.verifyCode;
