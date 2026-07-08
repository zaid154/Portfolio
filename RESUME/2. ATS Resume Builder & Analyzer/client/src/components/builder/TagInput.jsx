import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({ value = [], onChange, placeholder = "Type and press Enter" }) {
  const [draft, setDraft] = useState("");

  const add = (raw) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setDraft("");
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value.length - 1);
    }
  };

  return (
    <div className="tag-input-wrap">
      {value.map((tag, i) => (
        <span className="tag" key={i}>
          {tag}
          <button type="button" onClick={() => remove(i)} aria-label={`Remove ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={placeholder}
      />
    </div>
  );
}
