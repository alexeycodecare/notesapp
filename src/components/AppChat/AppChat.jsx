import { useEffect, useRef, useState } from 'react';
import { Button, Heading, Text, TextAreaField } from '@aws-amplify/ui-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationReady, setIsConversationReady] = useState(false);

  const conversationRef = useRef(null);
  const activeAssistantMessageIdRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const finalizationTimeoutRef = useRef(null);

  function scheduleFinalization() {
    if (finalizationTimeoutRef.current) {
      clearTimeout(finalizationTimeoutRef.current);
    }

    finalizationTimeoutRef.current = setTimeout(() => {
      console.log('Stream finalization timeout triggered');
      finalizeAssistantMessage();
    }, 1500);
  }

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

    const activeAssistantMessageId = activeAssistantMessageIdRef.current;
    if (!activeAssistantMessageId) {
      return;
    }

    setMessages((previousMessages) =>
      previousMessages.map((message) =>
        message.id === activeAssistantMessageId
          ? { ...message, text: `${message.text}${chunk}` }
          : message,
      ),
    );

    scheduleFinalization();
  }

  function finalizeAssistantMessage() {
    const activeAssistantMessageId = activeAssistantMessageIdRef.current;
    if (!activeAssistantMessageId) {
      return;
    }

    setMessages((previousMessages) =>
      previousMessages.filter(
        (message) =>
          message.id !== activeAssistantMessageId || message.text.trim().length > 0,
      ),
    );

    activeAssistantMessageIdRef.current = null;
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
    activeAssistantMessageIdRef.current = null;
    setMessages([]);
    await startConversation();
  }

  useEffect(() => {
    void startConversation();
  }, []);

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

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

    const messageTimestamp = Date.now();
    const userMessageId = `${messageTimestamp}-user`;
    const assistantMessageId = `${messageTimestamp}-assistant`;

    activeAssistantMessageIdRef.current = assistantMessageId;
    setMessages((previousMessages) => [
      ...previousMessages,
      { role: 'user', text: trimmedPrompt, id: userMessageId },
      { role: 'assistant', text: '', id: assistantMessageId },
    ]);
    setPrompt('');
    setIsLoading(true);
    setError('');

    try {
      const result = await conversationRef.current.sendMessage({
        content: [{ text: trimmedPrompt }],
      });

      if (result?.errors?.length) {
        const errorMsg = getApiErrorMessage(result.errors);
        setError(errorMsg);
        finalizeAssistantMessage();
        return;
      }

      scheduleFinalization();
    } catch (submissionError) {
      const errorMsg = getUnknownErrorMessage(submissionError);
      setError(errorMsg);
      finalizeAssistantMessage();
    } finally {
      setIsLoading(false);
    }
  }

  function renderMessageBody(message) {
    if (message.role === 'assistant') {
      if (!message.text.trim()) {
        return <p>Typing...</p>;
      }

      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
      );
    }

    return <p>{message.text}</p>;
  }

  return (
    <section className="app-chat">
      <div className="app-chat__intro">
        <p className="app-chat__eyebrow">Amplify AI</p>
        <Heading level={2}>Recipe assistant</Heading>
        <Text>
          This conversation route stores per-user chat history in DynamoDB. Each turn keeps the context from earlier messages in the current chat.
        </Text>
      </div>

      <section className="app-chat__response" aria-live="polite">
        <Heading level={3}>Conversation</Heading>
        {!isConversationReady ? <p>Connecting to your conversation...</p> : null}
        {!messages.length ? (
          <p>Your messages and assistant replies will appear here.</p>
        ) : null}
        <div className="app-chat__messages" ref={messagesContainerRef}>
          {messages.map((message) => (
            <article key={message.id} className={`app-chat__message app-chat__message--${message.role}`}>
              <p className="app-chat__role">{message.role === 'user' ? 'You' : 'Assistant'}</p>
              <div className="app-chat__body">{renderMessageBody(message)}</div>
            </article>
          ))}
        </div>
      </section>

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

      {error ? <p className="app-chat__error">{error}</p> : null}

      <form className="app-chat__form" onSubmit={handleSubmit}>
        <TextAreaField
          label="Prompt"
          labelHidden
          placeholder="Paste rough notes or describe what you want the assistant to do..."
          rows={3}
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
    </section>
  );
}