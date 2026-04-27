import { useState } from 'react';
import { Button, Heading, Text, TextAreaField } from '@aws-amplify/ui-react';
import { client } from '../../lib/amplifyClient';
import './style.scss';

const STARTERS = [
  'I have chicken, tomatoes, and rice. What can I cook for dinner?',
  'What can I make with eggs, spinach, and cheese?',
  'I want to use up some ground beef, onions, and pasta. Any recipe ideas?',
];

export default function AppChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function getGenerationErrorMessage(errors) {
    const message = errors?.[0]?.message ?? 'The assistant request failed.';
    const errorType = errors?.[0]?.errorType ?? '';

    if (errorType.includes('ValidationException')) {
      return `${message} Bedrock rejected the model request. Confirm the model is enabled for your AWS account in the app region and redeploy the backend.`;
    }

    return message;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await client.generations.recipeAssistant({
        prompt: trimmedPrompt,
      });

      if (result.errors?.length) {
        setError(getGenerationErrorMessage(result.errors));
        return;
      }

      setResponse(result.data ?? 'No response returned.');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'The assistant request failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-chat">
      <div className="app-chat__intro">
        <p className="app-chat__eyebrow">Amplify AI</p>
        <Heading level={2}>Recipe assistant</Heading>
        <Text>
          This route is backed by Amazon Bedrock through Amplify Gen 2. Send the list of ingredients you have, and the assistant will suggest a recipe you can make with them.
        </Text>
      </div>

      <div className="app-chat__starters" aria-label="Prompt starters">
        {STARTERS.map((starter) => (
          <button
            key={starter}
            className="app-chat__starter"
            type="button"
            onClick={() => setPrompt(starter)}
          >
            {starter}
          </button>
        ))}
      </div>

      <form className="app-chat__form" onSubmit={handleSubmit}>
        <TextAreaField
          label="Prompt"
          labelHidden
          placeholder="Paste rough notes or describe what you want the assistant to do..."
          rows={10}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className="app-chat__actions">
          <Button type="submit" variation="primary" isLoading={isLoading} loadingText="Thinking">
            Ask assistant
          </Button>
        </div>
      </form>

      {error ? <p className="app-chat__error">{error}</p> : null}

      <section className="app-chat__response" aria-live="polite">
        <Heading level={3}>Response</Heading>
        <pre>{response || 'The assistant response will appear here after you send a prompt.'}</pre>
      </section>
    </div>
  );
}