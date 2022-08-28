import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRouterMock } from 'vue-router-mock';

import { store } from '../../services/store';

vi.mock('bootstrap-vue-3');
vi.mock('../../services/user/userService');
vi.mock('../../services/todo/todoService');
vi.mock('../../services/store', () => ({
  store: {},
}));

import Home from './Home.vue';

describe('Home', async () => {
  const router = createRouterMock({});
  let view: VueWrapper<any>;

  beforeEach(() => {
    router.reset();
  });

  it('redirects to sign in if no user', async () => {
    store.user = null;

    view = mount(Home, {
      global: {
        plugins: [router],
      },
    });

    expect(router.push).toBeCalledWith('/signin');
    expect(router.push).toBeCalledTimes(1);
  });

  it('redirects to notes if there is a user', async () => {
    // @ts-expect-error Tests
    store.user = {
      username: 'user',
    };

    view = mount(Home, {
      global: {
        plugins: [router],
      },
    });

    expect(router.push).toBeCalledWith('/todonotes');
    expect(router.push).toBeCalledTimes(1);
  });
});
