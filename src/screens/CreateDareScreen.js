// pages/CreateDare.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import dayjs from "dayjs";

export default function CreateDare({ opponents, userData }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [entryStake, setEntryStake] = useState(25);
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // Automatically calculate deadline (7 days from now)
  useEffect(() => {
    const date = dayjs().add(7, "day").toISOString();
    setDeadline(date);
  }, []);

  const handleCreateGroupDare = async () => {
    if (!title || !entryStake) {
      alert("Please fill all required fields");
      return;
    }

    if (!auth.currentUser) {
      alert("Please log in to create a dare");
      return;
    }

    setLoading(true);
    try {
      // Create initial participants array with just the creator
      const creatorParticipant = {
        user_id: auth.currentUser.uid,
        username: userData?.username || "anonymous",
        avatar: userData?.avatar || "https://cdn.example.com/avatar.jpg",
        proof_url: "",
        votes: 0,
        completed: false
      };

      const dareData = {
        dare_id: `group_dare_${Date.now()}`,
        title,
        description: description || "",
        creator_id: auth.currentUser.uid,
        entry_stake: entryStake,
        status: "open",
        created_at: serverTimestamp(),
        deadline: deadline, // String format for simplicity
        winner_id: "",
        participants: [creatorParticipant],
        min_participants: minParticipants,
        max_participants: maxParticipants,
        // Legacy fields for compatibility
        minp: minParticipants,
        maxp: maxParticipants,
        stake: entryStake
      };

      await addDoc(collection(db, "dares"), dareData);
      alert("Group dare created successfully!");
      setTitle("");
      setEntryStake(25);
      setMinParticipants(2);
      setMaxParticipants(10);
      setDescription("");
      setPreview(false);
    } catch (error) {
      console.error("Error creating group dare:", error);
      alert("Failed to create dare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-6">
      <h1 className="text-xl font-bold mb-5 text-center">Create Group Dare</h1>

      {/* Dare Title */}
      <label className="block text-sm text-gray-400 mb-1">Dare Title *</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Who can run 5K every day for a week?"
        className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-blue-500 outline-none"
      />

      {/* Description */}
      <label className="block text-sm text-gray-400 mb-1">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the dare challenge..."
        rows={3}
        className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-blue-500 outline-none resize-none"
      />

      {/* Entry Stake */}
      <label className="block text-sm text-gray-400 mb-1">Entry Stake *</label>
      <input
        type="number"
        value={entryStake}
        onChange={(e) => setEntryStake(Number(e.target.value))}
        min={5}
        step={5}
        className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white mb-4"
      />

      {/* Participant Limits */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Min Participants</label>
          <input
            type="number"
            value={minParticipants}
            onChange={(e) => setMinParticipants(Math.max(2, Number(e.target.value)))}
            min={2}
            max={maxParticipants}
            className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Max Participants</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Math.min(50, Number(e.target.value)))}
            min={minParticipants}
            max={50}
            className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white"
          />
        </div>
      </div>

      {/* Deadline */}
      <label className="block text-sm text-gray-400 mb-1">Deadline</label>
      <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 mb-4 text-center text-gray-300">
        <div className="text-blue-400 font-medium">
          {dayjs(deadline).format("dddd, MMM D, YYYY h:mm A")}
        </div>
        <button
          type="button"
          onClick={() => {
            const newDate = dayjs().add(3, "day").toISOString();
            setDeadline(newDate);
          }}
          className="text-xs text-gray-400 mt-1 hover:text-gray-300"
        >
          Use 3 days from now
        </button>
        <button
          type="button"
          onClick={() => {
            const newDate = dayjs().add(7, "day").toISOString();
            setDeadline(newDate);
          }}
          className="text-xs text-gray-400 ml-4 hover:text-gray-300"
        >
          Use 7 days from now
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <button
          onClick={() => setPreview(!preview)}
          className="w-full py-3 bg-[#2A2A2A] hover:bg-[#333] rounded-lg font-medium text-gray-300 transition"
        >
          {preview ? "Hide Preview" : "Preview Dare"}
        </button>

        <button
          onClick={handleCreateGroupDare}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition"
        >
          {loading ? "Creating..." : "Create Group Dare"}
        </button>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="mt-8 border-t border-gray-800 pt-4">
          <h2 className="text-gray-400 text-sm mb-2">Preview</h2>
          <div className="bg-gradient-to-b from-[#1B1B1B] to-[#0E0E0E] border border-gray-700 rounded-2xl p-4 shadow-md">
            <h3 className="text-white font-semibold text-center mb-3">{title || "Your Dare Title"}</h3>
            <div className="text-center text-blue-400 text-sm mb-2">Status: OPEN</div>
            <div className="text-center text-gray-400 text-sm mb-3">
              Deadline: {dayjs(deadline).format("MMM D, h:mm A")}
            </div>
            <div className="text-center text-yellow-400 text-sm mb-3">
              Entry Stake: 💰 {entryStake}
            </div>
            <div className="text-center text-gray-400 text-sm mb-2">
              Participants: 1/{maxParticipants} (Min: {minParticipants})
            </div>
            {description && (
              <div className="text-center text-gray-400 text-sm mt-2">
                {`"${description}"`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
