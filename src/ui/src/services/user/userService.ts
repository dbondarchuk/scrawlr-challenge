import { inject } from 'vue';
import VueCookies from 'vue-cookies';
import { SignInRequest, SignInResponse } from '../../models/auth/signIn';
import { SignUpRequest, SignUpResponse } from '../../models/auth/signUp';
import { UserToken } from '../../models/auth/userToken';
import { getApiUrl, toFormData } from '../helpers';
import { store } from '../store';

const cookieName = 'user';

export class UserService {
  public async signIn(signIn: SignInRequest): Promise<boolean> {
    try {
      const response = await fetch(`${getApiUrl()}/user/login`, {
        body: toFormData(signIn),
        method: 'POST',
      });

      if (!response.ok) return false;

      const token = (await response.json()) as SignInResponse;
      store.user = {
        username: signIn.username,
        token: token.api_token,
      };

      this.saveCookie(store.user);

      return true;
    } catch {
      return false;
    }
  }

  public async signUp(signUp: SignUpRequest): Promise<boolean> {
    try {
      const response = await fetch(`${getApiUrl()}/user/signup`, {
        body: toFormData(signUp),
        method: 'POST',
      });

      if (!response.ok) return false;

      const token = await response.text();
      store.user = {
        username: signUp.username,
        token: token,
      };

      this.saveCookie(store.user);

      return true;
    } catch {
      return false;
    }
  }

  public async logout(): Promise<boolean> {
    try {
      const response = await fetch(
        `${getApiUrl()}/user/logout?api_token=${store.user?.token}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) return false;
      store.user = undefined;
      this.removeCookie();

      return true;
    } catch {
      return false;
    }
  }

  public restore() {
    // @ts-expect-error Not good importing
    const user = VueCookies.get(cookieName) as UserToken;
    if (user && user.token) {
      store.user = user;
    }
  }

  private removeCookie() {
    // @ts-expect-error Not good importing
    VueCookies.remove(cookieName);
  }

  private saveCookie(userToken: UserToken) {
    // @ts-expect-error Not good importing
    VueCookies.set(cookieName, userToken, '1m');
  }
}
