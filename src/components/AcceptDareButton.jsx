// components/AcceptDareButton.jsx
import { useState } from "react";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import dayjs from "dayjs";

export default function AcceptDareButton({ dare, userData }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;

  // For 1v1 dares (legacy)
  const handleAcceptOneOnOne = async () => {
    setLoading(true);
    try {
      const dareRef = doc(db, "dares", dare.dare_id || dare.id);
      await updateDoc(dareRef, {
        status: "active",
        accepted_at: serverTimestamp(),
      });
      setShowModal(false);
      alert("✅ Dare accepted! It is now active.");
      window.location.reload(); // Refresh to update UI
    } catch (error) {
      console.error("Error accepting dare:", error);
      alert("Failed to accept dare.");
    } finally {
      setLoading(false);
    }
  };

  // For group dares
  const handleJoinGroup = async () => {
    if (!currentUser || !userData) {
      alert("Please log in to join dares.");
      return;
    }

    setLoading(true);
    try {
      const newParticipant = {
        user_id: currentUser.uid,
        username: userData.username,
        avatar: userData.avatar || "https://cdn.example.com/avatar.jpg",
        proof_url: "",
        votes: 0,
        completed: false
      };

      const dareRef = doc(db, "dares", dare.dare_id);
      await updateDoc(dareRef, {
        participants: arrayUnion(newParticipant),
        updated_at: serverTimestamp(),
      });

      // If this is the first participant besides creator, activate the dare
      const updatedParticipants = [...(dare.participants || []), newParticipant];
      if (updatedParticipants.length > 1 && dare.status === "open") {
        await updateDoc(dareRef, {
          status: "active"
        });
      }

      setShowModal(false);
      alert("✅ Successfully joined the dare!");
      window.location.reload(); // Refresh to update UI
    } catch (error) {
      console.error("Error joining dare:", error);
      alert("Failed to join dare.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const dareRef = doc(db, "dares", dare.dare_id || dare.id);
      await updateDoc(dareRef, {
        status: "declined",
        declined_at: serverTimestamp(),
      });
      setShowModal(false);
      alert("❌ Dare declined.");
      window.location.reload();
    } catch (error) {
      console.error("Error declining dare:", error);
      alert("Failed to decline dare.");
    } finally {
      setLoading(false);
    }
  };

  // Determine if this is a group dare or 1v1
  const isGroupDare = dare.participants && Array.isArray(dare.participants);

  // For old 1v1 dares, legacy status is "pending" instead of "open"
  const canAccept = (dare.status === "open") || (dare.status === "pending");
  const isAlreadyParticipant = isGroupDare && dare.participants?.some(p => p.user_id === currentUser?.uid);
  const isCreator = dare.creator_id === currentUser?.uid || dare.challenger_id === currentUser?.uid;

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={!canAccept || isAlreadyParticipant || isGroupDare === false}
        className={`mt-3 w-full py-3 rounded-lg font-semibold transition ${
          canAccept && !isAlreadyParticipant && (!isGroupDare || dare.status === "open")
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!canAccept
          ? "Not Available"
          : isAlreadyParticipant
          ? "Already Joined"
          : isCreator
          ? "You Created This"
          : isGroupDare
          ? "Join Dare"
          : "Accept Dare"
        }
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-2xl w-80 p-6 shadow-lg">
            <h2 className="text-white text-lg font-semibold mb-3 text-center">
              {isGroupDare ? "Join Dare Challenge" : "Accept Dare Challenge"}
            </h2>
            <p className="text-gray-400 text-sm mb-4 text-center">
              {isGroupDare ? "Join the challenge:" : "You've been challenged to:"}
              <br />
              <span className="text-white font-medium">{dare.title}</span>
            </p>

            {isGroupDare ? (
              <div className="text-center mb-4">
                <div className="text-yellow-400 text-sm mb-2">
                  Entry Stake: 💰 {dare.entry_stake || dare.stake || 0}
                </div>
                {dare.deadline && (
                  <div className="text-gray-400 text-xs">
                    Deadline: {dayjs(dare.deadline).format("MMM D, h:mm A")}
                  </div>
                )}
              </div>
            ) : (
              dare.accept_by && (
                <p className="text-red-400 text-xs text-center mb-5">
                  Must accept by {dayjs(dare.accept_by.toDate ? dare.accept_by.toDate() : dare.accept_by).format("MMM D, h:mm A")}
                </p>
              )
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={handleDecline}
                disabled={loading}
                className="w-1/2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition"
              >
                {loading ? "..." : "Cancel"}
              </button>
              <button
                onClick={isGroupDare ? handleJoinGroup : handleAcceptOneOnOne}
                disabled={loading}
                className="w-1/2 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
              >
                {loading ? "..." : isGroupDare ? "Join" : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
