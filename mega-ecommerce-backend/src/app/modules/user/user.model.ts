// ===================================================================
// Mega E-Commerce Backend - User Model
// MongoDB User Schema with Mongoose
// ===================================================================

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import { IUser, IUserMethods, UserModel } from './user.interface';

// Address Sub-Schema
const addressSchema = new Schema({
  label: {
    type: String,
    required: true,
    default: 'Home',
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: 'Bangladesh',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

// User Schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    // Auth
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // Basic Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },

    // Extended Profile
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },

    // Addresses
    addresses: {
      type: [addressSchema],
      default: [],
    },
    defaultAddress: {
      type: Schema.Types.ObjectId,
    },

    // Social
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },

    // Role & Status
    role: {
      type: String,
      enum: {
        values: ['super_admin', 'admin', 'customer'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'blocked', 'pending'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Statistics
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalWishlistItems: {
      type: Number,
      default: 0,
    },

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Last Login
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ==================== Indexes ====================
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// ==================== Virtuals ====================
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ==================== Pre-Save Middleware ====================
userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, config.bcrypt_salt_rounds);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Filter out deleted users
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// ==================== Instance Methods ====================
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordChangedAfterJwtIssued = function (jwtTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// ==================== Static Methods ====================
userSchema.statics.findByEmail = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

userSchema.statics.isUserExists = async function (email: string) {
  const user = await this.findOne({ email });
  return !!user;
};

export const User = model<IUser, UserModel>('User', userSchema);
