import { FilterGames, Team } from '@/utils/types';

const EXPO_PUBLIC_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://sportschedule2025backend.onrender.com';

export const fetchLeagues = async (setLeaguesAvailable: (leagues: string[]) => void) => {
  try {
    const response = await fetch(`${EXPO_PUBLIC_API_BASE_URL}/teams/leagues`);
    const leagues = (await response.json()) as string[];
    setLeaguesAvailable(leagues);
    localStorage.setItem('leagues', JSON.stringify(leagues));
    return leagues;
  } catch (error: unknown) {
    console.error('Error fetching leagues:', error);
    return [];
  }
};

export const fetchTeams = async () => {
  try {
    const response = await fetch(`${EXPO_PUBLIC_API_BASE_URL}/teams`);
    return (await response.json()) as Team[];
  } catch (error: unknown) {
    console.error('Error fetching leagues:', error);
    return [];
  }
};

export const fetchRemainingGamesByTeam = async (teamSelected: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${EXPO_PUBLIC_API_BASE_URL}/games/team/${teamSelected}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return (await response.json()) || {};
  } catch (error) {
    console.error('Error fetching remaining games by team:', error);
    return {};
  }
};

export const fetchRemainingGamesByLeague = async (league: string, limit?: number) => {
  try {
    let url = `${EXPO_PUBLIC_API_BASE_URL}/games/league/${league}`;
    if (limit) {
      url += `?maxResults=${limit}`;
    }
    const response = await fetch(url);
    const data = (await response.json()) as FilterGames;
    localStorage.setItem('scheduleData', JSON.stringify(data));
    return data;
  } catch (error: unknown) {
    console.error('Error fetching remaining games by league:', error);
    return {};
  }
};

export const smallFetchRemainingGamesByLeague = async (league: string) => {
  fetchRemainingGamesByLeague(league, 50);
};
