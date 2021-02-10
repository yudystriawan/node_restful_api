// Uncomment these imports to begin using these cool features!

import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  HttpErrors,
  param,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {UserRepository} from '../repositories';
import {EmailService} from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.EmailService')
    public emailService: EmailService,
  ) {}

  @get('users/verification-email/{verificationToken}')
  async verificationEmail(
    @param.path.string('verificationToken') verificationToken: string,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    const user = await this.userRepository.findOne({
      where: {verificationToken},
    });

    if (!user) {
      throw new HttpErrors.UnprocessableEntity(`User not found`);
    }

    user.verificationToken = undefined;
    user.verified = true;

    await this.userRepository.updateById(user.id, user);

    res.redirect('/');
  }

  @authenticate('jwt')
  @get('users/resend-verification-email')
  @response(200, {
    description: 'Resend verification email',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async resendVerificationEmail(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<{status: string; message: string}> {
    const id = currentUserProfile[securityId];

    const user = await this.userRepository.findById(id);

    if (!user.verificationToken) {
      return {
        status: 'FAILED',
        message: 'User already verified.',
      };
    }

    await this.emailService.sendConfirmationMail(user);

    return {
      status: 'SUCCESS',
      message: 'Email verification has been sent.',
    };
  }
}
