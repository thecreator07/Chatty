// import dbConnect from '@/lib/dbConnect';
// import dbConnect from '@/lib/Db';
// import UserModel from '@/model/User';
import bcrypt from "bcryptjs"
import dbConnect from "lib/Db";
import UserModel from "model/User";
// import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, mobile, password } = await request.json();

        // Check if username already exists
        const existingUserByUsername = await UserModel.findOne({ username });
        if (existingUserByUsername) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 400 }
            );
        }

        // Check if mobile number already exists
        const existingUserByMobile = await UserModel.findOne({ mobile });
        if (existingUserByMobile) {
            return Response.json(
                {
                    success: false,
                    message: 'Mobile number is already registered',
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new UserModel({
            username,
            mobile,
            password: hashedPassword,
            status: 'online'
        });

        await newUser.save();

        return Response.json(
            {
                success: true,
                message: 'User registered successfully. Please verify your account.',
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error registering user:', error);
        return Response.json(
            {
                success: false,
                message: 'Error registering user',
            },
            { status: 500 }
        );
    }
}