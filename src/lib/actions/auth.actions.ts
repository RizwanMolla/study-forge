'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import dbConnect from '../db';
import User, { IUser } from '../models/user.model';
import { createSession, deleteSession } from '../session';
import { pbkdf2Sync, randomBytes } from 'crypto';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const hashToVerify = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
}

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { message: 'User with this email already exists.' };
    }

    const { salt, hash } = hashPassword(password);
    const userPassword = `${salt}:${hash}`;

    const newUser = await User.create({
      name,
      email,
      password: userPassword,
    });
    
    await createSession(String(newUser._id));

  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred. Please try again.' };
  }

  redirect('/study-zone');
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { email, password } = validatedFields.data;

  try {
    await dbConnect();
    const user: IUser | null = await User.findOne({ email });

    if (!user || !user.password) {
      return { message: 'Invalid email or password.' };
    }

    const [salt, storedHash] = user.password.split(':');
    const isPasswordValid = verifyPassword(password, storedHash, salt);
    
    if (!isPasswordValid) {
      return { message: 'Invalid email or password.' };
    }
    
    await createSession(String(user._id));
  
  } catch (error) {
      console.error(error);
      return { message: 'An unexpected error occurred. Please try again.' };
  }
  
  redirect('/study-zone');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}