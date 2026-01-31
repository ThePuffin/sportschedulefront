import { GameStatus, leagueLogos } from '@/constants/enum';
import { useFavoriteColor } from '@/hooks/useFavoriteColor';
import { getGamesStatus } from '@/utils/date';
import { getCache } from '@/utils/fetchData';
import { CardsProps } from '@/utils/types';
import { translateWord } from '@/utils/utils';
import { Card } from '@rneui/base';
import { Icon } from '@rneui/themed';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import GameModal from './GameModal';

export default function CardLarge({
  data,
  showDate = false,
  showScores: propShowScores,
  isSelected = false,
  onSelection,
}: Readonly<CardsProps & { showScores?: boolean }>) {
  const {
    homeTeamShort,
    awayTeamShort,
    homeTeamLogo,
    awayTeamLogo,
    homeTeamLogoDark,
    awayTeamLogoDark,
    homeTeamScore,
    awayTeamScore,
    arenaName = '',
    startTimeUTC,
    teamSelectedId,
    homeTeamId,
    awayTeamId,
    homeTeamRecord,
    awayTeamRecord,
    awayTeamColor,
    homeTeamColor,
    awayTeamBackgroundColor,
    homeTeamBackgroundColor,
    placeName = '',
    gameDate: gameDateStr,
    urlLive,
  } = data;

  const emptyCard = !homeTeamShort && !awayTeamShort;
  const { width } = useWindowDimensions();
  const isMedium = width >= 768 && width < 1200;
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => getCache<string[]>('favoriteTeams') || []);
  const [showScores, setShowScores] = useState<boolean>(() => {
    if (propShowScores !== undefined) return propShowScores;
    const cached = getCache<boolean>('showScores');
    return cached ?? true;
  });

  useEffect(() => {
    if (propShowScores !== undefined) {
      setShowScores(propShowScores);
    }
  }, [propShowScores]);

  useEffect(() => {
    if (propShowScores !== undefined) return;

    const updateScores = () => {
      setShowScores(getCache<boolean>('showScores') ?? true);
    };
    if (globalThis.window !== undefined) {
      globalThis.window.addEventListener('scoresUpdated', updateScores);
      return () => globalThis.window.removeEventListener('scoresUpdated', updateScores);
    }
  }, [propShowScores]);

  const [modalVisible, setModalVisible] = useState(false);
  const [scoreRevealed, setScoreRevealed] = useState(false);
  const { backgroundColor: selectedBackgroundColor, textColor: selectedColor } = useFavoriteColor('#3b82f6');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const updateFavorites = () => {
      setFavoriteTeams(getCache<string[]>('favoriteTeams') || []);
    };
    if (globalThis.window !== undefined) {
      globalThis.window.addEventListener('favoritesUpdated', updateFavorites);
      return () => globalThis.window.removeEventListener('favoritesUpdated', updateFavorites);
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!showScores) {
      setScoreRevealed(false);
    }
  }, [showScores]);

  const hasScore = homeTeamScore != null && awayTeamScore != null;
  const status = getGamesStatus(data);
  const isLive = status === GameStatus.IN_PROGRESS;

  useEffect(() => {
    if (isLive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isLive, pulseAnim]);

  let timeText = '';
  if (status === GameStatus.FINAL) {
    timeText = translateWord('ended');
  } else if (status === GameStatus.IN_PROGRESS) {
    timeText = translateWord('followLive');
  } else if (startTimeUTC) {
    timeText = showDate
      ? new Date(startTimeUTC).toLocaleDateString(undefined, {
          day: 'numeric',
          month: width < 640 || width > 1008 ? 'short' : 'numeric',
        })
      : new Date(startTimeUTC).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  const leagueKey = (data.league || 'DEFAULT') as keyof typeof leagueLogos;
  const leagueLogo = leagueLogos[leagueKey] || leagueLogos.DEFAULT;

  const logoStyle = { filter: `brightness(1.1) contrast(1.2) )` } as any;
  const leagueLogoStyle = leagueKey === 'PWHL' ? ({ filter: 'brightness(0) invert(1)' } as any) : logoStyle;

  const isFavoriteHomeTeam = favoriteTeams.includes(homeTeamId);
  const isFavorite = favoriteTeams.includes(homeTeamId) || favoriteTeams.includes(awayTeamId);
  const isSelectedTeam = teamSelectedId === homeTeamId;
  const baseColor = isSelectedTeam ? '#0f172a' : '#1e293b';
  const revertColor = isSelectedTeam ? '#1e293b' : '#0f172a';

  const getBrightness = (hexColor: string) => {
    if (!hexColor) return 0;
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  const formatColor = (c: string | undefined) => {
    if (!c) return baseColor;
    return c.startsWith('#') ? c : `#${c}`;
  };

  const getLighterColor = (c1: string | undefined, c2: string | undefined) => {
    const color1 = formatColor(c1);
    const color2 = formatColor(c2);
    return getBrightness(color1) > getBrightness(color2) ? color1 : color2;
  };

  const awayColorHex = getLighterColor(awayTeamColor, awayTeamBackgroundColor);
  const homeColorHex = getLighterColor(homeTeamColor, homeTeamBackgroundColor);

  let gradientStyle = {
    backgroundColor: baseColor,
    backgroundImage: `linear-gradient(90deg, ${awayColorHex} 0%, ${baseColor} 5%, ${baseColor} 95%, ${homeColorHex} 100%)`,
  };

  if (emptyCard) {
    gradientStyle = {
      backgroundColor: '#0f172a',
      borderWidth: 1,
      borderColor: '#131c33',
      cursor: 'default',
    };
  }

  let homeBg = homeColorHex;
  let awayBg = awayColorHex;

  const displayHomeLogo = getBrightness(homeBg) < 128 && homeTeamLogoDark ? homeTeamLogoDark : homeTeamLogo;
  const displayAwayLogo = getBrightness(awayBg) < 128 && awayTeamLogoDark ? awayTeamLogoDark : awayTeamLogo;

  const stadiumSearch = arenaName.replace(/\s+/g, '+') + ',' + placeName.replace(/\s+/g, '+');

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card
        containerStyle={[styles.cardContainer, { padding: 0, backgroundColor: 'transparent' }]}
        wrapperStyle={{ padding: 0 }}
      >
        <Pressable
          onPress={() => {
            if (onSelection) {
              onSelection(data);
            } else {
              setModalVisible(true);
              setScoreRevealed(true);
            }
          }}
        >
          <View style={[{ padding: 15, borderRadius: 20 }, gradientStyle]}>
            <div style={emptyCard ? styles.invisible : {}}>
              {/* Header: League Logo & Live Badge */}
              <View style={styles.headerRow}>
                <View style={styles.leagueBadge}>
                  <Image source={leagueLogo} style={[styles.leagueIcon, leagueLogoStyle]} resizeMode="contain" />
                </View>
                {isLive && (
                  <View style={styles.liveBadge}>
                    <Animated.View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 4,
                        backgroundColor: '#ef4444',
                        opacity: pulseAnim,
                      }}
                    />
                  </View>
                )}
                {status === GameStatus.SCHEDULED && isSelected && (
                  <View style={[styles.bookmarkBadge, { backgroundColor: selectedBackgroundColor }]}>
                    <Icon name="bookmark" type="font-awesome" size={14} color={selectedColor} />
                  </View>
                )}
              </View>

              {/* Main Content: Teams & Score/Time */}
              <View style={styles.mainRow}>
                {/* away Team */}
                {/* Away Team */}
                <View style={[styles.teamColumn]}>
                  <View style={[styles.logoPlaceholder]}>
                    <Image
                      source={displayAwayLogo ? { uri: displayAwayLogo } : require('../assets/images/default_logo.png')}
                      style={[styles.teamLogo, logoStyle, isMedium && { width: 45, height: 45, marginBottom: 4 }]}
                    />
                  </View>
                  <View style={styles.nameContainer}>
                    {/* On utilise \u00A0 (espace insécable) pour garantir que le texte occupe toujours une ligne */}
                    <Text style={[styles.teamName, isMedium && { fontSize: 14 }]} numberOfLines={1}>
                      {awayTeamShort || '\u00A0'}
                    </Text>
                    {favoriteTeams.includes(awayTeamId) && (
                      <Icon name="star" type="font-awesome" size={14} color="#FFD700" style={{ marginLeft: 5 }} />
                    )}
                  </View>
                  <Text style={styles.recordText}>
                    {((showScores && !isFavorite) || scoreRevealed ? awayTeamRecord : '\u00A0') || '\u00A0'}
                  </Text>
                </View>

                {/* Center: Score or VS/@ */}
                <View style={styles.centerColumn}>
                  {hasScore ? (
                    (isFavorite || !showScores) && !scoreRevealed ? (
                      <TouchableOpacity
                        style={styles.revealButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          setScoreRevealed(true);
                        }}
                      >
                        <Icon name="eye" type="font-awesome" size={30} color="#94a3b8" />
                        <Text style={styles.revealText}>{translateWord('score')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.scoreRow}>
                        <Text style={[styles.scoreNumber, isMedium && { fontSize: 28 }]}>{awayTeamScore}</Text>
                        <Text style={[styles.scoreDivider, isMedium && { fontSize: 18, marginHorizontal: 5 }]}>-</Text>
                        <Text style={[styles.scoreNumber, isMedium && { fontSize: 28 }]}>{homeTeamScore}</Text>
                      </View>
                    )
                  ) : (
                    <Text style={[styles.vsText, isMedium && { fontSize: 24 }]}>@</Text>
                  )}

                  <View style={[styles.timeContainer, { backgroundColor: revertColor }]}>
                    {urlLive ? (
                      <a
                        href={urlLive}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setScoreRevealed(true);
                        }}
                      >
                        <Text style={styles.liveTimeText}>{timeText}</Text>
                      </a>
                    ) : (
                      <Text style={isLive ? styles.liveTimeText : styles.timeText}>{timeText}</Text>
                    )}
                  </View>
                </View>

                {/* home Team */}
                <View style={[styles.teamColumn]}>
                  <View style={styles.logoPlaceholder}>
                    <Image
                      source={displayHomeLogo ? { uri: displayHomeLogo } : require('../assets/images/default_logo.png')}
                      style={[styles.teamLogo, logoStyle, isMedium && { width: 45, height: 45, marginBottom: 4 }]}
                    />
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={[styles.teamName, isMedium && { fontSize: 14 }]} numberOfLines={1}>
                      {homeTeamShort || '\u00A0'}
                    </Text>
                    {favoriteTeams.includes(homeTeamId) && (
                      <Icon name="star" type="font-awesome" size={14} color="#FFD700" style={{ marginLeft: 5 }} />
                    )}
                  </View>
                  <Text style={styles.recordText}>
                    {((showScores && !isFavorite) || scoreRevealed ? homeTeamRecord : '\u00A0') || '\u00A0'}
                  </Text>
                </View>
              </View>

              {/* Footer: Arena */}
              <View style={[styles.footer, { borderTopColor: revertColor }]}>
                {arenaName ? (
                  <a
                    href={`https://maps.google.com/?q=${stadiumSearch}`}
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      width: '100%',
                      overflow: 'hidden',
                      justifyContent: 'center',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text style={styles.arenaText}>📍 {arenaName}</Text>
                  </a>
                ) : (
                  <Text style={styles.arenaText}>📍 {arenaName}</Text>
                )}
              </View>
            </div>
          </View>
        </Pressable>
      </Card>
      <GameModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
        gradientStyle={gradientStyle}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0f172a', // Bleu très foncé
    borderRadius: 20,
    borderWidth: 0,
    marginHorizontal: 10,
    padding: 15,
    height: 'auto',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leagueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  leagueIcon: {
    height: 18,
    width: 30,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  teamLogo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  teamName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  recordText: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    height: 14,
  },
  centerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.2,
  },
  vsText: {
    color: '#CBD5E1',
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: '900',
  },
  revealButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '700',
  },
  scoreDivider: {
    color: '#CBD5E1',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  timeContainer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  liveTimeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    marginTop: 15,
    paddingTop: 10,
    alignItems: 'center',
    height: 40,
  },
  arenaText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  bookmarkBadge: {
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
    minHeight: 120,
    justifyContent: 'flex-start',
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  invisible: {
    visibility: 'hidden',
  },
});
