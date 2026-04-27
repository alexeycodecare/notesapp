import { useEffect, useRef, useState } from 'react';
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
  const [messages, setMessages] = useState([]);
  const [assistantDraft, setAssistantDraft] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationReady, setIsConversationReady] = useState(false);

  const conversationRef = useRef(null);
  const assistantBufferRef = useRef('');

  function getApiErrorMessage(errors) {
    const message = errors?.[0]?.message ?? 'The assistant request failed.';
    const errorType = errors?.[0]?.errorType ?? '';

    if (errorType.includes('ValidationException')) {
      return `${message} Bedrock rejected the model request. Confirm the model is enabled for your AWS account in the app region and redeploy the backend.`;
    }

    return message;
  }

  function getUnknownErrorMessage(unknownError) {
    if (unknownError instanceof Error) {
      return unknownError.message;
    }

    const nestedErrors = unknownError?.errors;
    if (Array.isArray(nestedErrors) && nestedErrors.length) {
      return getApiErrorMessage(nestedErrors);
    }

    return 'The assistant request failed.';
  }

  function appendAssistantStreamChunk(event) {
    const chunk =
      event?.contentBlockDelta?.delta?.text ??
      event?.delta?.text ??
      event?.text ??
      '';

    if (!chunk) {
      return;
    }

    assistantBufferRef.current += chunk;
    setAssistantDraft(assistantBufferRef.current);
  }

  async function startConversation() {
    setError('');
    setIsConversationReady(false);

    const result = await client.conversations.recipeAssistant.create();
    if (result.errors?.length) {
      setError(getApiErrorMessage(result.errors));
      return false;
    }

    conversationRef.current = result.data;
    conversationRef.current.onStreamEvent({
      next: appendAssistantStreamChunk,
      error: (streamError) => {
        setError(getUnknownErrorMessage(streamError));
      },
    });

    setIsConversationReady(true);
    return true;
  }

  async function handleNewConversation() {
    assistantBufferRef.current = '';
    setAssistantDraft('');
    setMessages([]);
    await startConversation();
  }

  useEffect(() => {
    void startConversation();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    if (!conversationRef.current) {
      const ready = await startConversation();
      if (!ready) {
        return;
      }
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      { role: 'user', text: trimmedPrompt, id: `${Date.now()}-user` },
    ]);
    setPrompt('');
    setIsLoading(true);
    setError('');
    assistantBufferRef.current = '';
    setAssistantDraft('');

    try {
      const result = await conversationRef.current.sendMessage({
        content: [{ text: trimmedPrompt }],
      });

      if (result?.errors?.length) {
        setError(getApiErrorMessage(result.errors));
        return;
      }

      if (assistantBufferRef.current.trim()) {
        setMessages((previousMessages) => [
          ...previousMessages,
          { role: 'assistant', text: assistantBufferRef.current, id: `${Date.now()}-assistant` },
        ]);
      }
    } catch (submissionError) {
      setError(getUnknownErrorMessage(submissionError));
    } finally {
      setIsLoading(false);
      assistantBufferRef.current = '';
      setAssistantDraft('');
    }
  }

  return (
    <div className="app-chat">
      <div className="app-chat__intro">
        <p className="app-chat__eyebrow">Amplify AI</p>
        <Heading level={2}>Recipe assistant</Heading>
        <Text>
          This conversation route stores per-user chat history in DynamoDB. Each turn keeps the context from earlier messages in the current chat.
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
          <Button type="button" variation="link" onClick={handleNewConversation}>
            Start new chat
          </Button>
          <Button type="submit" variation="primary" isLoading={isLoading} loadingText="Thinking">
            Ask assistant
          </Button>
        </div>
      </form>

      {error ? <p className="app-chat__error">{error}</p> : null}

      <section className="app-chat__response" aria-live="polite">
        <Heading level={3}>Conversation</Heading>
        {!isConversationReady ? <p>Connecting to your conversation...</p> : null}
        {!messages.length && !assistantDraft ? (
          <p>Your messages and assistant replies will appear here.</p>
        ) : null}
        <div className="app-chat__messages">
          {messages.map((message) => (
            <article key={message.id} className={`app-chat__message app-chat__message--${message.role}`}>
              <p className="app-chat__role">{message.role === 'user' ? 'You' : 'Assistant'}</p>
              <p>{message.text}</p>
            </article>
          ))}
          {assistantDraft ? (
            <article className="app-chat__message app-chat__message--assistant">
              <p className="app-chat__role">Assistant</p>
              <p>{assistantDraft}</p>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}