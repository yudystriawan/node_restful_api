// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, HttpErrors, param, Response, RestBindings} from '@loopback/rest';
import {UserRepository} from '../repositories';

// import {inject} from '@loopback/core';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
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
}
