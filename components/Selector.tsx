import { emoticonEnum } from '@/constants/enum';
import { getCache } from '@/utils/fetchData';
import { SelectorProps } from '@/utils/types';
import { translateWord } from '@/utils/utils';
import { Icon } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const leagueLogos: { [key: string]: any } = {
  MLB: require('../assets/images/MLB.png'),
  NBA: require('../assets/images/NBA.png'),
  NFL: require('../assets/images/NFL.png'),
  NHL: require('../assets/images/NHL.png'),
  WNBA: require('../assets/images/WNBA.png'),
  PWHL: require('../assets/images/PWHL.png'),
  MLS: require('../assets/images/MLS.png'),
  NCAAF: require('../assets/images/ncaa-football.png'),
  NCAAB: require('../assets/images/ncaa-basketball.png'),
  NCCABB: require('../assets/images/ncaa-baseball.png'),
  WNCAAB: require('../assets/images/ncaa-basketball-woman.png'),
  DEFAULT: require('../assets/images/DEFAULT.png'),
};

export default function Selector({
  data,
  onItemSelectionChange,
  allowMultipleSelection = false,
  isClearable = false,
}: Readonly<SelectorProps>) {
  const { items, i, itemSelectedId } = data;
  let { itemsSelectedIds = [] } = data;

  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);

  // Charger les favoris
  useEffect(() => {
    const loadFavs = () => {
      setFavoriteTeams(getCache<string[]>('favoriteTeams')?.filter((t) => t !== '') || []);
    };
    loadFavs();
    if (typeof window !== 'undefined') {
      window.addEventListener('favoritesUpdated', loadFavs);
      return () => window.removeEventListener('favoritesUpdated', loadFavs);
    }
  }, []);

  // Préparer la liste des options
  const getOptions = () => {
    if (!items) return [];
    return items
      .filter((item) => !!item)
      .map((item) => {
        const id = typeof item === 'string' ? item : item.uniqueId;
        const labelRaw = typeof item === 'string' ? item : item.label;
        const league = typeof item === 'string' ? item : item.league || item.value;
        const isAll = labelRaw === 'All' || id === 'ALL';

        // Ajouter l'emoji si disponible
        const icon = !isAll && league ? ' ' + (emoticonEnum[league as keyof typeof emoticonEnum] || '') : '';
        const label = (labelRaw === 'All' ? translateWord('all') : labelRaw) + icon;

        return {
          id,
          label,
          league,
          original: item,
          isFav: favoriteTeams.includes(id),
        };
      })
      .sort((a, b) => {
        // Mettre les favoris en premier
        if (a.isFav && !b.isFav) return -1;
        if (!a.isFav && b.isFav) return 1;
        return 0;
      });
  };

  const allOptions = getOptions();
  const uniqueLeagues = Array.from(
    new Set(allOptions.map((o) => o.league).filter((l) => !!l && typeof l === 'string'))
  );

  const filteredOptions = allOptions.filter((opt) => {
    const matchesSearch = opt.label.toLowerCase().includes(search.toLowerCase());
    const matchesLeague = selectedLeague ? opt.league === selectedLeague : true;
    return matchesSearch && matchesLeague;
  });

  // Gérer la sélection
  const handleSelect = (id: string) => {
    if (allowMultipleSelection) {
      if (id === 'SELECT_ALL') {
        const allIds = allOptions.map((o) => o.id);
        const isAllSelected = allOptions.every((o) => itemsSelectedIds.includes(o.id));
        onItemSelectionChange(isAllSelected ? [] : allIds, i);
      } else {
        const newSelection = itemsSelectedIds.includes(id)
          ? itemsSelectedIds.filter((sid) => sid !== id)
          : [...itemsSelectedIds, id];
        onItemSelectionChange(newSelection, i);
      }
    } else {
      onItemSelectionChange(id, i);
      setVisible(false);
    }
  };

  const handleClear = () => {
    if (allowMultipleSelection) {
      onItemSelectionChange([], i);
    } else {
      onItemSelectionChange('', i);
    }
  };

  // Texte affiché dans le bouton principal
  const getDisplayText = () => {
    if (allowMultipleSelection) {
      if (!itemsSelectedIds || itemsSelectedIds.length === 0) return translateWord('Filter');
      if (itemsSelectedIds.length === allOptions.length && allOptions.length > 0) return translateWord('all');

      const selectedLabels = allOptions.filter((o) => itemsSelectedIds.includes(o.id)).map((o) => o.label);

      if (selectedLabels.length === 0) return translateWord('Filter');

      // Affiche "Item 1, Item 2" ou "Item 1, Item 2 (+3)"
      if (selectedLabels.length <= 2) return selectedLabels.join(', ');
      return `${selectedLabels.slice(0, 2).join(', ')} (+${selectedLabels.length - 2})`;
    } else {
      const selected = allOptions.find((o) => o.id === itemSelectedId);
      return selected ? selected.label : translateWord('Filter');
    }
  };

  const hasSelection = allowMultipleSelection ? itemsSelectedIds.length > 0 : !!itemSelectedId;

  const isAllSelected = allOptions.length > 0 && allOptions.every((o) => itemsSelectedIds.includes(o.id));

  const isDisabled =
    !items ||
    items.length === 0 ||
    (allOptions.length === 1 &&
      (allowMultipleSelection ? itemsSelectedIds.includes(allOptions[0].id) : itemSelectedId === allOptions[0].id));

  const renderTrigger = () => {
    if (allowMultipleSelection && itemsSelectedIds.length > 0) {
      const selectedOptions = allOptions.filter((o) => itemsSelectedIds.includes(o.id));
      if (selectedOptions.length > 0) {
        return (
          <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap', gap: 5, marginRight: 10 }}>
            {selectedOptions.map((opt) => {
              let logo = (opt.original as any)?.logo || (opt.original as any)?.teamLogo;

              if (!logo) {
                if (leagueLogos[opt.id]) logo = leagueLogos[opt.id];
                else if (opt.league && leagueLogos[opt.league]) logo = leagueLogos[opt.league];
              }

              return logo ? (
                <Image
                  key={opt.id}
                  source={typeof logo === 'string' ? { uri: logo } : logo}
                  style={{ width: 25, height: 25, resizeMode: 'contain' }}
                />
              ) : (
                <Text key={opt.id} style={{ fontSize: 12, color: '#333', marginRight: 5 }}>
                  {opt.label}
                </Text>
              );
            })}
          </View>
        );
      }
    }

    let logo = null;
    if (!allowMultipleSelection && itemSelectedId) {
      const selectedItem = allOptions.find((o) => o.id === itemSelectedId);
      if (selectedItem) {
        logo = (selectedItem.original as any)?.logo || (selectedItem.original as any)?.teamLogo;
        if (!logo) {
          if (leagueLogos[selectedItem.id]) logo = leagueLogos[selectedItem.id];
          else if (selectedItem.league && leagueLogos[selectedItem.league]) logo = leagueLogos[selectedItem.league];
        }
      }
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {logo && (
          <Image
            source={typeof logo === 'string' ? { uri: logo } : logo}
            style={{ width: 25, height: 25, resizeMode: 'contain', marginRight: 10, opacity: isDisabled ? 0.5 : 1 }}
          />
        )}
        <Text style={[styles.selectorText, (!hasSelection || isDisabled) && { color: '#999' }]} numberOfLines={1}>
          {getDisplayText()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.selectorButton, isDisabled && styles.selectorButtonDisabled]}
        onPress={() => setVisible(true)}
        disabled={isDisabled}
      >
        {renderTrigger()}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isClearable && hasSelection && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              style={{ marginRight: 10 }}
            >
              <Icon name="times-circle" type="font-awesome" size={16} color="#999" />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" type="font-awesome" size={12} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* En-tête */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{translateWord('select') || 'Select'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Icon name="times" type="font-awesome" size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Recherche */}
            <View style={styles.searchContainer}>
              <Icon name="search" type="font-awesome" size={14} color="#999" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={translateWord('search') || 'Search...'}
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#999"
              />
            </View>

            {/* Filtre par ligue */}
            {uniqueLeagues.length > 1 && uniqueLeagues.length < allOptions.length && (
              <View style={styles.leagueFilterContainer}>
                {(() => {
                  const filters = [null, ...uniqueLeagues];
                  const maxPerLine = 5;
                  const numLines = Math.ceil(filters.length / maxPerLine);
                  const itemsPerLine = Math.max(1, Math.ceil(filters.length / numLines));
                  const rows = [];
                  for (let i = 0; i < filters.length; i += itemsPerLine) {
                    rows.push(filters.slice(i, i + itemsPerLine));
                  }
                  return rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.leagueRow}>
                      {row.map((league) => (
                        <TouchableOpacity
                          key={league || 'FILTER_ALL'}
                          style={[styles.leagueChip, selectedLeague === league && styles.leagueChipSelected]}
                          onPress={() => setSelectedLeague(league === selectedLeague ? null : league)}
                        >
                          <Text
                            style={[styles.leagueChipText, selectedLeague === league && styles.leagueChipTextSelected]}
                            numberOfLines={1}
                          >
                            {league === null ? translateWord('all') || 'All' : league}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {Array.from({ length: itemsPerLine - row.length }).map((_, i) => (
                        <View key={`placeholder-${i}`} style={[styles.leagueChip, { opacity: 0, borderWidth: 0 }]} />
                      ))}
                    </View>
                  ));
                })()}
              </View>
            )}

            {/* Liste des options */}
            <FlatList
              data={
                allowMultipleSelection
                  ? [
                      { id: 'SELECT_ALL', label: translateWord('all'), isFav: false, original: null },
                      ...filteredOptions,
                    ]
                  : filteredOptions
              }
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = allowMultipleSelection
                  ? item.id === 'SELECT_ALL'
                    ? isAllSelected
                    : itemsSelectedIds.includes(item.id)
                  : itemSelectedId === item.id;

                let logo = (item.original as any)?.logo || (item.original as any)?.teamLogo;
                if (!logo) {
                  if (leagueLogos[item.id]) logo = leagueLogos[item.id];
                  else if (item.league && leagueLogos[item.league]) logo = leagueLogos[item.league];
                }

                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionSelected]}
                    onPress={() => handleSelect(item.id)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {logo && (
                        <Image
                          source={typeof logo === 'string' ? { uri: logo } : logo}
                          style={{ width: 30, height: 30, resizeMode: 'contain', marginRight: 10 }}
                        />
                      )}
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item.label}</Text>
                    </View>
                    {isSelected && (
                      <Icon name="check" type="font-awesome" size={14} color={isSelected ? 'white' : 'black'} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: '100%',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 45,
  },
  selectorButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  selectorText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  leagueFilterContainer: {
    marginBottom: 10,
  },
  leagueRow: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: -4,
  },
  leagueChip: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueChipSelected: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  leagueChipText: {
    fontSize: 12,
    color: '#333',
  },
  leagueChipTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  list: {
    flexGrow: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#323435',
    borderRadius: 5,
    marginVertical: 2,
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});
