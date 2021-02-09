import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';

export async function basicAuth(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  let currentUser: UserProfile;

  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], ['id', 'name', 'role']);

    currentUser = {
      [securityId]: user.id,
      name: user.name,
      role: user.role,
    };
  } else {
    return AuthorizationDecision.DENY;
  }

  if (!currentUser) {
    return AuthorizationDecision.DENY;
  }

  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;
  if (metadata.allowedRoles!.includes(currentUser.role)) {
    roleIsAllowed = true;
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  return AuthorizationDecision.ALLOW;
}
