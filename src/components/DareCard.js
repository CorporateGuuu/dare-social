import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { auth } from "../config/firebase";
import AcceptDareButton from "./AcceptDareButton";
import ProofSubmissionModal from "./ProofSubmissionModal";

export default function DareCard({ dare, userData = null }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);

  useEffect(() => {
    if (dare.deadline) {
      const interval = setInterval(() => {
        const now = dayjs();
        const deadline = dayjs(dare.deadline);
        const diff = deadline.diff(now, "hour", true);

        if (diff <= 0) setTimeLeft("Expired");
        else if (diff < 1) setTimeLeft(`${Math.floor(diff * 60)} min left`);
        else setTimeLeft(`${Math.floor(diff)} hr left`);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [dare.deadline]);

  const statusColor =
    dare.status === "open"
      ? "text-blue-400"
      : dare.status === "active"
      ? "text-yellow-400"
      : dare.status === "completed"
      ? "text-green-400"
      : dare.status === "cancelled"
      ? "text-red-400"
      : "text-gray-500";

  const currentUser = auth.currentUser;
  const isParticipant = dare.participants?.some(p => p.user_id === currentUser?.uid);

  // Calculate totals
  const completedCount = dare.participants?.filter(p => p.completed).length || 0;
  const totalParticipants = dare.participants?.length || 0;
  const totalVotes = dare.participants?.reduce((sum, p) => sum + (p.votes || 0), 0) || 0;

  return (
    <div className="bg-gradient-to-b from-[#1B1B1B] to-[#0E0E0E] border border-gray-700 rounded-2xl p-4 mb-4 shadow-md transition-all">
      <h3 className="text-white font-semibold text-center mb-3">{dare.title}</h3>

      {/* Creator and Status */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Creator:</span>
          <span className="text-gray-300 text-sm">@{dare.participants?.find(p => p.user_id === dare.creator_id)?.username || dare.creator_id}</span>
        </div>
        <div className={`text-right font-medium text-xs ${statusColor}`}>
          {dare.status.toUpperCase()}
        </div>
      </div>

      {/* Deadline */}
      {dare.deadline && dare.status !== "completed" && dare.status !== "cancelled" && (
        <div className="text-center text-gray-400 text-sm mb-3">
          Deadline: {dayjs(dare.deadline).format("MMM D, h:mm A")}
          {dare.status === "active" && <div className="text-yellow-400">{timeLeft}</div>}
        </div>
      )}

      {/* Entry Stake */}
      <div className="flex justify-center items-center text-gray-400 text-sm mb-3">
        <div>Entry Stake: 💰 {dare.entry_stake}</div>
      </div>

      {/* Participants */}
      <div className="mb-3">
        <div className="text-gray-400 text-sm mb-2">Participants ({totalParticipants})</div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {dare.participants?.map((participant) => (
            <div key={participant.user_id} className="flex justify-between items-center bg-[#2A2A2A] rounded-lg p-2">
              <div className="flex items-center gap-2">
                <img src={participant.avatar} alt="" className="w-6 h-6 rounded-full border border-gray-600" />
                <span className="text-gray-300 text-sm">@{participant.username}</span>
              </div>
              <div className="flex items-center gap-2">
                {participant.completed && (
                  <span className="text-green-400 text-xs">✓ Completed</span>
                )}
                {participant.proof_url && (
                  <span className="text-blue-400 text-xs">📎 Proof</span>
                )}
                <span className="text-yellow-400 text-xs">❤️ {participant.votes || 0}</span>
              </div>
            </div>
          )) || <div className="text-gray-500 text-sm">No participants yet</div>}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex justify-between items-center text-gray-400 text-xs mb-3 border-t border-gray-700 pt-2">
        <div>Completed: {completedCount}/{totalParticipants}</div>
        <div>Total Votes: {totalVotes}</div>
      </div>

      {/* Winner */}
      {dare.winner_id && (
        <div className="text-center text-green-400 font-medium text-sm mb-2">
          Winner: @{dare.participants?.find(p => p.user_id === dare.winner_id)?.username || dare.winner_id}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!isParticipant && dare.status === "open" && (
          <AcceptDareButton dare={dare} userData={userData} />
        )}
        {isParticipant && dare.status === "active" && !dare.participants?.find(p => p.user_id === currentUser.uid)?.completed && (
          <button
            onClick={() => setShowProofModal(true)}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white text-sm"
          >
            Submit Proof
          </button>
        )}
        {isParticipant && dare.status === "active" && dare.participants?.find(p => p.user_id === currentUser.uid)?.completed && (
          <div className="flex-1 text-center text-green-400 text-sm py-2">Proof Submitted</div>
        )}
        {isParticipant && dare.status === "active" && completedCount > 0 && (
          <button className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium text-white text-sm">
            Vote ({completedCount} proofs)
          </button>
        )}
      </div>

      {/* Proof Submission Modal */}
      <ProofSubmissionModal
        isVisible={showProofModal}
        onClose={() => setShowProofModal(false)}
        dare={dare}
      />
    </div>
  );
}
