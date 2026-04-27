# Notes AI App

This project now includes an Amplify Gen 2 AI route backed by Amazon Bedrock.

## What was added

- An AI generation route named `recipeAssistant` in `amplify/data/resource.ts`
- A frontend assistant UI for authenticated users
- Shared Amplify client configuration for calling the AI route from React

## Before you run it

1. Make sure your AWS account has access to the Bedrock model used by the schema (`Claude 3.5 Haiku`).
2. Start or refresh the Amplify sandbox so backend changes are deployed and `amplify_outputs.json` stays current:

```bash
npx ampx sandbox
```

3. In another terminal, start the Vite app:

```bash
npm run dev
```

