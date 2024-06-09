import { defineFunction } from '@aws-amplify/backend';

export const sayHello = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'say-hello',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  environment: {
    NAME: "World",
    SOME_VAR: "nice"
  },
  timeoutSeconds: 60, // 1 minute timeout
  memoryMB: 256 // allocate 256 MB of memory to the function.
});