// ===================================================================
// Mega E-Commerce Backend - User Interface
// TypeScript interfaces for User module
// ===================================================================

import { Types, Model, Document } from 'mongoose';

// User Social Links
export interface IUserSocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

// User Address
export interface IUserAddress {
  _id?: Types.ObjectId;
  label: string;           // Home, Office, etc.
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Main User Interface
export interface IUser extends Document {
  _id: Types.ObjectId;

  // Auth
  email: string;
  password: string;

  // Basic Info
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;

  // Extended Profile
  bio?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | '';

  // Addresses
  addresses: IUserAddress[];
  defaultAddress?: Types.ObjectId;

  // Social
  socialLinks?: IUserSocialLinks;

  // Role & Status
  role: 'super_admin' | 'admin' | 'customer';
  status: 'active' | 'blocked' | 'pending';
  isEmailVerified: boolean;
  isDeleted: boolean;

  // Statistics
  totalOrders: number;
  totalSpent: number;
  totalWishlistItems: number;

  // Password Reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User Instance Methods
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordChangedAfterJwtIssued(jwtTimestamp: number): boolean;
}

// User Model Type
export interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<IUser | null>;
  isUserExists(email: string): Promise<boolean>;
}

// Type aliases for backward compatibility
export type TUserRole = 'super_admin' | 'admin' | 'customer';
export type TUserStatus = 'active' | 'blocked' | 'pending';

// User Filters Interface
export interface IUserFilters {
  searchTerm?: string;
  role?: TUserRole;
  status?: TUserStatus;
  isEmailVerified?: boolean;
}
