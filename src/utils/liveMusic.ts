// Live Music Service for ClockDock
// Supports:
// 1. Live Spotify Connect polling (reads the real track currently playing on the phone via Spotify API)
// 2. Instant live track lookup (searches any song playing on the phone and fetches real artwork & metadata)

export interface LiveTrack {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  source: 'spotify' | 'apple' | 'manual';
}

class LiveMusicService {
  private spotifyToken: string | null = null;
  private pollInterval: number | null = null;
  private listeners: Set<(track: LiveTrack) => void> = new Set();

  private currentTrack: LiveTrack = {
    title: 'Birds',
    artist: 'Imagine Dragons',
    album: 'Origins (Deluxe)',
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/b3/a409b307-e854-c81e-1f7c-f8319e782d49/18UMGIM76332.rgb.jpg/600x600bb.jpg',
    durationMs: 219000,
    progressMs: 86000,
    isPlaying: true,
    source: 'spotify',
  };

  constructor() {
    // Load cached track or token from localStorage
    const saved = localStorage.getItem('clockdock_live_track');
    if (saved) {
      try {
        this.currentTrack = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const token = localStorage.getItem('clockdock_spotify_token');
    if (token) {
      this.spotifyToken = token;
      this.startSpotifyPolling();
    }
  }

  getCurrentTrack(): LiveTrack {
    return this.currentTrack;
  }

  setTrack(track: Partial<LiveTrack>) {
    this.currentTrack = { ...this.currentTrack, ...track };
    localStorage.setItem('clockdock_live_track', JSON.stringify(this.currentTrack));
    this.notify();
  }

  subscribe(cb: (track: LiveTrack) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentTrack);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentTrack);
      } catch {
        // ignore
      }
    });
  }

  // Live Track Search (iTunes catalog - instant high-res artwork & duration)
  async searchAndSetLiveTrack(query: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const highResCover = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', '600x600bb')
          : this.currentTrack.coverUrl;

        this.setTrack({
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Single',
          coverUrl: highResCover,
          durationMs: item.trackTimeMillis || 210000,
          progressMs: 0,
          isPlaying: true,
          source: 'apple',
        });
        return true;
      }
    } catch (e) {
      console.warn('Track search failed:', e);
    }
    return false;
  }

  // Set Spotify OAuth Token & Start Polling real-time phone playback
  setSpotifyToken(token: string) {
    this.spotifyToken = token.trim();
    localStorage.setItem('clockdock_spotify_token', this.spotifyToken);
    this.startSpotifyPolling();
  }

  disconnectSpotify() {
    this.spotifyToken = null;
    localStorage.removeItem('clockdock_spotify_token');
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  isSpotifyConnected(): boolean {
    return !!this.spotifyToken;
  }

  private startSpotifyPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    const fetchNowPlaying = async () => {
      if (!this.spotifyToken) return;

      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${this.spotifyToken}`,
          },
        });

        if (res.status === 204 || res.status > 400) {
          // No track playing or expired token
          return;
        }

        const data = await res.json();
        if (data && data.item) {
          this.setTrack({
            title: data.item.name,
            artist: data.item.artists?.map((a: { name: string }) => a.name).join(', ') || 'Unknown Artist',
            album: data.item.album?.name || '',
            coverUrl: data.item.album?.images?.[0]?.url || this.currentTrack.coverUrl,
            durationMs: data.item.duration_ms || 200000,
            progressMs: data.progress_ms || 0,
            isPlaying: data.is_playing,
            source: 'spotify',
          });
        }
      } catch (e) {
        console.warn('Spotify poll error:', e);
      }
    };

    fetchNowPlaying();
    this.pollInterval = window.setInterval(fetchNowPlaying, 3000);
  }
}

export const liveMusicService = new LiveMusicService();
