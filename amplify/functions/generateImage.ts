import { defineFunction } from '@aws-amplify/backend';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export const generateImage = defineFunction({
  name: 'generateImage',

  entry: './handler.ts', // 👈 ВАЖНО
});