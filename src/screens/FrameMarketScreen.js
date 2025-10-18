import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icon from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rarity: 'All',
    section: 'All',
    myFrames: false,
  });

  const balance = 500; // Sample stones balance

  // Stories data (mock)
  const stories = [
    { id: '1', user: '@willsamrick', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', user: '@frankvecchie', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: '3', user: '@mattbraun', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', user: '@brendengroess', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];

  // Filter frames based on search query and filters
  const filteredFrames = frames.filter((frame) => {
    const matchesSearch = frame.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = filters.rarity === 'All' || frame.rarity.toString() === filters.rarity;
    const matchesSection = filters.section === 'All' || selectedSection == filters.section;
    const matchesMyFrames = !filters.myFrames || favorites.some(f => f.id === frame.id);
    return matchesSearch && matchesRarity && matchesSection && matchesMyFrames;
  });

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



  const Story = ({ story }) => (
    <View style={styles.story}>
      <Image source={{ uri: story.image }} style={styles.storyImage} />
      <Text style={styles.storyUser}>{story.user}</Text>
    </View>
  );

  const renderFrameCard = ({ item }) => {
    // Determine border color based on rarity
    const borderColors = ['#666666', '#CCCCCC', '#FFD700', '#FF6B6B', '#FF1493'];
    const borderColor = borderColors[item.rarity - 1] || '#666666';

    const diamonds = Array.from({ length: item.rarity }, (_, i) => i);
    return (
      <View style={[styles.card, { borderColor }]}>
        <Text style={styles.frameTitle}>{item.name}</Text>
        <View style={styles.rarityRow}>
          {diamonds.map(i => <Text key={i} style={styles.diamond}>♦</Text>)}
        </View>
        <View style={styles.framePreview}>
          <Text style={styles.previewText}>{item.example}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price} 🪨</Text>
          {selectedSection === 'frameMarket' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Purchase</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar backgroundColor="#000000" style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Abstrac</Text>
          <View style={styles.stonesBadge}>
            <Text style={styles.stonesText}>○ {balance}</Text>
          </View>
        </View>

        <View style={styles.searchAndFilterContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search frames..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="funnel" size={18} color={showFilters ? "#000000" : "#FFFFFF"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Filter Options</Text>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Rarity:</Text>
              <Picker
                selectedValue={filters.rarity}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, rarity: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" />
              </Picker>
            </View>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Section:</Text>
              <Picker
                selectedValue={filters.section}
                style={styles.miniPicker}
                onValueChange={(itemValue) => setFilters({ ...filters, section: itemValue })}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="dare" value="dare" />
                <Picker.Item label="stone" value="stone" />
                <Picker.Item label="frameMarket" value="frameMarket" />
              </Picker>
            </View>
            <TouchableOpacity
              style={[styles.myFramesButton, filters.myFrames && styles.myFramesButtonActive]}
              onPress={() => setFilters({ ...filters, myFrames: !filters.myFrames })}
            >
              <View style={styles.checkboxRow}>
                <Icon name={filters.myFrames ? "checkmark-circle" : "ellipse-outline"} size={20} color="#FFFFFF" />
                <Text style={styles.myFramesText}>My Frames</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories}>
            {stories.map((story) => (
              <Story key={story.id} story={story} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.tabsContainer}>
          {headerItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.tabButton, isSelected(item.key) && styles.tabActive]}
              onPress={() => setSelectedSection(item.key)}
            >
              <MaterialIcons name={item.icon} size={item.iconSize} color="#ffffff" />
              <Text style={styles.tabText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderSelectedFrame()}

        <ScrollView style={styles.framesScroll}>
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
            (selectedSection === 'dare' ? favorites : filteredFrames).map((item) => (
              <View key={item.id}>
                {renderFrameCard({ item })}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
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
