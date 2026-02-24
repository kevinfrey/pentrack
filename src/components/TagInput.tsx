"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="field-input min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-text" onClick={() => document.getElementById("tag-input")?.focus()}>
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-slate-800 text-white text-xs font-medium px-2 py-0.5 rounded-lg">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="text-slate-300 hover:text-white leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        id="tag-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? "Add tags… (press Enter)" : ""}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-stone-400"
      />
    </div>
  );
}
