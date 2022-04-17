import { Exclude, Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ChatMessageResponseDto {
  constructor(partial: Partial<ChatMessageResponseDto>) {
    Object.assign(this, partial);
  }
  id: string;
  @Exclude()
  sender_id: number;
  @Expose({ name: 'senderId' })
  senderId() {
    return this.sender_id;
  }
  @Exclude()
  replied_id: string;
  @Expose({ name: 'repliedId' })
  repliedId() {
    return this.replied_id;
  }
  @Exclude()
  created_at: Date;
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
