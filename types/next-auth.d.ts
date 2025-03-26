import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      username?: string;
      mobile?:string,
      token?:string
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
      username?: string;
      mobile?:string,
      token?:string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
      username?: string;
      mobile?:string,
      token?:string
  }
}

// types/auth.d.ts
export interface User {
  _id: string;
  mobile: string;
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expires: Date;
}