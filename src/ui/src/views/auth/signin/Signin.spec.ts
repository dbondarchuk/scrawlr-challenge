import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { nextTick } from 'vue';
import { UserService } from '../../../services/user/userService';

vi.mock('bootstrap-vue-3');
vi.mock('../src/services/user/userService');

import Signin from './Signin.vue';

describe('Login view', async () => {
  const toast = {
    show: vi.fn().mockImplementation(() => {}),
  };

  // @ts-expect-error Tests
  (await import('bootstrap-vue-3')).useToast.mockReturnValue(toast);

  const router = createRouterMock({});
  const view = mount(Signin, {
    global: {
      stubs: ['router-link'],
      plugins: [router],
    },
  });

  beforeEach(() => {
    router.reset();
  });

  it('has fields', () => {
    expect(view.find('#username')).not.toBeNull();
    expect(view.find('#password')).not.toBeNull();
  });

  it('redirects to notes if success', async () => {
    const user = 'user';
    const passwd = 'passwd';

    const signInMock = vi.fn().mockResolvedValueOnce(true);
    UserService.prototype.signIn = signInMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signInMock).toBeCalledTimes(1);
    expect(signInMock).toBeCalledWith({ username: user, password: passwd });

    expect(router.push).toBeCalledTimes(1);
    expect(router.push).toBeCalledWith('/todonotes');
  });

  it('shows error message if failed', async () => {
    const user = 'user';
    const passwd = 'passwd';

    const signInMock = vi.fn().mockResolvedValueOnce(false);
    UserService.prototype.signIn = signInMock;

    await view.find('#username').setValue(user);
    await view.find('#password').setValue(passwd);

    await view.find('form').trigger('submit');

    await flushPromises();
    await nextTick();

    expect(signInMock).toBeCalledTimes(1);
    expect(signInMock).toBeCalledWith({ username: user, password: passwd });

    expect(router.push).toBeCalledTimes(0);

    expect(view.find('#error').isVisible()).toBeTruthy();
  });
});
