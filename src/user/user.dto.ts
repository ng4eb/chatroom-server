import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GetUsersResponseDto {
  id: number;
  gender: string;
  username: string;
  @Exclude()
  password: string;
  @Exclude()
  phone: string;
  @Exclude()
  email: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  @Expose({ name: 'craetedAt' })
  createdAt() {
    return this.created_at;
  }

  constructor(partial: Partial<GetUsersResponseDto>) {
    Object.assign(this, partial);
  }
}

export class GetUserResponseDto {
  id: number;
  gender: string;
  username: string;
  @Exclude()
  password: string;
  @Exclude()
  phone: string;
  @Exclude()
  email: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  constructor(partial: Partial<GetUserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'craetedAt' })
  createdAt() {
    return this.created_at;
  }

  @Expose({ name: 'updatedAt' })
  updatedAt() {
    return this.updated_at;
  }
}

export class GetProflieResponseDto {
  constructor(partial: Partial<GetUserResponseDto>) {
    Object.assign(this, partial);
  }

  id: number;
  gender: string;
  username: string;
  @Exclude()
  password: string;
  phone: string;
  email: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  @Expose({ name: 'craetedAt' })
  createdAt() {
    return this.created_at;
  }

  @Expose({ name: 'updatedAt' })
  updatedAt() {
    return this.updated_at;
  }
}

export class UpdateProfileDto {
  @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: 'phone must be a valid number',
  })
  @IsString()
  @IsOptional()
  phone?: string;
  @IsString()
  @IsOptional()
  password?: string;
}
