import { Exclude, Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class ChatMessageResponseDto {
  id: string;
  content: string;
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

/* Used in HTTP Call; replaced with WebSocket Call */
// export class SendMessageDto {
//   @IsString()
//   @IsNotEmpty()
//   content: string;
//
//   @IsUUID()
//   @IsOptional()
//   repliedId?: number;
// }

/* Used in WebSocket Call */
export class SendMessageDto {
  @IsPositive()
  @IsInt()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  repliedId?: number;
}

export class ReadMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatroomId: string;
}
