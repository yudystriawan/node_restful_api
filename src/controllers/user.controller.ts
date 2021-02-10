// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {param, post, response} from '@loopback/rest';
import {UserRepository} from '../repositories';

// import {inject} from '@loopback/core';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('users/verification-email/{verificationToken}')
  @response(200, {
    description: 'Verification email user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async verificationEmail(
    @param.path.string('verificationToken') verificationToken: string,
  ): Promise<{status: string}> {
    const user = await this.userRepository.findOne({
      where: {verificationToken},
    });

    if (!user) {
      return {
        status: 'FAILED',
      };
    }

    user.verificationToken = undefined;
    user.verified = true;

    await this.userRepository.updateById(user.id, user);

    return {status: 'SUCCESS'};
  }
}
