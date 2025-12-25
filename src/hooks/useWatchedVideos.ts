import { useState, useCallback, useEffect } from 'react';

const WATCHED_VIDEOS_KEY = 'watchedVideos';
const SHOW_WATCHED_KEY = 'showWatchedVideos';

export function useWatchedVideos() {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(WATCHED_VIDEOS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [showWatched, setShowWatched] = useState<boolean>(() => {
    const stored = localStorage.getItem(SHOW_WATCHED_KEY);
    return stored ? JSON.parse(stored) : false;
  });

  // Sync watchedIds to localStorage
  useEffect(() => {
    localStorage.setItem(WATCHED_VIDEOS_KEY, JSON.stringify([...watchedIds]));
  }, [watchedIds]);

  // Sync showWatched to localStorage
  useEffect(() => {
    localStorage.setItem(SHOW_WATCHED_KEY, JSON.stringify(showWatched));
  }, [showWatched]);

  const markAsWatched = useCallback((videoId: string) => {
    setWatchedIds((prev) => new Set([...prev, videoId]));
  }, []);

  const unmarkAsWatched = useCallback((videoId: string) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      next.delete(videoId);
      return next;
    });
  }, []);

  const isWatched = useCallback((videoId: string) => {
    return watchedIds.has(videoId);
  }, [watchedIds]);

  const toggleShowWatched = useCallback(() => {
    setShowWatched((prev) => !prev);
  }, []);

  const watchedCount = watchedIds.size;

  return {
    watchedIds,
    showWatched,
    watchedCount,
    markAsWatched,
    unmarkAsWatched,
    isWatched,
    toggleShowWatched,
    setShowWatched,
  };
}
