import { defineFunction, secret } from '@aws-amplify/backend';

export const generateImage = defineFunction({
  name: 'generateImage',
  entry: './handler.ts',
  environment: {
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
  timeoutSeconds: 120,
});