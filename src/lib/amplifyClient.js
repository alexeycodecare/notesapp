import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { createAIHooks } from '@aws-amplify/ui-react-ai';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

export const client = generateClient({
  authMode: 'userPool',
});

export const { useAIGeneration, useAIConversation } = createAIHooks(client);