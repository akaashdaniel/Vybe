import { motion } from "framer-motion";

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
      <motion.div
        className="relative rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 35% 30%, #ff5a5a 0%, var(--color-signal) 45%, var(--color-ember) 100%)",
          boxShadow:
            "0 0 40px rgba(232,18,29,0.55), inset 0 -10px 24px rgba(0,0,0,0.45), inset 0 8px 16px rgba(255,255,255,0.18)",
        }}
        animate={pulse ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
