<template>
  <div>
    <Background></Background>
    <b-card title="Sign up" class="signup">
      <div class="mt-3">
        <b-form @submit="onSubmit">
          <div v-show="registrationError" id="error" class="text-danger mb-3">
            Such username already exists
          </div>
          <b-form-group
            id="username-group"
            label="Username:"
            label-for="username"
            valid-feedback="Awesome!"
            :invalid-feedback="usernameFeedback"
            :state="usernameState"
            floating
          >
            <b-form-input
              id="username"
              v-model="form.username"
              @focus="resetError"
              :state="usernameState"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="password-group"
            label="Password"
            label-for="password"
            valid-feedback="Awesome!"
            :invalid-feedback="passwordFeedback"
            :state="passwordState"
            floating
          >
            <b-form-input
              id="password"
              v-model="form.password"
              @focus="resetError"
              type="password"
              :state="passwordState"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="confirm-password-group"
            label="Confirm password"
            label-for="confirm-password"
            valid-feedback="Awesome!"
            :invalid-feedback="confirmpasswordFeedback"
            :state="confirmPasswordState"
            floating
          >
            <b-form-input
              id="confirm-password"
              v-model="form.confirm_password"
              @focus="resetError"
              type="password"
              :state="confirmPasswordState"
              required
            ></b-form-input>
          </b-form-group>
          <div class="text-center mt-4">
            <b-button type="submit" variant="primary">Sign up</b-button>
          </div>

          <div class="mt-4">
            Already have an account?
            <router-link to="/signin">Sign in!</router-link>
          </div>
        </b-form>
      </div>
    </b-card>
  </div>
</template>

<style scoped>
.signup {
  max-width: 600px;
  margin: 0 auto;
}
</style>

<script setup lang="ts">
import { SignUpRequest } from '../../../models/auth/signUp.js';
import Background from '../../../components/Background.vue';

import { ref, computed, reactive, nextTick } from 'vue';
import { useToast } from 'bootstrap-vue-3';
import { UserService } from '../../../services/user/userService.js';
import { useRouter } from 'vue-router';
let toast = useToast();

const form = reactive<SignUpRequest>({
  username: '',
  password: '',
  confirm_password: '',
});

const userService = new UserService();
const router = useRouter();

const registrationError = ref(false);

const usernameState = computed(() => form.username.length >= 4);
const usernameFeedback = computed(() =>
  form.username.length > 0 ? 'Enter at least 4 characters.' : null,
);

const passwordState = computed(() => form.password.length >= 8);
const passwordFeedback = computed(() =>
  form.password.length > 0
    ? 'Your password should contain at least 8 characters.'
    : null,
);

const confirmPasswordState = computed(
  () =>
    form.confirm_password.length > 0 && form.confirm_password == form.password,
);
const confirmpasswordFeedback = computed(() =>
  form.confirm_password.length > 0 ? "Passwords don't match." : null,
);

const resetError = () => (registrationError.value = false);
const onSubmit = async (event: SubmitEvent) => {
  event.preventDefault();
  if (
    !usernameState.value ||
    !passwordState.value ||
    !confirmPasswordState.value
  )
    return;

  registrationError.value = false;

  const response = await userService.signUp(form);
  if (!response) {
    registrationError.value = true;
  } else {
    toast.show(
      { title: 'Success!', body: 'You have successfully signed up' },
      { variant: 'success' },
    );
    router.push('/todonotes');
  }
};
</script>
