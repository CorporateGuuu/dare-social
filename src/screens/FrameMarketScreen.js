import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Frame_Market() {
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState('dare'); // Start with dare for demo
  const [selectedFrame, setSelectedFrame] = useState({
    rarity: 3,
    name: 'Epic Frame',
    example: 'This is a sample proof text.',
    price: 150,
  });
  const [favorites, setFavorites] = useState([]);

  const balance = 500; // Sample stones balance

  const headerItems = [
    { key: 'stone', icon: 'all-out', iconSize: 25, label: 'Stone Frame Gallery' },
    { key: 'frameMarket', icon: 'shopping-bag', iconSize: 23, label: 'Frame Market' },
    { key: 'dare', icon: 'play-arrow', iconSize: 25, label: 'Dare Frame Gallery' },
  ];

  const isSelected = (key) => selectedSection === key;

  const getStoneSections = () => {
    const sections = [];
    if (favorites.length > 0) {
      const rows = getRows(favorites);
      sections.push({ key: 'favorites', title: 'Favorited', data: rows });
    }
    for (let rarity = 5; rarity >= 1; rarity--) {
      const framesAtRarity = frames.filter(f => f.rarity === rarity);
      if (framesAtRarity.length > 0) {
        const rows = getRows(framesAtRarity);
        sections.push({ key: `rarity${rarity}`, title: getDiamonds(rarity), data: rows });
      }
    }
    return sections;
  };

  const getRows = (ownedFrames) => {
    const rows = [];
    const numRows = Math.ceil(ownedFrames.length / 3);
    for (let r = 0; r < numRows; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const index = r * 3 + c;
        row.push(ownedFrames[index] || null);
      }
      rows.push(row);
    }
    return rows;
  };

  const getDiamonds = (rarity) => Array.from({ length: rarity }, () => '♦').join(' ');

  const frames = [
    { id: 1, rarity: 2, name: 'Basic Frame', example: 'Basic text.', price: 100 },
    { id: 2, rarity: 3, name: 'Epic Frame', example: 'This is a sample proof text.', price: 150 },
    { id: 3, rarity: 4, name: 'Legendary Frame', example: 'Legendary content here.', price: 250 },
    { id: 4, rarity: 1, name: 'Common Frame', example: 'Common frame text.', price: 50 },
    { id: 5, rarity: 5, name: 'Mythic Frame', example: 'Mythic rarity frame.', price: 400 },
  ];

  const renderSelectedFrame = () => {
    const diamonds = Array.from({ length: selectedFrame.rarity }, (_, i) => i);
    return (
      <View style={styles.selectedFrame}>
        <View style={styles.rarity}>
          {diamonds.map(i => <Text key={i} style={styles.diamond}>♦</Text>)}
        </View>
        <Text style={styles.frameName}>{selectedFrame.name}</Text>
        <View style={styles.frameExample}>
          <Text style={selectedSection !== 'frameMarket' ? styles.finalizedText : styles.exampleText}>{selectedFrame.example}</Text>
        </View>
        {selectedSection === 'frameMarket' ? (
          <TouchableOpacity style={styles.purchaseButton}>
            <Text style={styles.purchaseText}>Purchase for {selectedFrame.price} 🪨</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => {
              if (!favorites.find(f => f.id === selectedFrame.id)) {
                setFavorites([...favorites, selectedFrame]);
              }
            }}>
              <MaterialIcons name="favorite-border" size={30} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateChallenge', { frame: selectedFrame })}>
              <MaterialIcons name="add-box" size={30} color="#007bff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderCard = ({ item }) => {
    const diamonds = Array.from({ length: item.rarity }, (_, i) => i);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedFrame(item)}
      >
        <View style={styles.frameExample}>
          <Text style={styles.exampleText}>{item.example}</Text>
        </View>
        <View style={styles.cardRarity}>
          {diamonds.map(i => <Text key={i} style={styles.cardDiamond}>♦</Text>)}
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price} 🪨</Text>
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {headerItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.headerButton, isSelected(item.key) ? styles.selected : styles.unselected]}
            onPress={() => setSelectedSection(item.key)}
          >
            <MaterialIcons name={item.icon} size={item.iconSize} color="#ffffff" />
            <Text style={styles.headerText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Selected Frame</Text>
        {renderSelectedFrame()}
        <Text style={styles.galleryTitle}>
          {selectedSection === 'dare' ? 'Dare Frame Gallery' : selectedSection === 'stone' ? 'Stone Frame Gallery' : 'Frame Market Gallery'}
        </Text>
        <View style={styles.galleryBox}>
          <View style={styles.galleryHeader}>
            <Text style={styles.balanceText}>
              {selectedSection === 'dare' ? `Favorites: ${favorites.length}` : selectedSection === 'stone' ? `Frames: ${frames.length}` : `Stone: ${balance} 🪨`}
            </Text>
            <View style={styles.filterIcons}>
              <TouchableOpacity>
                <MaterialIcons name="arrow-upward" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="arrow-downward" size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="grade" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
          {selectedSection === 'stone' ? (
            getStoneSections().map((section) => (
              <View key={section.key} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.data.map((row, index) => (
                  <View key={`${section.key}-row-${index}`} style={styles.stoneRow}>
                    {row.map((frame, slotIndex) => (
                      <View key={frame ? `${section.key}-${frame.id}` : `blank-${section.key}-${index}-${slotIndex}`} style={styles.stoneSlot}>
                        {frame ? (
                          <TouchableOpacity onPress={() => setSelectedFrame(frame)} style={styles.stoneFrame}>
                            <Text style={styles.smallText}>{frame.name}</Text>
                            <View style={styles.smallDiamonds}>
                              {Array.from({ length: frame.rarity }, (_, i) => <Text key={i} style={styles.smallDiamond}>♦</Text>)}
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.blankSlot}>
                            <Text style={styles.blankText}>Empty</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))
          ) : (
            (selectedSection === 'dare' ? favorites : frames).map((item) => (
              <View key={item.id}>
                {renderCard({ item })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  header: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10 },
  headerButton: { width: 131, height: 70, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  selected: { backgroundColor: '#333333' },
  unselected: { backgroundColor: '#2a2a2a' },
  headerText: { fontSize: 12, textAlign: 'center', marginTop: 4, color: '#ffffff' },
  scrollContent: { flex: 1 },
  contentContainer: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#ffffff' },
  selectedFrame: { alignItems: 'center' },
  rarity: { flexDirection: 'row', marginBottom: 8 },
  diamond: { fontSize: 20, color: 'gold', marginHorizontal: 2 },
  frameName: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#ffffff' },
  frameExample: { borderWidth: 2, borderColor: '#555555', padding: 16, marginBottom: 16, backgroundColor: '#333333' },
  exampleText: { fontSize: 16, textAlign: 'center', color: '#cccccc' },
  purchaseButton: { backgroundColor: '#667eea', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  purchaseText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  galleryTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 20, color: '#ffffff' },
  galleryBox: { borderWidth: 2, borderColor: '#555555', padding: 10, backgroundColor: '#2a2a2a' },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  balanceText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  filterIcons: { flexDirection: 'row', gap: 10 },
  card: { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: '#555555', marginVertical: 8, padding: 16, borderRadius: 8 },
  cardRarity: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  cardDiamond: { fontSize: 16, color: 'gold', marginHorizontal: 2 },
  cardName: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#ffffff' },
  cardPrice: { fontSize: 14, textAlign: 'center', color: '#cccccc' },
  finalizedText: { fontSize: 16, textAlign: 'center', color: '#667eea' },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', width: 200, marginTop: 16 },
  sectionContainer: { marginBottom: 16 },
  stoneRow: { flexDirection: 'row', justifyContent: 'space-between', height: 80, marginBottom: 8 },
  stoneSlot: { width: '30%', marginHorizontal: 4, height: '100%', borderWidth: 1, borderColor: '#555555', alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#2a2a2a' },
  stoneFrame: { alignItems: 'center' },
  smallText: { fontSize: 12, textAlign: 'center', color: '#cccccc' },
  smallDiamonds: { flexDirection: 'row', marginTop: 4 },
  smallDiamond: { fontSize: 10, color: 'gold', marginHorizontal: 1 },
  blankSlot: { alignItems: 'center', justifyContent: 'center' },
  blankText: { fontSize: 12, color: '#888888' },
});
