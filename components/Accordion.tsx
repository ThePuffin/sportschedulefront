import NoResults from '@/components/NoResults';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ListItem } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import CardLarge from './CardLarge';

import { translateWord } from '@/utils/utils';
import type { AccordionProps } from '../utils/types';

export default function Accordion({
  i = 0,
  filter = '',
  gamesFiltred = [],
  open = false,
  isCounted = false,
  showDate = false,
  disableToggle = false,
  onRetry,
}: Readonly<AccordionProps & { onRetry?: () => void }>) {
  const [expanded, setExpanded] = useState(disableToggle ? true : (open ?? i === 0));
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 768;
  const badgeBackgroundColor = 'rgba(120, 120, 120, 0.1)';
  const badgeTextColor = useThemeColor({ light: '#404040', dark: '#8E8E93' }, 'text');
  const titleColor = useThemeColor({ light: '#48484A', dark: '#8E8E93' }, 'text');
  const borderColor = useThemeColor({ light: '#D1D1D6', dark: '#38383A' }, 'text');

  useEffect(() => {
    setExpanded(disableToggle ? true : (open ?? i === 0));
  }, [open, disableToggle, i]);

  const makeCards = () => {
    if (!gamesFiltred?.length) return <NoResults onRetry={onRetry} />;

    return gamesFiltred.map((game) => (
      <div key={`${game.homeTeamId}-${game.startTimeUTC}`} style={{ width: isSmallDevice ? '100%' : 'auto' }}>
        <CardLarge data={game} numberSelected={1} showDate={showDate} showButtons={true} />
      </div>
    ));
  };

  return (
    <ListItem.Accordion
      content={
        <ListItem.Content
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            marginHorizontal: 10,
          }}
        >
          <ListItem.Title
            style={{
              color: titleColor,
              fontSize: 13,
              fontWeight: '500',
            }}
          >
            {filter}
          </ListItem.Title>

          <div
            style={{
              backgroundColor: badgeBackgroundColor,
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            <span
              style={{
                color: badgeTextColor,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.5,
              }}
            >
              {(gamesFiltred || []).length} {translateWord('events').toUpperCase()}
            </span>
          </div>
        </ListItem.Content>
      }
      isExpanded={expanded}
      noIcon={disableToggle}
      onPress={disableToggle ? undefined : () => setExpanded(!expanded)}
      containerStyle={{
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        paddingTop: 20, // Espace au dessus de la ligne
      }}
      underlayColor="transparent"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 10px',
        }}
      >
        {makeCards()}
      </div>
    </ListItem.Accordion>
  );
}
