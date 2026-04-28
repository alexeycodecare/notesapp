import { useState, useEffect } from 'react';
import { Button, Heading, Loader, Text, TextAreaField, View } from '@aws-amplify/ui-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { client, useAIGeneration } from '../../lib/amplifyClient';
import './style.scss';

const STARTERS = [
  'Create a quick vegetarian dinner using chickpeas, spinach, and coconut milk.',
  'Generate a high-protein breakfast recipe with eggs, black beans, and avocado.',
  'Suggest a cozy pasta recipe using mushrooms, garlic, cream, and parsley.',
];

export default function RecipeGenerator() {
  const [description, setDescription] = useState('');
  const [requestError, setRequestError] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [{ data, isLoading, error }, generateRecipe] = useAIGeneration('generateRecipe');

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  async function fetchSavedRecipes() {
    const { data: notes } = await client.models.Note.list();
    setSavedRecipes(notes ?? []);
  }

  async function handleSaveRecipe() {
    if (!data?.name) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    const ingredientsList = (data.ingredients ?? []).join('\n');
    const description = `**Ingredients:**\n${ingredientsList}\n\n**Instructions:**\n${data.instructions ?? ''}`;

    try {
      const { errors } = await client.models.Note.create({
        name: data.name,
        description,
      });

      if (errors?.length) {
        setSaveError(errors[0].message ?? 'Failed to save recipe.');
        return;
      }

      await fetchSavedRecipes();
    } catch (saveErr) {
      setSaveError(saveErr instanceof Error ? saveErr.message : 'Failed to save recipe.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteRecipe(id) {
    await client.models.Note.delete({ id });
    await fetchSavedRecipes();
  }

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
            <div className="recipe-generator__card-actions">
              {saveError ? <p className="recipe-generator__error">{saveError}</p> : null}
              <Button
                variation="primary"
                size="small"
                isLoading={isSaving}
                loadingText="Saving"
                onClick={handleSaveRecipe}
              >
                Save recipe
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="recipe-generator__saved">
        <Heading level={3}>Saved recipes</Heading>
        {!savedRecipes.length ? (
          <p>Your saved recipes will appear here.</p>
        ) : null}
        <div className="recipe-generator__saved-list">
          {savedRecipes.map((recipe) => (
            <article key={recipe.id} className="recipe-generator__saved-card">
              <div className="recipe-generator__saved-header">
                <Heading level={4}>{recipe.name}</Heading>
                <Button
                  variation="destructive"
                  size="small"
                  onClick={() => handleDeleteRecipe(recipe.id)}
                >
                  Delete
                </Button>
              </div>
              <div className="recipe-generator__saved-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe.description}</ReactMarkdown>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}