import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserCredentials} from '.';

export enum UserRoles {
  CUSTOMER = 'customer',
  OWNER = 'owner',
  ADMIN = 'admin',
}

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
  })
  role?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  verified?: boolean;

  @property({
    type: 'string',
    defaultFn: 'uuidv4',
    hidden: true,
  })
  verificationToken?: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
