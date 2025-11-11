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
