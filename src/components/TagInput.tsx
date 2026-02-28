"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then(r => r.ok ? r.json() : [])
      .then((data: string[]) => setAllTags(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const matches = allTags.filter(
      t => t.toLowerCase().includes(trimmed) && !tags.includes(t)
    );
    setSuggestions(matches);
    setShowDropdown(matches.length > 0);
  }, [input, allTags, tags]);

  const addTag = (raw = input) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
    setShowDropdown(false);
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
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="field-input min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-text"
        onClick={() => document.getElementById("tag-input")?.focus()}
      >
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
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={tags.length === 0 ? "Add tags… (press Enter)" : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-stone-400"
        />
      </div>
      {showDropdown && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
