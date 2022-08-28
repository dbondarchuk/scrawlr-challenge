import { config } from '@vue/test-utils';
import {
  BForm,
  BFormGroup,
  BButton,
  BCard,
  BFormInput,
  BFormSelect,
} from 'bootstrap-vue-3';

config.global.stubs = {
  BForm,
  BFormGroup,
  BButton,
  BCard,
  BFormInput,
  BFormSelect,
};
