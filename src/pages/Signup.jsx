import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Orb from "../components/ParticleOrb";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !identifier.trim() || !password.trim()) {
      setError("Fill in your name, phone or email, and password to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }

    setLoading(true);
    // TODO: wire to real registration endpoint. Placeholder timing so the
    // loading state is visible during frontend-only development.
    setTimeout(() => {
      setLoading(false);
      navigate("/chat");
    }, 900);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-void flex flex-col">
      {/* Ambient ember glow rising from the base, echoes the orb's light */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 100%, rgba(232,18,29,0.35) 0%, rgba(122,14,20,0.18) 45%, transparent 75%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6">
        <span className="font-display text-lg tracking-wide text-bone">
          signal
        </span>
        <button
          onClick={() => navigate("/")}
          className="font-mono text-xs text-mauve transition hover:text-bone"
        >
          back to sign in
        </button>
      </header>

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <motion.div variants={rise}>
          <Orb size={128} />
        </motion.div>

        <motion.p variants={rise} className="mt-6 font-body text-sm text-mauve">
          Get started
        </motion.p>
        <motion.h1
          variants={rise}
          className="mt-1 font-display text-3xl font-medium text-bone sm:text-4xl"
        >
          Create your account
          <br />
          in a minute
        </motion.h1>

        <motion.form
          variants={rise}
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-sm space-y-3 text-left"
          noValidate
        >
          <div>
            <label htmlFor="name" className="sr-only">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="identifier" className="sr-only">
              Phone or email
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="Phone number or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-hairline bg-ember-deep px-5 py-3.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
            />
          </div>

          {error && (
            <p role="alert" className="px-2 font-mono text-xs text-signal-bright">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-signal py-3.5 font-body text-sm font-semibold text-bone shadow-[0_0_24px_rgba(232,18,29,0.45)] transition hover:bg-signal-bright disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </motion.form>

        <motion.p variants={rise} className="mt-8 font-body text-sm text-mauve">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-bone underline underline-offset-4 hover:text-signal-bright"
          >
            Sign in
          </button>
        </motion.p>
      </motion.main>
    </div>
  );
}
