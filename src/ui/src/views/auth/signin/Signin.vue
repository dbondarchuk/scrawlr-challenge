<template>
  <div>
    <Background></Background>
    <b-card title="Sign in" class="signin">
      <div class="mt-3">
        <b-form @submit="onSubmit">
          <div v-show="loginFailed" id="error" class="text-danger mb-3">
            Username/password is incorrect
          </div>
          <b-form-group
            id="username-group"
            label="Username:"
            label-for="username"
            floating
          >
            <b-form-input
              id="username"
              v-model="form.username"
              @focus="resetError"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="password-group"
            label="Password:"
            label-for="password"
            floating
          >
            <b-form-input
              id="password"
              v-model="form.password"
              @focus="resetError"
              type="password"
              required
            ></b-form-input>
          </b-form-group>
          <div class="text-center mt-4">
            <b-button type="submit" variant="primary">Sign in</b-button>
          </div>

          <div class="mt-4">
            Don't have an account?
            <router-link to="/signup">Create a new one!</router-link>
          </div>
        </b-form>
      </div>
    </b-card>
  </div>
</template>

<style scoped>
.signin {
  max-width: 600px;
  margin: 0 auto;
}
</style>

<script setup lang="ts">
import { SignInRequest } from '../../../models/auth/signIn';
import { UserService } from '../../../services/user/userService';
import Background from '../../../components/Background.vue';

import { ref, computed, reactive, nextTick } from 'vue';
import { useToast } from 'bootstrap-vue-3';
import { useRouter } from 'vue-router';
let toast = useToast();

const userService = new UserService();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
}) as SignInRequest;

const loginFailed = ref(false);

const resetError = () => (loginFailed.value = false);

const onSubmit = async (event: SubmitEvent) => {
  event.preventDefault();
  loginFailed.value = false;
  if (!form.username || !form.password) return;

  const response = await userService.signIn(form);

  if (!response) {
    loginFailed.value = true;
  } else {
    toast.show(
      { title: 'Success!', body: 'You have successfully signed in' },
      { variant: 'success' },
    );
    router.push('/todonotes');
  }
};
</script>
