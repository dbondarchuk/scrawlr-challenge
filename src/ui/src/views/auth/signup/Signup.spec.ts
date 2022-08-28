import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { UserService } from '../../../services/user/userService';

vi.mock('bootstrap-vue-3');
vi.mock('../src/services/user/userService');

import Signup from './Signup.vue';

describe('Sign up view', async () => {
  const toast = {
    show: vi.fn().mockImplementation(() => {}),
  };

  // @ts-expect-error Tests
  (await import('bootstrap-vue-3')).useToast.mockReturnValue(toast);

  const router = createRouterMock({});
  let view: VueWrapper<any>;

  beforeEach(() => {
    router.reset();
    view = mount(Signup, {
      global: {
        stubs: ['router-link'],
        plugins: [router],
      },
    });
  });

  it('has fields', () => {
    expect(view.find('#username')).not.toBeNull();
    expect(view.find('#password')).not.toBeNull();
    expect(view.find('#confirm-password')).not.toBeNull();
  });

  it('redirects to notes if success', async () => {
    const user = 'user';
    const passwd = 'password';

    const signUpMock = vi.fn().mockResolvedValueOnce(true);
    UserService.prototype.signUp = signUpMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);
    await view.find('#confirm-password').setValue(passwd);

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signUpMock).toBeCalledTimes(1);
    expect(signUpMock).toBeCalledWith({
      username: user,
      password: passwd,
      confirm_password: passwd,
    });

    expect(router.push).toBeCalledTimes(1);
    expect(router.push).toBeCalledWith('/todonotes');
  });

  it('shows error message if failed', async () => {
    const user = 'user';
    const passwd = 'password';

    const signUpMock = vi.fn().mockResolvedValueOnce(false);
    UserService.prototype.signUp = signUpMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);
    await view.find('#confirm-password').setValue(passwd);

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signUpMock).toBeCalledTimes(1);
    expect(signUpMock).toBeCalledWith({
      username: user,
      password: passwd,
      confirm_password: passwd,
    });

    expect(router.push).toBeCalledTimes(0);

    expect(view.find('#error').isVisible()).toBeTruthy();
  });

  it('shows error message for short passwd', async () => {
    const user = 'user';
    const passwd = 'passwd';

    const signUpMock = vi.fn().mockResolvedValueOnce(false);
    UserService.prototype.signUp = signUpMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);
    await view.find('#confirm-password').setValue(passwd);

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signUpMock).toBeCalledTimes(0);

    expect(router.push).toBeCalledTimes(0);

    const error = view.find('#password-group .invalid-feedback');
    expect(error.isVisible()).toBeTruthy();
    expect(error.text()).toBe(
      'Your password should contain at least 8 characters.',
    );
    //expect(view.find('#error').isVisible()).toBeFalsy();
  });

  it('shows error message for password mismatch', async () => {
    const user = 'user';
    const passwd = 'password';

    const signUpMock = vi.fn().mockResolvedValueOnce(false);
    UserService.prototype.signUp = signUpMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);
    await view.find('#confirm-password').setValue(passwd + '1');

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signUpMock).toBeCalledTimes(0);

    expect(router.push).toBeCalledTimes(0);

    const error = view.find('#confirm-password-group .invalid-feedback');
    expect(error.isVisible()).toBeTruthy();
    expect(error.text()).toBe("Passwords don't match.");
    //expect(view.find('#error').isVisible()).toBeFalsy();
  });

  it('shows error message for empty user', async () => {
    const user = 'u';
    const passwd = 'password';

    const signUpMock = vi.fn().mockResolvedValueOnce(false);
    UserService.prototype.signUp = signUpMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);
    await view.find('#confirm-password').setValue(passwd);

    await view.find('form').trigger('submit');
    await flushPromises();
    await nextTick();

    expect(signUpMock).toBeCalledTimes(0);

    expect(router.push).toBeCalledTimes(0);

    const error = view.find('#username-group .invalid-feedback');
    expect(error.isVisible()).toBeTruthy();
    expect(error.text()).toBe('Enter at least 4 characters.');
    //expect(view.find('#error').isVisible()).toBeFalsy();
  });
});
