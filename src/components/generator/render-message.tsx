'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useStickToBottom } from 'use-stick-to-bottom';
import AiResponse from './text/ai-response';
import UserMessage from './text/user-message';

type PropsType = {
  useChat: UseChatHelpers & {
    addToolResult: ({
      toolCallId,
      result,
    }: {
      toolCallId: string;
      result: unknown;
    }) => void;
  };
  isThinking: boolean;
};

export function RenderMessage({ useChat, isThinking }: PropsType) {
  const { messages, setMessages, reload, error } = useChat;
  const { contentRef, scrollRef } = useStickToBottom();

  useEffect(() => {
    if (error?.message.includes('Incorrect API')) {
      toast.error('Incorrect API key provided', {
        description: 'Please check your API key and try again.',
      });
    }
  }, [error]);

  return (
    <div
      className="flex-[1_1_0] overflow-y-auto custom-scrollbar px-5 pt-12 pb-6 md:px-12"
      ref={scrollRef}
    >
      <div
        className="text-gray-800 dark:text-white/90 space-y-6 max-w-none prose dark:prose-invert"
        ref={contentRef}
      >
        {messages.map((message, messageIdx) => {
          return (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                if (part.type === 'text') {
                  if (message.role === 'user') {
                    return (
                      <UserMessage
                        key={`${message.id}-${i}`}
                        message={part.text}
                        showActions={
                          // showActions is true only for the last user message
                          messages.length - 1 === messageIdx ||
                          // if ai responded it should be second to last
                          messages.length - 2 === messageIdx
                        }
                        onEdit={async (newMessage) => {
                          setMessages((prev) => {
                            return prev.map((prevMsg) => {
                              if (prevMsg.id !== message.id) return prevMsg;

                              return {
                                ...prevMsg,
                                parts: prevMsg.parts?.map((part) => ({
                                  ...part,
                                  text: newMessage,
                                })),
                              };
                            });
                          });

                          reload();
                        }}
                      />
                    );
                  }

                  return (
                    <AiResponse
                      key={`${message.id}-${i}`}
                      response={part.text}
                    />
                  );
                }
              })}
            </div>
          );
        })}

        {isThinking && (
          <div className="text-gray-500 font-medium">
            💭 Model is thinking...
          </div>
        )}
      </div>
    </div>
  );
}
