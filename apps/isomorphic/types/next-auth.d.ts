import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';
import { ROLES } from '@/config/constants';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: keyof typeof ROLES | null;
      // currentTeamId: string | null;
    } & DefaultSession['user'];
    frappeSession?: {
      success: boolean;
      user: string;
      sid: string;
      message: string;
    } | null;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    role?: keyof typeof ROLES | null;
    frappeSession?: {
      success: boolean;
      user: string;
      sid: string;
      message: string;
    } | null;
  }
}
