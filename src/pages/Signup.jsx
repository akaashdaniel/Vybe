import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Orb from "../components/Orb";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire to real registration endpoint.
    navigate("/chat");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void flex flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 100%, rgba(232,18,29,0.35) 0%, rgba(122,14,20,0.18) 45%, transparent 75%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 pt-6">
        <span className="font-display text-lg tracking-wide text-bone">signal</span>
        <button
          onClick={() => navigate("/")}
          className="font-mono text-xs text-mauve hover:text-bone"
        >
          back to sign in
        </button>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <Orb size={100} />

        <h1 className="mt-6 font-display text-3xl font-medium text-bone">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm space-y-3 text-left">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
          />
          <input
            type="text"
            placeholder="Phone number or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-signal py-3.5 font-body text-sm font-semibold text-bone shadow-[0_0_24px_rgba(232,18,29,0.45)] transition hover:bg-signal-bright"
          >
            Create account
          </button>
        </form>
      </motion.main>
    </div>
  );
}
