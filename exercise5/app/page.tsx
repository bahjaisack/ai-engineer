'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [conversationReady, setConversationReady] = useState(false);

  useEffect(() => {
    let savedId = localStorage.getItem('conversationId');

    if (!savedId) {
      savedId = crypto.randomUUID();
      localStorage.setItem('conversationId', savedId);
    }

    setConversationId(savedId);
    setConversationReady(true);
  }, []);

  const { messages, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const lastUserMessageIndex = messages
    .map((message) => message.role)
    .lastIndexOf('user');

  const latestMessages = messages.slice(lastUserMessageIndex + 1);

  useEffect(() => {
    if (!conversationReady || !conversationId) return;

    const loadConversation = async () => {
      try {
        const response = await fetch(
          `/api/conversation?conversationId=${conversationId}`
        );

        const data = await response.json();

        if (data.success && data.messages) {
          setMessages(
            data.messages.map((message: any) => ({
              id: message._id,
              role: message.role,
              parts: [
                {
                  type: 'text',
                  text: message.content,
                },
              ],
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };

    loadConversation();
  }, [conversationId, conversationReady]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="text-center py-6 border-b">
        <h1 className="text-3xl font-bold mb-2">
          AI SDK v5 Chat
        </h1>
        <p className="text-gray-600">
          Streaming chat example
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            console.log(
              "Duplicate message IDs:",
              messages
                .map((message) => message.id)
                .filter((id, index, ids) => ids.indexOf(id) !== index)
            );
            console.log(
              'MESSAGE PARTS:',
              message.parts.map((part) => ({
                type: part.type,
                output: (part as any).output,
                text: (part as any).text,
              }))
            ); console.log(
              'MESSAGE PARTS:',
              message.parts.map((part) => ({
                type: part.type,
                output: (part as any).output,
                text: (part as any).text,
              }))
            );
            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${message.role === 'user'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div key={i} className="whitespace-pre-wrap break-words">
                            {part.text}
                          </div>
                        );
                      case 'tool-weather': {
                        const output = (part as any).output;

                        if (
                          message.parts.some((p) =>
                            p.type.startsWith('tool-')
                          ) ||
                          messages.some((m) =>
                            m.parts.some(
                              (p) => p.type === 'tool-database'
                            )
                          )
                        ) {
                          return null;
                        }

                        return (
                          <div key={i}>
                            Temperature in {output.location} is{' '}
                            {output.temperature}°C
                          </div>
                        );
                      }


                      case 'tool-database': {
                        const output = (part as any).output;
                        const results = output?.results ?? [];

                        const isUsers =
                          output?.operation === 'findUsers' ||
                          results.some(
                            (item: any) =>
                              item.name !== undefined || item.age !== undefined
                          );

                        return (
                          <div key={i}>
                            {!results.length ? (
                              <div>
                                {output?.message || 'No results found.'}
                              </div>
                            ) : (
                              <>
                                <div className="font-bold mb-2">
                                  {isUsers ? '👤 Users' : '🎬 Movies'}
                                </div>

                                {results.map((item: any, index: number) => (
                                  <div
                                    key={item._id?.toString?.() ?? item.id ?? index}
                                    className="mb-4"
                                  >
                                    {isUsers ? (
                                      <>
                                        <div className="font-semibold">
                                          {item.name ?? item.username ?? 'User'}
                                        </div>
                                        {item.age !== undefined && (
                                          <div>Age: {item.age}</div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-semibold">
                                          {item.title ?? 'Untitled'}{' '}
                                          {item.year ? `(${item.year})` : ''}
                                        </div>
                                        {item.rating !== undefined && (
                                          <div>⭐ {item.rating}/10</div>
                                        )}
                                        {item.director && (
                                          <div>🎥 {item.director}</div>
                                        )}
                                        <div>
                                          {item.description || item.plot || ''}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        );
                      }
                      case 'tool-omdb': {
                        const output = (part as any).output;
                        const movie = output?.movie ?? output?.result ?? output;

                        if (!movie || output?.success === false) {
                          return (
                            <div key={i}>
                              {output?.message ?? 'Could not load movie details.'}
                            </div>
                          );
                        }

                        return (
                          <div key={i} className="w-full space-y-2">
                            {movie.Poster && movie.Poster !== 'N/A' && (
                              <img
                                src={movie.Poster}
                                alt={`${movie.Title ?? 'Movie'} poster`}
                                className="w-40 rounded-lg"
                              />
                            )}

                            <h2 className="text-lg font-bold">
                              {movie.Title}
                              {movie.Year ? ` (${movie.Year})` : ''}
                            </h2>

                            {movie.Genre && <p><strong>Genre:</strong> {movie.Genre}</p>}
                            {movie.Director && <p><strong>Director:</strong> {movie.Director}</p>}
                            {movie.Actors && <p><strong>Stars:</strong> {movie.Actors}</p>}
                            {movie.Plot && <p>{movie.Plot}</p>}
                            {movie.Runtime && <p><strong>Runtime:</strong> {movie.Runtime}</p>}
                            {movie.imdbRating && (
                              <p><strong>IMDb:</strong> {movie.imdbRating}/10</p>
                            )}
                          </div>
                        );
                      }


                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Input at Bottom */}
      <div className="border-t bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!conversationReady) {
              return;
            }

            if (!input.trim()) {
              return;
            }

            sendMessage({
              text: input,
              metadata: {
                conversationId: conversationId,
              },
            });

            setInput('');
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex space-x-2">
            <input
              className="flex-1 p-3 border rounded-lg"
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              type="submit"
              className="px-4 py-3 bg-rose-500 text-white hover:bg-rose-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}