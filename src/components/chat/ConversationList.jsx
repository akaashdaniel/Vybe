import { useState } from "react";
import Avatar from "../Avatar";

export default function ConversationList({ conversations, activeId, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-full w-full flex-col border-r border-hairline bg-void md:w-[360px]">
      <div className="flex items-center justify-between px-5 pb-3 pt-6">
        <span className="font-display text-lg tracking-wide text-bone">signal</span>
      </div>

      <div className="px-4 pb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          className="w-full rounded-full border border-hairline bg-ember-deep px-4 py-2.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
        />
      </div>

      <ul className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 && (
          <li className="px-4 py-8 text-center font-body text-sm text-mauve">
            No conversations match "{query}"
          </li>
        )}
        {filtered.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active ? "bg-ember-deep" : "hover:bg-ember-deep/60"
                }`}
              >
                <Avatar name={c.name} color={c.avatarColor} online={c.online} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-body text-sm font-medium text-bone">
                      {c.name}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-mauve">
                      {c.lastTime}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate font-body text-xs text-mauve">
                      {c.lastMessage}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-signal px-1.5 font-mono text-[11px] font-medium text-bone">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
