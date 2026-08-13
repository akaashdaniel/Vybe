function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({ name, color = "#7a0e14", online = false, size = 44 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-body text-sm font-medium text-bone"
        style={{ background: `linear-gradient(155deg, ${color}, #16060a)` }}
      >
        {initials(name)}
      </div>
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-void bg-signal"
          style={{
            width: size * 0.28,
            height: size * 0.28,
            boxShadow: "0 0 6px rgba(232,18,29,0.8)",
          }}
        />
      )}
    </div>
  );
}
