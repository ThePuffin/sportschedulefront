import { GameFormatted } from '@/utils/types';
import { generateICSFile, translateWord } from '@/utils/utils';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameModalProps {
  visible: boolean;
  onClose: () => void;
  data: GameFormatted;
  gradientStyle: any;
}

export default function GameModal({ visible, onClose, data, gradientStyle }: GameModalProps) {
  const {
    startTimeUTC,
    homeTeamLogo,
    awayTeamLogo,
    homeTeam,
    awayTeam,
    arenaName,
    placeName,
    homeTeamScore,
    awayTeamScore,
  } = data;

  const hasScore = homeTeamScore != null && awayTeamScore != null;

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const stadiumSearch = (arenaName || '').replace(/\s+/g, '+') + ',' + (placeName || '').replace(/\s+/g, '+');

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.centeredView} onPress={onClose}>
        <Pressable style={[styles.modalView, gradientStyle]} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" type="font-awesome" size={20} color="white" />
          </TouchableOpacity>

          <View style={styles.modalContent}>
            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                {awayTeamLogo && <Image source={{ uri: awayTeamLogo }} style={styles.logo} resizeMode="contain" />}
                <Text style={styles.modalTeamName}>{awayTeam ? awayTeam.replace(/ (?=[^ ]*$)/, '\n') : ''}</Text>
              </View>

              {hasScore ? (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{awayTeamScore}</Text>
                  <Text style={styles.scoreDivider}>-</Text>
                  <Text style={styles.scoreText}>{homeTeamScore}</Text>
                </View>
              ) : (
                <Text style={styles.modalVsText}>@</Text>
              )}

              <View style={styles.teamColumn}>
                {homeTeamLogo && <Image source={{ uri: homeTeamLogo }} style={styles.logo} resizeMode="contain" />}
                <Text style={styles.modalTeamName}>{homeTeam ? homeTeam.replace(/ (?=[^ ]*$)/, '\n') : ''}</Text>
              </View>
            </View>
            {!hasScore && (
              <>
                <Text style={styles.dateText}>
                  {startTimeUTC ? new Date(startTimeUTC).toLocaleDateString(undefined, dateOptions) : ''}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      generateICSFile(data);
                      onClose();
                    }}
                  >
                    <Icon
                      name="calendar-plus-o"
                      type="font-awesome"
                      size={20}
                      color="white"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.actionButtonText}>{translateWord('downloadICS')}</Text>
                  </TouchableOpacity>

                  {arenaName && (
                    <a
                      href={`https://maps.google.com/?q=${stadiumSearch}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <View style={styles.actionButton}>
                        <Icon
                          name="map-marker"
                          type="font-awesome"
                          size={20}
                          color="white"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.actionButtonText}>{translateWord('localizeArena')}</Text>
                      </View>
                    </a>
                  )}
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 500,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalTeamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalTeamFullName: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 5,
  },
  modalVsText: {
    fontSize: 24,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 5,
  },
  scoreDivider: {
    fontSize: 24,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateText: {
    color: 'white',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
