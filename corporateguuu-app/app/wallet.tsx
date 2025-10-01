import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../src/lib/firebase";

type Transaction = {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  createdAt: any;
};

export default function WalletScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "users", auth.currentUser.uid, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!auth.currentUser) return <Text>Not signed in</Text>;
  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wallet History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.type === "earn" ? "💰 Earned" : "💸 Spent"} {item.amount} Stone</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
