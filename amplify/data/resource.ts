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
      aiModel: a.ai.model('Amazon Nova Micro'),
      systemPrompt:
        'You are a concise recipe assistant. Help users find recipes based on the ingredients they have. Keep answers practical and easy to follow.',
    })
    .authorization((allow) => allow.owner()),

  generateRecipe: a
    .generation({
      aiModel: a.ai.model('Amazon Nova Micro'),
      systemPrompt:
        'You are a practical recipe generator. Return a recipe name, a short ingredient list, and clear step-by-step cooking instructions based on the user description.',
    })
    .arguments({
      description: a.string().required(),
    })
    .returns(
      a.customType({
        name: a.string(),
        ingredients: a.string().array(),
        instructions: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
