"use client";

import { MinusIcon, PlusIcon } from "@/icons/icons";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Define the FAQ item type
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FaqAccordion() {
  const t = useTranslations('FAQ');
  const [activeItem, setActiveItem] = useState<number | null>(1);

  // FAQ data (fetched from i18n dictionaries)
  const faqItems: FAQItem[] = [1, 2, 3, 4, 5].map((id) => ({
    id,
    question: t(`q${id}`),
    answer: t(`a${id}`)
  }));

  const toggleItem = (itemId: number) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <section id="faq" className="py-14 md:py-28 dark:bg-[#171f2e]">
      <div className="wrapper">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="mb-3 font-bold text-center text-gray-800 text-3xl dark:text-white/90 md:text-title-lg">
            {t('title')}
          </h2>
          <p className="max-w-md mx-auto leading-6 text-gray-500 dark:text-gray-400">
            {t('subtext')}
          </p>
        </div>
        <div className="max-w-[700px] mx-auto">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <FAQItemComp
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Item Component
function FAQItemComp({
  item,
  isActive,
  onToggle,
}: {
  item: FAQItem;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="pb-5 border-b border-gray-200 dark:border-gray-800">
      <Button
        type="button"
        variant="ghost"
        className="flex h-auto w-full items-center justify-between p-0 text-left hover:bg-transparent"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className="text-lg font-medium text-gray-800 dark:text-white/90">
          {item.question}
        </span>
        <span className="flex-shrink-0 ml-6">
          {isActive ? <MinusIcon /> : <PlusIcon />}
        </span>
      </Button>
      {isActive && (
        <div className="mt-5">
          <p className="text-base leading-7 text-gray-500 dark:text-gray-400">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}
