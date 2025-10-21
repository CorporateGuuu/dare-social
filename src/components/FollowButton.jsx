import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { TouchableOpacity, Text, View } from "react-native";
import { handleFollow } from "../lib/friendship";
import { db, auth } from "../config/firebase";

export default function FollowButton({ targetId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const checkStatus = async () => {
      const followingDoc = await getDoc(doc(db, "users", currentUserId, "following", targetId));
      const followerDoc = await getDoc(doc(db, "users", targetId, "following", currentUserId));
      setIsFollowing(followingDoc.exists());
      setIsMutual(followingDoc.exists() && followerDoc.exists());
    };
    checkStatus();
  }, [targetId, currentUserId]);

  const toggleFollow = async () => {
    try {
      await handleFollow(targetId, isFollowing);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", marginTop: 16 }}>
      {isMutual ? (
        <View style={{
          backgroundColor: "#1B1B1B",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8
        }}>
          <Text style={{
            color: "#4ADE80",
            fontWeight: "500",
            fontSize: 14
          }}>
            ✅ Mutual Friend
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={toggleFollow}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: isFollowing ? "#374151" : "#2563EB"
          }}
        >
          <Text style={{
            color: isFollowing ? "#D1D5DB" : "#FFFFFF",
            fontWeight: "500",
            fontSize: 14
          }}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
