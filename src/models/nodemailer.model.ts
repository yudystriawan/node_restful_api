import {Model, model, property} from '@loopback/repository';
import {Envelope} from './envelope.model';

@model()
export class Nodemailer extends Model {
  @property({
    type: 'array',
    itemType: 'string',
  })
  accepted?: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  rejected: string[];

  @property({
    type: 'number',
  })
  type?: number;

  @property({
    type: 'number',
  })
  messageTime?: number;

  @property({
    type: 'number',
  })
  messageSize?: number;

  @property({
    type: 'string',
  })
  response?: string;

  @property(() => Envelope)
  envelope: Envelope;

  @property({
    type: 'string',
  })
  messageId?: string;

  constructor(data?: Partial<Nodemailer>) {
    super(data);
  }
}

export interface NodemailerRelations {
  // describe navigational properties here
}

export type NodemailerWithRelations = Nodemailer & NodemailerRelations;
