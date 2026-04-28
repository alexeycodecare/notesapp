# Notes AI App

This project now includes an Amplify Gen 2 AI conversation route backed by Amazon Bedrock.

## What was added

- An AI conversation route named `recipeAssistant` in `amplify/data/resource.ts`
- A frontend chat UI for authenticated users
- Shared Amplify client configuration for calling the AI route from React

## Before you run it

1. Make sure your AWS account has access to the Bedrock model used by the schema (`Amazon Nova Micro`).
2. Start or refresh the Amplify sandbox so backend changes are deployed and `amplify_outputs.json` stays current:

```bash
npx ampx sandbox
```

3. In another terminal, start the Vite app:

```bash
npm run dev
```

## How conversation mode works

After sign-in, the app creates a conversation using `client.conversations.recipeAssistant.create()` and then sends user turns with `sendMessage()`.

Assistant responses stream back via `onStreamEvent()`. Conversation and message history are persisted by Amplify AI Kit in DynamoDB per signed-in user.

