'use client';

import { CopyToClipboard } from '@/components/copy-to-clipboard';

type PropsType = {
  response: string;
};

export default function AiResponse({ response }: PropsType) {
  return (
    <div className="max-w-3xl whitespace-pre-wrap">
      <div className="bg-white dark:bg-white/5 shadow-theme-xs rounded-3xl rounded-bl-lg py-4 px-5 max-w-3xl leading-7">
        {response}
      </div>

      <div className="mt-3 text-gray-500 dark:text-gray-400">
        <CopyToClipboard text={response} />
      </div>
    </div>
  );
}
