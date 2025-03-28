import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from 'lib/Db';
import UserModel, { User as DbUser } from 'model/User';
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                identifier: { label: 'mobile', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: Record<'identifier' | 'password', string> | undefined): Promise<NextAuthUser | null> {
                if (!credentials || !credentials.identifier || !credentials.password) {
                    throw new Error('Credentials not provided');
                }

                await dbConnect();
                try {
                    const user: DbUser | null = await UserModel.findOne({ mobile: credentials.identifier });
                    console.log(user)
                    if (!user) {
                        throw new Error('No user found with this number');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        const token = jwt.sign(
                            {
                                _id: user._id.toString(),
                                mobile: user.mobile,
                                username: user.username,
                            },
                            process.env.NEXTAUTH_SECRET!,
                            { expiresIn: '30d' }
                        );
                        return {
                            id: user.id,
                            _id: user._id.toString(),
                            username: user.username,
                            mobile: user.mobile,
                            token: token,
                            // This will be used for socket.io auth
                        };
                    } else {
                        throw new Error('Incorrect password');
                    }
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        throw new Error(err.message);
                    } else {
                        throw new Error('Authentication failed');
                    }
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
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.mobile = token.mobile;
                session.user.token = token.token;
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