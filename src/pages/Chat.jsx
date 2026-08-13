import Orb from "../components/Orb";

export default function Chat() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-6 text-center">
      <div>
        <Orb size={72} pulse={false} />
        <p className="mt-6 font-display text-xl text-bone">You're in.</p>
        <p className="mt-2 font-body text-sm text-mauve">
          Conversation list and message thread build out next.
        </p>
      </div>
    </div>
  );
}
