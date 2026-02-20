"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Search } from "lucide-react";

type SmartSearchBarProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onVoiceSearch?: () => void;
  className?: string;
};

export default function SmartSearchBar({
  value,
  defaultValue = "",
  placeholder = "Search dukaane, services, vyavsay",
  onChange,
  onSubmit,
  onVoiceSearch,
  className,
}: SmartSearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = typeof value === "string";
  const query = isControlled ? value : internalValue;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(query.trim());
  }

  function handleInputChange(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  return (
    <div
      className={`sticky top-0 z-30 bg-gradient-to-b from-white via-white/95 to-transparent px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:top-16 md:px-6 md:pt-4 lg:px-8 ${className ?? ""}`}
    >
      <form
        role="search"
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-5xl items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pl-4 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.3)] transition-colors focus-within:border-blue-400 focus-within:bg-white"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={placeholder}
          aria-label="Search businesses"
          className="h-10 w-full bg-transparent text-[15px] leading-6 tracking-[0.012em] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <motion.button
          type="button"
          onClick={onVoiceSearch}
          whileTap={{ scale: 0.94 }}
          aria-label="Start voice search"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-500"
        >
          <Mic className="h-4 w-4" aria-hidden />
        </motion.button>
      </form>
    </div>
  );
}
