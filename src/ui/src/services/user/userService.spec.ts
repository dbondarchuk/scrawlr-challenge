import { afterAll, describe, expect, it, vi } from 'vitest';
import VueCookies from 'vue-cookies';
import { SignInRequest, SignInResponse } from '../../models/auth/signIn';
import { SignUpRequest } from '../../models/auth/signUp';
import { UserToken } from '../../models/auth/userToken';
import { toFormData } from '../helpers';
import { store } from '../store';

import { UserService } from './userService';

vi.unmock('./userService');
vi.mock('../store', () => ({
  store: {},
}));

const fakeUrl = 'http://localhost:4321';
const cookieName = 'user';

vi.mock('../helpers', () => ({
  getApiUrl: () => fakeUrl,
  toFormData: (obj: any) => obj,
}));

vi.mock('vue-cookies');

describe('UserService', async () => {
  let fetchCopy = global.fetch;

  afterAll(() => {
    global.fetch = fetchCopy;
  });

  describe('signIn', async () => {
    const signIn: SignInRequest = {
      username: 'username',
      password: 'password',
    };

    it('returns false if response not okay', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
      });

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.signIn(signIn);

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/login`, {
        body: toFormData(signIn),
        method: 'POST',
      });
    });

    it('returns false if request has failed', async () => {
      const fetchMock = vi.fn().mockRejectedValue(false);

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.signIn(signIn);

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/login`, {
        body: toFormData(signIn),
        method: 'POST',
      });
    });

    it('returns okay if request successful', async () => {
      const token = '1234334';
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            api_token: token,
          } as SignInResponse),
      });

      global.fetch = fetchMock;

      const setCookieMock = vi.fn();

      //@ts-expect-error set is a function
      VueCookies.set = setCookieMock;

      const userService = new UserService();
      const result = await userService.signIn(signIn);

      expect(result).toBeTruthy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/login`, {
        body: toFormData(signIn),
        method: 'POST',
      });

      const expectedUserToken: UserToken = {
        username: signIn.username,
        token: token,
      };

      expect(setCookieMock).toBeCalledTimes(1);
      expect(setCookieMock).toBeCalledWith(cookieName, expectedUserToken, '1m');

      expect(store.user).toStrictEqual(expectedUserToken);
    });
  });

  describe('signUp', async () => {
    const signUp: SignUpRequest = {
      username: 'username',
      password: 'password',
      confirm_password: 'password',
    };

    it('returns false if response not okay', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
      });

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.signUp(signUp);

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/signup`, {
        body: toFormData(signUp),
        method: 'POST',
      });
    });

    it('returns false if request has failed', async () => {
      const fetchMock = vi.fn().mockRejectedValue(false);

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.signUp(signUp);

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/signup`, {
        body: toFormData(signUp),
        method: 'POST',
      });
    });

    it('returns okay if request successful', async () => {
      const token = '1234334';
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(token),
      });

      global.fetch = fetchMock;

      const setCookieMock = vi.fn();

      //@ts-expect-error set is a function
      VueCookies.set = setCookieMock;

      const userService = new UserService();
      const result = await userService.signUp(signUp);

      expect(result).toBeTruthy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(`${fakeUrl}/user/signup`, {
        body: toFormData(signUp),
        method: 'POST',
      });

      const expectedUserToken: UserToken = {
        username: signUp.username,
        token: token,
      };

      expect(setCookieMock).toBeCalledTimes(1);
      expect(setCookieMock).toBeCalledWith(cookieName, expectedUserToken, '1m');

      expect(store.user).toStrictEqual(expectedUserToken);
    });
  });

  describe('logout', async () => {
    const token = '1334343';

    it('returns false if response not okay', async () => {
      store.user = {
        username: cookieName,
        token: token,
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
      });

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.logout();

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/user/logout?api_token=${token}`,
        {
          method: 'POST',
        },
      );
    });

    it('returns false if request has failed', async () => {
      store.user = {
        username: cookieName,
        token: token,
      };

      const fetchMock = vi.fn().mockRejectedValue(false);

      global.fetch = fetchMock;

      const userService = new UserService();
      const result = await userService.logout();

      expect(result).toBeFalsy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/user/logout?api_token=${token}`,
        {
          method: 'POST',
        },
      );
    });

    it('returns okay if request successful', async () => {
      store.user = {
        username: cookieName,
        token: token,
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(token),
      });

      global.fetch = fetchMock;

      const removeCookieMock = vi.fn();

      //@ts-expect-error set is a function
      VueCookies.remove = removeCookieMock;

      const userService = new UserService();
      const result = await userService.logout();

      expect(result).toBeTruthy();
      expect(fetchMock).toBeCalledTimes(1);

      expect(fetchMock).toBeCalledWith(
        `${fakeUrl}/user/logout?api_token=${token}`,
        {
          method: 'POST',
        },
      );

      expect(removeCookieMock).toBeCalledTimes(1);
      expect(removeCookieMock).toBeCalledWith(cookieName);

      expect(store.user).toBeUndefined();
    });
  });

  describe('restore', async () => {
    it('sets store user if cookie is okay', async () => {
      const user = {
        username: cookieName,
        token: '134343545',
      };

      const getCookieMock = vi.fn().mockReturnValue(user);

      // @ts-expect-error get is a function
      VueCookies.get = getCookieMock;

      new UserService().restore();

      expect(store.user).toStrictEqual(user);
    });

    it('does nothing if cookie is missing', async () => {
      store.user = undefined;
      const getCookieMock = vi.fn().mockReturnValue(null);

      // @ts-expect-error get is a function
      VueCookies.get = getCookieMock;

      new UserService().restore();

      expect(store.user).toBeUndefined();
      expect(getCookieMock).toBeCalledWith(cookieName);
    });

    it('does nothing if cookie is wrong', async () => {
      store.user = undefined;
      const getCookieMock = vi.fn().mockReturnValue({
        username: 'username',
        password: 'password',
      });

      // @ts-expect-error get is a function
      VueCookies.get = getCookieMock;

      new UserService().restore();

      expect(store.user).toBeUndefined();
      expect(getCookieMock).toBeCalledWith(cookieName);
    });
  });
});
