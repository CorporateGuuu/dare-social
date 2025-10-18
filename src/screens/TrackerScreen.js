// pages/Tracker.jsx
import DareCard from "../components/DareCard";

export default function Tracker({ dares }) {
  const pending = dares.filter((d) => d.status === "pending");
  const active = dares.filter((d) => d.status === "active");
  const completed = dares.filter((d) => d.status === "completed");

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-5">
      <h1 className="text-xl font-bold mb-4">1v1 Dare Tracker</h1>

      <h2 className="text-lg text-gray-300 mb-2">Pending Dares</h2>
      {pending.map((dare) => (
        <DareCard key={dare.dare_id} dare={dare} />
      ))}

      <h2 className="text-lg text-gray-300 mt-6 mb-2">Active Dares</h2>
      {active.map((dare) => (
        <DareCard key={dare.dare_id} dare={dare} />
      ))}

      <h2 className="text-lg text-gray-300 mt-6 mb-2">Completed Dares</h2>
      {completed.map((dare) => (
        <DareCard key={dare.dare_id} dare={dare} />
      ))}
    </div>
  );
}
