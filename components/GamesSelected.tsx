import { ThemedView } from '@/components/ThemedView';
import { useWindowDimensions } from 'react-native';
import { GameFormatted, GamesSelectedProps } from '../utils/types';
import CardLarge from './CardLarge';

export default function GamesSelected({ data = [], onAction, teamNumber = 1 }: Readonly<GamesSelectedProps>) {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 768;

  let cardWidth = '100%';
  if (!isSmallDevice) {
    cardWidth = teamNumber === 1 ? '33%' : `${100 / teamNumber}%`;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: !isSmallDevice && teamNumber === 1 ? 'center' : 'flex-start',
      }}
    >
      {data.map((gameSelected: GameFormatted) => {
        return (
          <div key={gameSelected._id} style={{ width: cardWidth, padding: 5, boxSizing: 'border-box' }}>
            <ThemedView>
              <CardLarge data={gameSelected} showDate={true} onSelection={() => onAction(gameSelected)} />
            </ThemedView>
          </div>
        );
      })}
    </div>
  );
}
