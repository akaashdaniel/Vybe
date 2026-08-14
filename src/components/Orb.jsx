export default function Orb({ size = 160, pulse = true, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--color-signal-bright) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Sphere shell — clips the plasma layers to a circle */}
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background: "var(--color-ember)",
          boxShadow:
            "0 0 40px rgba(232,18,29,0.55), inset 0 -10px 24px rgba(0,0,0,0.45), inset 0 8px 16px rgba(255,255,255,0.18)",
        }}
      >
        {/* Plasma layer 1 — slow swirl */}
        <motion.div
          className="absolute"
          style={{
            width: "160%",
            height: "160%",
            top: "-30%",
            left: "-30%",
            background:
              "radial-gradient(circle at 30% 30%, #ff5a5a 0%, var(--color-signal) 35%, transparent 60%)",
          }}
          animate={pulse ? { rotate: 360 } : {}}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />

        {/* Plasma layer 2 — faster, opposite direction, offset center */}
        <motion.div
          className="absolute opacity-70 mix-blend-screen"
          style={{
            width: "160%",
            height: "160%",
            top: "-30%",
            left: "-30%",
            background:
              "radial-gradient(circle at 65% 60%, #ffb199 0%, var(--color-signal-bright) 30%, transparent 55%)",
          }}
          animate={pulse ? { rotate: -360 } : {}}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Static highlight, keeps it reading as a sphere not a screen */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.35) 0%, transparent 40%)",
          }}
        />
      </div>
    </div>
  );
}