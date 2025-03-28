import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from 'lib/Db';
import UserModel, { User as DBUser } from 'model/User';
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                mobile: { label: 'Phone Number', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Record<'mobile' | 'password', string> | undefined): Promise<NextAuthUser | null> {
                if (!credentials) {
                    throw new Error('Credentials not provided');
                }

                await dbConnect();
                try {
                    const user = await UserModel.findOne({ mobile: credentials.mobile });
                    if (!user) {
                        throw new Error('No user found with this number');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials?.password, user.password);

                    if (isPasswordCorrect) {
                        const token = jwt.sign(
                            {
                                _id: (user as DBUser)._id.toString(),
                                mobile: user.mobile,
                                username: user.username,
                            },
                            process.env.NEXTAUTH_SECRET!,
                            { expiresIn: '30d' }
                        );
                        return {
                            id: user._id.toString(),
                            _id: user._id,
                            mobile: user.mobile,
                            username: user.username,
                            token: token,
                        };
                    } else {
                        return null;
                    }
                } catch (err: unknown) {
                    throw new Error(err instanceof Error ? err.message : 'Authentication failed');
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.username = user.username;
                token.mobile = user.mobile;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    _id: token._id,
                    username: token.username,
                    mobile: token.mobile,
                    token: token.token,
                };
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in',
    },
};