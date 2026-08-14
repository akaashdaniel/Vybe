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
  {/* Blob 1 */}
  <motion.div
    className="absolute rounded-full"
    style={{
      width: "70%",
      height: "70%",
      background: "radial-gradient(circle, #ff5a5a 0%, var(--color-signal) 60%, transparent 75%)",
      filter: "blur(6px)",
    }}
    animate={{
      x: ["-10%", "40%", "5%", "-10%"],
      y: ["-15%", "10%", "35%", "-15%"],
      scale: [1, 1.3, 0.9, 1],
    }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
  />

  {/* Blob 2 */}
  <motion.div
    className="absolute rounded-full mix-blend-screen"
    style={{
      width: "60%",
      height: "60%",
      background: "radial-gradient(circle, #ffb199 0%, var(--color-signal-bright) 55%, transparent 75%)",
      filter: "blur(6px)",
      opacity: 0.8,
    }}
    animate={{
      x: ["50%", "10%", "45%", "50%"],
      y: ["40%", "5%", "-10%", "40%"],
      scale: [0.9, 1.2, 1, 0.9],
    }}
    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
  />

  {/* Blob 3 — deep red, slower, adds depth */}
  <motion.div
    className="absolute rounded-full"
    style={{
      width: "80%",
      height: "80%",
      background: "radial-gradient(circle, var(--color-ember) 0%, transparent 70%)",
      filter: "blur(8px)",
      opacity: 0.6,
    }}
    animate={{
      x: ["20%", "-5%", "25%", "20%"],
      y: ["10%", "40%", "0%", "10%"],
    }}
    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
  />

  {/* Static highlight, keeps it reading as a sphere */}
  <div
    className="absolute inset-0 rounded-full"
    style={{
      background: "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.35) 0%, transparent 40%)",
    }}
  />
</div>