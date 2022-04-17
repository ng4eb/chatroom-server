import { Exclude, Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ChatMessageResponseDto {
  id: string;
  @Exclude()
  sender_id: number;
  @Exclude()
  replied_id: string;
  @Exclude()
  created_at: Date;

  constructor(partial: Partial<ChatMessageResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'senderId' })
  senderId() {
    return this.sender_id;
  }

  @Expose({ name: 'repliedId' })
  repliedId() {
    return this.replied_id;
  }

  @Expose({ name: 'createdAt' })
  createdAt() {
    return this.created_at;
  }
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsPositive()
  @IsInt()
  @IsOptional()
  repliedId?: number;
}
