import { SearchFilters, SearchResponse, DURATION_BANDS, VideoResult } from '@/types/search';
import { getCachedResults, setCachedResults } from './cache';

export async function searchVideos(filters: SearchFilters): Promise<SearchResponse> {
  // Check cache first
  const cached = getCachedResults(filters);
  if (cached) {
    return { results: cached, total: cached.length };
  }

  // Get results (using mock data since there's no backend)
  const response = getMockResults(filters);

  // Cache the results
  setCachedResults(filters, response.results);

  return response;
}

function getMockResults(filters: SearchFilters): SearchResponse {
  const mockVideos: VideoResult[] = [
    {
      id: '1',
      title: 'The Art of Living in the Present Moment',
      description: 'A profound exploration of mindfulness and presence in daily life.',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
      duration: 25,
      source: 'youtube',
      publishedYear: 2023,
      language: 'english',
      url: '#',
    },
    {
      id: '2',
      title: 'Inner Peace Through Meditation',
      description: 'Discover techniques for achieving lasting inner tranquility.',
      thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=225&fit=crop',
      duration: 45,
      source: 'timelesstoday',
      publishedYear: 2022,
      language: 'english',
      url: '#',
    },
    {
      id: '3',
      title: 'ध्यान का मार्ग - Meditation Path',
      description: 'A guided journey through traditional meditation practices.',
      thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=225&fit=crop',
      duration: 35,
      source: 'youtube',
      publishedYear: 2024,
      language: 'hindi',
      url: '#',
    },
    {
      id: '4',
      title: 'Understanding Consciousness',
      description: 'Deep insights into the nature of awareness and being.',
      thumbnail: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=225&fit=crop',
      duration: 55,
      source: 'timelesstoday',
      publishedYear: 2023,
      language: 'english',
      url: '#',
    },
    {
      id: '5',
      title: 'शांति की खोज - Finding Serenity',
      description: 'A beautiful discourse on discovering inner peace.',
      thumbnail: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=400&h=225&fit=crop',
      duration: 18,
      source: 'youtube',
      publishedYear: 2021,
      language: 'hindi',
      url: '#',
    },
    {
      id: '6',
      title: 'The Wisdom of Stillness',
      description: 'Learning to embrace silence and its transformative power.',
      thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=225&fit=crop',
      duration: 72,
      source: 'timelesstoday',
      publishedYear: 2024,
      language: 'english',
      url: '#',
    },
  ];

  let filtered = [...mockVideos];

  if (filters.language) {
    filtered = filtered.filter(v => v.language === filters.language);
  }

  if (filters.source) {
    filtered = filtered.filter(v => v.source === filters.source);
  }

  if (filters.year) {
    filtered = filtered.filter(v => v.publishedYear === parseInt(filters.year));
  }

  if (filters.durationBand) {
    const band = DURATION_BANDS.find(b => b.label === filters.durationBand);
    if (band) {
      filtered = filtered.filter(v => {
        if (band.min !== undefined && v.duration < band.min) return false;
        if (band.max !== undefined && v.duration >= band.max) return false;
        return true;
      });
    }
  }

  return {
    results: filtered,
    total: filtered.length,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
