import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../config/firebase";

const ProofSubmissionModal = ({ isVisible, onClose, dare }) => {
  const [proofText, setProofText] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUserId = auth.currentUser?.uid;
  const currentParticipant = dare?.participants?.find(p => p.user_id === currentUserId);

  const handleSubmitProof = async () => {
    if (!currentUserId || !dare) return;

    if (!proofText.trim() && !proofUrl.trim() && !proofImage) {
      alert("Please provide some form of proof (text description, URL, or image).");
      return;
    }

    setLoading(true);
    try {
      const dareRef = doc(db, "dares", dare.dare_id);

      // Update participant completion status
      const updatedParticipants = dare.participants.map(p => {
        if (p.user_id === currentUserId) {
          return {
            ...p,
            completed: true,
            proof_url: proofUrl.trim(),
            proof_submitted_at: serverTimestamp()
          };
        }
        return p;
      });

      await updateDoc(dareRef, {
        participants: updatedParticipants,
        updated_at: serverTimestamp(),
      });

      // Here you could also add to a proofs subcollection for detailed proof storage
      // const proofsRef = collection(dareRef, 'proofs');
      // await addDoc(proofsRef, {
      //   user_id: currentUserId,
      //   ...proofData
      // });

      alert("Proof submitted successfully! Other participants will vote to verify it.");
      setProofText("");
      setProofImage(null);
      setProofUrl("");
      onClose();

    } catch (error) {
      console.error("Error submitting proof:", error);
      alert("Failed to submit proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#1A1A1A] border border-gray-700 rounded-2xl w-11/12 max-w-md p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-white text-lg font-semibold mb-4 text-center">
          Submit Proof of Completion
        </h2>

        <p className="text-gray-400 text-sm mb-4 text-center">
          Prove that you&apos;ve completed: <br />
          <span className="text-white font-medium">{dare.title}</span>
        </p>

        {/* Proof Text */}
        <label className="block text-sm text-gray-400 mb-1">Description *</label>
        <textarea
          value={proofText}
          onChange={(e) => setProofText(e.target.value)}
          placeholder="Describe how you completed this dare..."
          rows={4}
          className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-blue-500 outline-none resize-none"
        />

        {/* Proof URL */}
        <label className="block text-sm text-gray-400 mb-1">Photo/Video URL (optional)</label>
        <input
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://example.com/proof.jpg"
          className="w-full bg-[#1B1B1B] border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-blue-500 outline-none"
        />

        {/* File Upload Placeholder - can be enhanced later */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Upload File (Coming Soon)</label>
          <div className="w-full bg-[#1B1B1B] border border-gray-700 border-dashed rounded-lg p-4 text-center text-gray-500">
            File upload feature coming soon
          </div>
        </div>

        {/* Current Status */}
        {currentParticipant?.completed && (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-3 mb-4 text-center">
            <div className="text-green-400 text-sm">You have already submitted proof</div>
            <div className="text-green-400 text-xs mt-1">
              Votes received: {currentParticipant.votes || 0}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitProof}
            disabled={loading || currentParticipant?.completed}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              currentParticipant?.completed
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : loading
                ? "bg-blue-600/50 text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Submitting..." : "Submit Proof"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProofSubmissionModal;
