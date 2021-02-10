import {
  authenticate,
  TokenService,
  UserService,
} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {User, UserRoles} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasher, validateCredentials} from '../services';
import {CredentialsRequestBody} from './specs/auth.specs';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
  ) {}

  @post('sign-up')
  @response(200, {
    description: 'Create new user',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': User,
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            exclude: ['id', 'role', 'verificationToken', 'verified'],
          }),
        },
      },
    })
    newUserRequest: Credentials,
  ): Promise<User> {
    newUserRequest.role = UserRoles.CUSTOMER;

    validateCredentials(_.pick(newUserRequest, ['email', 'password']));

    const password = await this.passwordHasher.hashPassword(
      newUserRequest.password,
    );

    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    await this.userRepository.userCredentials(savedUser.id).create({password});

    return savedUser;
  }

  @post('sign-in')
  @response(200, {
    description: 'Login user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);

    const userProfile = this.userService.convertToUserProfile(user);

    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @authenticate('jwt')
  @get('current-user')
  @response(200, {
    description: 'Get current user',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['verificationToken'],
        }),
      },
    },
  })
  async currentUser(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<User> {
    const id = currentUserProfile[securityId];

    const user = await this.userRepository.findById(id);

    return user;
  }
}
