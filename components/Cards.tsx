import { League } from '@/constants/enum';
import { Card } from '@rneui/base';
import { Icon } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { CardsProps } from '../utils/types';
import { generateICSFile } from '../utils/utils';

const leagueLogos = {
  MLB: require('../assets/images/MLB.png'),
  NBA: require('../assets/images/NBA.png'),
  NFL: require('../assets/images/NFL.png'),
  NHL: require('../assets/images/NHL.png'),
  WNBA: require('../assets/images/WNBA.png'),
  DEFAULT: require('../assets/images/DEFAULT.png'),
};

export default function Cards({
  data,
  showDate = false,
  showButtons = false,
  onSelection = () => {},
  numberSelected = 0,
  selected = false,
}: Readonly<CardsProps>) {
  const {
    homeTeam,
    awayTeam,
    arenaName = '',
    homeTeamLogo,
    awayTeamLogo,
    teamSelectedId = '',
    startTimeUTC,
    placeName = '',
    color,
    backgroundColor,
    awayTeamShort,
    homeTeamShort,
  } = data;
  const league = teamSelectedId.split('-')[0] || 'DEFAULT';
  const show = typeof data.show === 'boolean' ? data.show : data.show === 'true';

  const [teamNameHome, setTeamNameHome] = useState(homeTeam);
  const [teamNameAway, setTeamNameAway] = useState(awayTeam);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [fontSize, setFontSize] = useState('1rem');

  useEffect(() => {
    const updateDeviceType = () => {
      const { width } = Dimensions.get('window');
      setTeamNameHome(homeTeam);
      setTeamNameAway(awayTeam);
      if (width <= 1075) {
        if (numberSelected > 2) {
          setTeamNameHome(homeTeamShort);
          setTeamNameAway(awayTeamShort);
        }
        setIsSmallDevice(true);
        setFontSize('0.75rem');
      } else {
        setIsSmallDevice(false);
        setFontSize('0.9rem');
      }
    };

    updateDeviceType();
    Dimensions.addEventListener('change', updateDeviceType);

    return () => {};
  }, []);

  const date = data?.gameDate ? new Date(data.gameDate) : new Date();
  let gameDate = new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: isSmallDevice ? '2-digit' : 'short',
  });
  if (startTimeUTC) {
    gameDate = showDate
      ? new Date(startTimeUTC).toLocaleString(undefined, {
          day: '2-digit',
          month: isSmallDevice ? '2-digit' : 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date(startTimeUTC).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  const defaultColors = Colors.default;
  const colors = Colors[teamSelectedId] ?? {};
  const defaultColor = color && backgroundColor ? { color, backgroundColor } : defaultColors;
  const teamColors = colors.backgroundColor && colors.backgroundColor !== '' ? colors : defaultColor;

  let cardClass = show
    ? {
        ...teamColors,
        fontSize,
      }
    : {
        fontSize,
        opacity: '0.97',

        backgroundColor: '#ffffee',
      };

  let selectedCard = selected
    ? {
        filter: 'brightness(1.25) saturate(1.5) contrast(1.05)',
        border: 'double' + teamColors?.color,
      }
    : {};

  const displayTitle = () => {
    if (arenaName && arenaName !== '') {
      return (
        <Card.Title style={{ ...cardClass }}>
          <button
            onClick={() => {
              if (showButtons) generateICSFile(data);
            }}
            style={{
              cursor: 'pointer',
              textDecoration: showButtons && !isSmallDevice ? 'underline' : 'none',
              color: showButtons && isSmallDevice ? teamColors.color : 'inherit',
              backgroundColor: showButtons && isSmallDevice ? teamColors.backgroundColor : 'inherit',
              border: 'none',
              font: 'inherit',
              padding: 0,
              margin: 0,
            }}
            aria-label="Generate ICS file"
          >
            {showButtons && (
              <Icon
                name="calendar"
                type="font-awesome"
                style={{ paddingRight: isSmallDevice ? 5 : 10 }}
                size={isSmallDevice ? 10 : 15}
                color={teamColors.color}
              />
            )}
            {gameDate}
          </button>
        </Card.Title>
      );
    }
    return <Card.Title style={{ fontSize }}>{gameDate}</Card.Title>;
  };

  const displayContent = () => {
    if (homeTeam && awayTeam) {
      const stadiumSearch = arenaName.replace(/\s+/g, '+') + ',' + placeName.replace(/\s+/g, '+');
      let shortArenaName = arenaName;
      if (numberSelected > 1) {
        shortArenaName =
          arenaName && numberSelected > 3 && arenaName.length > 5 ? arenaName.split(' ')[0] + ' ...' : arenaName || '';
        shortArenaName = isSmallDevice ? shortArenaName.split(' ').slice(0, -1).join(' ') : shortArenaName;
        shortArenaName =
          isSmallDevice && shortArenaName.length > 7 && numberSelected > 5
            ? shortArenaName.slice(0, 6) + ' ...'
            : shortArenaName;
      }
      return (
        <View>
          <button
            onClick={() => {
              if (showDate) {
                onSelection(data);
              }
            }}
            style={{
              cursor: show ? 'pointer' : 'not-allowed',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              height: 160,
              border: 'none',
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
            }}
          >
            <Image
              style={{
                width: '50%',
                height: 50,
                filter:
                  'drop-shadow(-1px 0 0 #101518) drop-shadow(0 -1px 0 #101518) drop-shadow(-0.1px 0 0 #101518) drop-shadow(0 0.1px 0 #101518)',
              }}
              resizeMode="contain"
              source={{
                uri: awayTeamLogo,
              }}
            />
            <Text style={{ ...cardClass, backgroundColor: 'transparent' }}>{teamNameAway}</Text>
            <Text style={{ ...cardClass, backgroundColor: 'transparent' }}>@</Text>
            <Text style={{ ...cardClass, backgroundColor: 'transparent' }}>{teamNameHome}</Text>
            <Image
              style={{
                width: '50%',
                height: 50,
                filter:
                  'drop-shadow(-1.5px 0 0 #101518) drop-shadow(0 -1px 0 #101518) drop-shadow(-0.1px 0 0 #101518) drop-shadow(0 0.1px 0 #101518)',
              }}
              resizeMode="contain"
              source={{
                uri: homeTeamLogo,
              }}
            />
            <br />
          </button>
          <Text
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              height: 20,
            }}
          >
            <a
              href={`https://maps.google.com/?q=${stadiumSearch}`}
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: cardClass.color,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                name="map-marker"
                type="font-awesome"
                size={isSmallDevice ? 10 : 12}
                style={{ marginRight: 0 }}
                color={cardClass.color}
              />
              <span
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  margin: 0,
                  padding: 0,
                }}
              >
                {arenaName ? shortArenaName : 'Stadium not found'}
              </span>
            </a>
          </Text>
        </View>
      );
    }
    return (
      <View
        style={{
          position: 'relative',
          alignItems: 'center',
        }}
      ></View>
    );
  };

  return (
    <div className={cardClass}>
      <Card
        onClick={() => {
          if (show && !showButtons) {
            onSelection(data);
          }
        }}
        containerStyle={{
          marginLeft: 0,
          marginRight: 0,
          ...selectedCard,
          ...cardClass,
          height: 270,
        }}
        wrapperStyle={cardClass}
      >
        {!!startTimeUTC && !showDate && (
          <Image
            source={leagueLogos[league as keyof typeof leagueLogos] || leagueLogos.DEFAULT}
            style={{
              height: 20,
              width: 40,
              resizeMode: 'contain',
              position: 'absolute',
              top: -10,
              left: -10,
              backgroundColor: league === League.WNBA ? '#F0F0F0' : 'transparent',
            }}
            accessibilityLabel={`${league} logo`}
          />
        )}
        <Card.Title
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: showDate ? '' : 'flex',
            whiteSpace: showDate ? '' : 'nowrap',
            alignItems: showDate ? '' : 'center',
            justifyContent: showDate ? '' : 'center',
          }}
        >
          {displayTitle()}
        </Card.Title>
        <Card.Divider style={{ backgroundColor: teamColors.color }} />
        {displayContent()}
      </Card>
    </div>
  );
}
