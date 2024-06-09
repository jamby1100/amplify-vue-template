<script setup lang="ts">
import Todos from './components/Todos.vue'

import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.API,
  },
});
</script>

<template>
  <main>
    
    <authenticator>
      <template v-slot="{ user, signOut }">
        <h1>Hello {{user?.signInDetails?.loginId}}'s todos</h1>
        <Todos />
        <button @click="signOut">Sign Out</button>
      </template>
    </authenticator>
  </main>
</template>

