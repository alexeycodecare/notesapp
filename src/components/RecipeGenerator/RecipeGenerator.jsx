import { useState } from 'react';
import { Button, Heading, Loader, Text, TextAreaField, View } from '@aws-amplify/ui-react';
import { useAIGeneration } from '../../lib/amplifyClient';
import './style.scss';

const STARTERS = [
  'Create a quick vegetarian dinner using chickpeas, spinach, and coconut milk.',
  'Generate a high-protein breakfast recipe with eggs, black beans, and avocado.',
  'Suggest a cozy pasta recipe using mushrooms, garlic, cream, and parsley.',
];

export default function RecipeGenerator() {
  const [description, setDescription] = useState('');
  const [requestError, setRequestError] = useState('');
  const [{ data, isLoading, error }, generateRecipe] = useAIGeneration('generateRecipe');

  const activeError = requestError || error?.message || '';

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setRequestError('Add a short recipe brief before generating.');
      return;
    }

    setRequestError('');

    try {
      await generateRecipe({ description: trimmedDescription });
    } catch (generationError) {
      setRequestError(generationError instanceof Error ? generationError.message : 'Recipe generation failed.');
    }
  }

  return (
    <section className="recipe-generator">
      <div className="recipe-generator__intro">
        <p className="recipe-generator__eyebrow">Amplify Generation</p>
        <Heading level={2}>Generate a recipe from a short brief</Heading>
        <Text>
          This generation route returns a structured recipe with a title, ingredient list, and cooking instructions in one response.
        </Text>
      </div>

      <div className="recipe-generator__starters" aria-label="Recipe prompts">
        {STARTERS.map((starter) => (
          <button
            key={starter}
            className="recipe-generator__starter"
            type="button"
            onClick={() => setDescription(starter)}
          >
            {starter}
          </button>
        ))}
      </div>

      <form className="recipe-generator__form" onSubmit={handleSubmit}>
        <TextAreaField
          label="Recipe brief"
          labelHidden
          placeholder="Describe the dish, ingredients, dietary needs, or cooking style you want."
          rows={7}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="recipe-generator__actions">
          <Button type="submit" variation="primary" isLoading={isLoading} loadingText="Generating">
            Generate recipe
          </Button>
        </div>
      </form>

      {activeError ? <p className="recipe-generator__error">{activeError}</p> : null}

      <section className="recipe-generator__result" aria-live="polite">
        <Heading level={3}>Generated recipe</Heading>
        {isLoading ? <Loader variation="linear" /> : null}
        {!isLoading && !data?.name ? <p>Your generated recipe will appear here.</p> : null}
        {data?.name ? (
          <div className="recipe-generator__card">
            <Heading level={4}>{data.name}</Heading>
            <View as="ul" className="recipe-generator__ingredients">
              {data.ingredients?.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </View>
            <p className="recipe-generator__instructions">{data.instructions}</p>
          </div>
        ) : null}
      </section>
    </section>
  );
}