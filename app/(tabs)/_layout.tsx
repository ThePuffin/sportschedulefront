import { translateWord } from '@/utils/utils';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, PanResponder, Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Icon from 'react-native-vector-icons/FontAwesome';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const isWebDesktop = Platform.OS === 'web' && Dimensions.get('window').width > 768;
        if (isWebDesktop) return false;
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const tabs = ['/', '/schedule', '/calendar'];
        const currentPath = pathname === '/index' ? '/' : pathname;
        const currentIndex = tabs.indexOf(currentPath);

        if (currentIndex === -1) return;

        if (gestureState.dx < -50) {
          // Swipe Left -> Next Tab
          const nextIndex = (currentIndex + 1) % tabs.length;
          router.push(tabs[nextIndex]);
        } else if (gestureState.dx > 50) {
          // Swipe Right -> Previous Tab
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          router.push(tabs[prevIndex]);
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: translateWord('gamesOfDay'),
            tabBarIcon: ({ color }) => <Icon size={28} name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: translateWord('remainingGames'),
            tabBarIcon: ({ color }) => <Icon size={28} name="table" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: translateWord('calendars'),
            tabBarIcon: ({ color }) => <Icon size={28} name="calendar" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
