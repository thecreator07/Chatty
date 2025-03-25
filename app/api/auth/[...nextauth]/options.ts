import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from 'lib/Db';
import UserModel from 'model/User';
import jwt from "jsonwebtoken"
// import UserModel from '@/model/User';
// import dbConnect from '@/lib/Db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                mobile: { label: 'Phone Number', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne(
                        { mobile: credentials.identifier });
                    if (!user) {
                        throw new Error('No user found with this number');
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPasswordCorrect) {
                        const token = jwt.sign(
                            {
                                _id: (user as any)._id.toString(),
                                mobile: user.mobile,
                                username: user.username
                            },
                            process.env.NEXTAUTH_SECRET!,
                            { expiresIn: '30d' }
                        );
                        return { ...user.toObject(), token }
                    } else {
                        throw new Error('Incorrect password');
                    }
                } catch (err: any) {
                    throw new Error(err);
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.username = user.username
                token.mobile = user.mobile;
                token.token = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id,
                    session.user.username = token.username,
                    session.user.mobile = token.mobile,
                    session.user.token = token.token
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