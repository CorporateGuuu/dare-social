import { USE_MOCK } from "../hooks/useDares";
import { callAcceptDare, callSubmitProof, callCompleteDare } from "./firebase";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function acceptDareService({ dareId }) {
  if (USE_MOCK) {
    await delay(400);
    return { success: true, message: "Joined dare (mock)" };
  }
  return (await callAcceptDare({ dareId })).data;
}

export async function submitProofService({ dareId, mediaUrl, caption }) {
  if (USE_MOCK) {
    await delay(600);
    return { success: true, message: "Proof submitted (mock)" };
  }
  return (await callSubmitProof({ dareId, mediaUrl, caption })).data;
}

export async function completeDareService({ dareId, winnerId }) {
  if (USE_MOCK) {
    await delay(500);
    return { success: true, message: "Dare completed (mock)" };
  }
  return (await callCompleteDare({ dareId, winnerId })).data;
}
