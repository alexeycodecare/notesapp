import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Note: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      image: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  recipeAssistant: a
    .conversation({
      aiModel: a.ai.model('Claude 3 Haiku'),
      systemPrompt:
        'You are a concise recipe assistant. Help users find recipes based on the ingredients they have. Keep answers practical and easy to follow.',
    })
    .authorization((allow) => allow.owner()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
