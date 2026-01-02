import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { VoiceCommandService } from '../../services/voice-command.service';
import { AIService } from '../../services/ai.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Track {
  name: string;
  artist: string;
  youtubeId: string;
  bpm: number;
  type: 'warm-up' | 'intense' | 'cool-down';
}

@Component({
  selector: 'app-workout-music',
  template: `
    <div class="music-card" [class.playing]="isPlaying" [class.listening]="isListening">
      <div class="music-header">
        <span class="music-icon">🎵</span>
        <span class="music-title">Workout Music</span>
        
        <!-- Voice Control Button -->
        <button 
          class="voice-btn" 
          [class.active]="isListening"
          (click)="toggleVoiceControl()"
          [matTooltip]="isListening ? 'Voice control ON - Say a command' : 'Enable voice control'">
          <mat-icon>{{ isListening ? 'mic' : 'mic_off' }}</mat-icon>
        </button>
        
        <button class="toggle-btn" (click)="togglePlayer()">
          <mat-icon>{{ showPlayer ? 'expand_less' : 'expand_more' }}</mat-icon>
        </button>
      </div>

      <!-- Voice Listening Indicator -->
      <div class="voice-indicator" *ngIf="isListening">
        <div class="pulse-ring"></div>
        <span>🎤 Listening... Say "play", "pause", "next", or "stop"</span>
      </div>

      <div class="music-content" *ngIf="showPlayer">
        <!-- AI Playlist Button -->
        <div class="ai-playlist-section">
          <button 
            class="ai-playlist-btn" 
            (click)="getAIPlaylist()"
            [disabled]="loadingPlaylist">
            <mat-icon>{{ loadingPlaylist ? 'hourglass_empty' : 'auto_awesome' }}</mat-icon>
            {{ loadingPlaylist ? 'Generating...' : 'Get AI Playlist' }}
          </button>
          <select [(ngModel)]="selectedMood" class="mood-select">
            <option value="energetic">🔥 Energetic</option>
            <option value="focused">🎯 Focused</option>
            <option value="relaxed">😌 Relaxed</option>
            <option value="pumped">💪 Pumped Up</option>
          </select>
        </div>

        <!-- Intensity Selector -->
        <div class="intensity-tabs">
          <button 
            *ngFor="let type of trackTypes" 
            class="intensity-tab"
            [class.active]="selectedType === type"
            (click)="selectType(type)">
            {{ type | titlecase }}
          </button>
        </div>

        <!-- Track List -->
        <div class="track-list">
          <div 
            *ngFor="let track of filteredTracks; let i = index" 
            class="track-item"
            [class.active]="currentTrack === track"
            (click)="playTrack(track)">
            <div class="track-info">
              <span class="track-name">{{ track.name }}</span>
              <span class="track-artist">{{ track.artist }}</span>
            </div>
            <div class="track-meta">
              <span class="bpm">{{ track.bpm }} BPM</span>
              <mat-icon *ngIf="currentTrack === track && isPlaying">equalizer</mat-icon>
            </div>
          </div>
        </div>

        <!-- YouTube Player (Hidden) -->
        <div class="player-container" *ngIf="currentTrack && safePlayerUrl">
          <iframe 
            #playerFrame
            [src]="safePlayerUrl" 
            frameborder="0" 
            allow="autoplay; encrypted-media" 
            allowfullscreen>
          </iframe>
        </div>

        <!-- Now Playing Bar -->
        <div class="now-playing" *ngIf="currentTrack">
          <div class="now-playing-info">
            <span class="now-playing-icon">🔊</span>
            <div class="now-playing-text">
              <span class="np-track">{{ currentTrack.name }}</span>
              <span class="np-artist">{{ currentTrack.artist }}</span>
            </div>
          </div>
          <div class="player-controls">
            <button class="control-btn" (click)="previousTrack()">
              <mat-icon>skip_previous</mat-icon>
            </button>
            <button class="control-btn play-pause" (click)="togglePlayPause()">
              <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button class="control-btn" (click)="nextTrack()">
              <mat-icon>skip_next</mat-icon>
            </button>
            <button class="stop-btn" (click)="stopMusic()">
              <mat-icon>stop</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .music-card {
      background: linear-gradient(145deg, rgba(0, 180, 216, 0.1), rgba(0, 100, 150, 0.15));
      border: 1px solid rgba(0, 180, 216, 0.25);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .music-card.playing {
      border-color: rgba(57, 255, 20, 0.5);
      box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
    }

    .music-card.listening {
      border-color: rgba(255, 107, 53, 0.6);
      box-shadow: 0 0 25px rgba(255, 107, 53, 0.3);
    }

    .music-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .music-icon { font-size: 24px; }

    .music-title {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .voice-btn {
      background: rgba(255, 107, 53, 0.2);
      border: 1px solid rgba(255, 107, 53, 0.4);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ff6b35;
      transition: all 0.2s ease;
    }

    .voice-btn:hover {
      background: rgba(255, 107, 53, 0.3);
    }

    .voice-btn.active {
      background: rgba(255, 107, 53, 0.4);
      animation: pulse-mic 1.5s ease-in-out infinite;
    }

    @keyframes pulse-mic {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
      50% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
    }

    .voice-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: rgba(255, 107, 53, 0.15);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 10px;
      margin: 10px 0;
      color: #ff6b35;
      font-size: 13px;
    }

    .pulse-ring {
      width: 12px;
      height: 12px;
      background: #ff6b35;
      border-radius: 50%;
      animation: pulse-ring 1s ease-in-out infinite;
    }

    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
    }

    .music-content { margin-top: 15px; }

    .ai-playlist-section {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .ai-playlist-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(255, 165, 0, 0.3));
      border: 1px solid rgba(255, 107, 53, 0.5);
      border-radius: 10px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ai-playlist-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.5), rgba(255, 165, 0, 0.5));
      transform: translateY(-2px);
    }

    .ai-playlist-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mood-select {
      padding: 10px 15px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }

    .intensity-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
    }

    .intensity-tab {
      flex: 1;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid transparent;
      border-radius: 8px;
      color: #6b7a8f;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .intensity-tab.active {
      background: rgba(0, 180, 216, 0.2);
      border-color: rgba(0, 180, 216, 0.5);
      color: #00b4d8;
    }

    .track-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .track-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .track-item:hover { background: rgba(0, 180, 216, 0.15); }

    .track-item.active {
      background: rgba(57, 255, 20, 0.15);
      border: 1px solid rgba(57, 255, 20, 0.3);
    }

    .track-info { display: flex; flex-direction: column; }
    .track-name { font-size: 14px; font-weight: 600; color: #fff; }
    .track-artist { font-size: 11px; color: #6b7a8f; }

    .track-meta { display: flex; align-items: center; gap: 8px; }

    .bpm {
      font-size: 11px;
      color: #00b4d8;
      background: rgba(0, 180, 216, 0.2);
      padding: 3px 8px;
      border-radius: 10px;
    }

    .track-meta mat-icon {
      color: #39ff14;
      font-size: 18px;
      animation: pulse 0.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .player-container {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
    }

    .player-container iframe { width: 1px; height: 1px; }

    .now-playing {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(57, 255, 20, 0.1);
      border: 1px solid rgba(57, 255, 20, 0.3);
      border-radius: 10px;
      padding: 12px;
      margin-top: 15px;
    }

    .now-playing-info { display: flex; align-items: center; gap: 10px; }
    .now-playing-icon { font-size: 20px; }
    .now-playing-text { display: flex; flex-direction: column; }
    .np-track { font-size: 13px; font-weight: 600; color: #39ff14; }
    .np-artist { font-size: 11px; color: #6b7a8f; }

    .player-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      transition: all 0.2s ease;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .control-btn.play-pause {
      width: 40px;
      height: 40px;
      background: rgba(57, 255, 20, 0.3);
      color: #39ff14;
    }

    .stop-btn {
      background: rgba(239, 35, 60, 0.2);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ef233c;
    }
  `]
})
export class WorkoutMusicComponent implements OnInit, OnDestroy {
  @ViewChild('playerFrame') playerFrame!: ElementRef;

  showPlayer = true;
  isPlaying = false;
  isListening = false;
  loadingPlaylist = false;
  currentTrack: Track | null = null;
  currentTrackIndex = 0;
  selectedType: 'warm-up' | 'intense' | 'cool-down' = 'intense';
  selectedMood = 'energetic';
  trackTypes: ('warm-up' | 'intense' | 'cool-down')[] = ['warm-up', 'intense', 'cool-down'];
  safePlayerUrl: SafeResourceUrl | null = null;

  private voiceSubscription: Subscription | null = null;
  private listeningSubscription: Subscription | null = null;

  tracks: Track[] = [
    { name: 'Eye of the Tiger', artist: 'Survivor', youtubeId: 'btPJPFnesV4', bpm: 109, type: 'intense' },
    { name: 'Stronger', artist: 'Kanye West', youtubeId: 'PsO6ZnUZI0g', bpm: 104, type: 'intense' },
    { name: 'Lose Yourself', artist: 'Eminem', youtubeId: '_Yhyp-_hX2s', bpm: 86, type: 'intense' },
    { name: 'Till I Collapse', artist: 'Eminem', youtubeId: 'ytQ5CYE1VZw', bpm: 171, type: 'intense' },
    { name: 'Pump It', artist: 'Black Eyed Peas', youtubeId: 'ZaI2IlHwmgQ', bpm: 154, type: 'intense' },
    { name: 'Warm Up Beats', artist: 'Various', youtubeId: 'dRQf6s-i_Cw', bpm: 100, type: 'warm-up' },
    { name: 'Stretch & Recover', artist: 'Chill Mix', youtubeId: 'lTRiuFIWV54', bpm: 70, type: 'cool-down' },
    { name: 'Power', artist: 'Kanye West', youtubeId: 'L53gjP-TtGE', bpm: 76, type: 'intense' }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private voiceService: VoiceCommandService,
    private aiService: AIService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Subscribe to simple voice commands
    this.voiceSubscription = this.voiceService.onCommand.subscribe(cmd => {
      this.handleVoiceCommand(cmd.command);
    });

    // Subscribe to raw transcripts for AI processing
    this.voiceService.onRawTranscript.subscribe(transcript => {
      this.processWithAI(transcript);
    });

    this.listeningSubscription = this.voiceService.onListeningChange.subscribe(listening => {
      this.isListening = listening;
    });
  }

  ngOnDestroy(): void {
    this.voiceSubscription?.unsubscribe();
    this.listeningSubscription?.unsubscribe();
    this.voiceService.stopListening();
  }

  processWithAI(transcript: string): void {
    this.snackBar.open(`🤖 Processing: "${transcript}"...`, '', { duration: 2000, panelClass: ['dbz-snackbar'] });

    this.aiService.parseVoiceIntent(transcript, this.tracks).subscribe({
      next: (response) => {
        this.handleAIIntent(response, transcript);
      },
      error: (err) => {
        console.error('AI Intent Error:', err);
        this.snackBar.open('❌ Could not understand command', 'Close', { duration: 2000, panelClass: ['dbz-snackbar'] });
      }
    });
  }

  handleAIIntent(response: any, originalTranscript: string): void {
    console.log('AI Intent Response:', response);

    switch (response.intent) {
      case 'play_song':
        // Try to find song in current playlist
        const songName = response.params?.songName?.toLowerCase() || '';
        const foundTrack = this.tracks.find(t =>
          t.name.toLowerCase().includes(songName) ||
          songName.includes(t.name.toLowerCase())
        );

        if (foundTrack) {
          this.playTrack(foundTrack);
          this.snackBar.open(`🎵 Playing "${foundTrack.name}"`, '', { duration: 2000, panelClass: ['dbz-snackbar'] });
        } else {
          // Song not in playlist - generate playlist with that song
          this.snackBar.open(`🔍 Searching for "${response.params?.songName}"...`, '', { duration: 2000, panelClass: ['dbz-snackbar'] });
          this.generatePlaylistForRequest(response.params?.songName, response.params?.artist);
        }
        break;

      case 'language_playlist':
        const language = response.params?.language || 'English';
        this.snackBar.open(`🌍 Generating ${language} workout playlist...`, '', { duration: 2000 });
        this.generateLanguagePlaylist(language);
        break;

      case 'genre_playlist':
        const genre = response.params?.genre || 'pop';
        this.snackBar.open(`🎸 Generating ${genre} playlist...`, '', { duration: 2000 });
        this.generateGenrePlaylist(genre);
        break;

      case 'mood_playlist':
        const mood = response.params?.mood || 'energetic';
        this.selectedMood = mood;
        this.snackBar.open(`💫 Generating ${mood} playlist...`, '', { duration: 2000 });
        this.getAIPlaylist();
        break;

      case 'artist_playlist':
        const artist = response.params?.artist || '';
        this.snackBar.open(`🎤 Generating ${artist} playlist...`, '', { duration: 2000 });
        this.generateArtistPlaylist(artist);
        break;

      case 'simple_command':
        if (response.action === 'play') {
          this.handleVoiceCommand('play');
        }
        break;

      case 'unknown':
      default:
        this.snackBar.open(`❓ ${response.params?.message || 'Try saying "play hindi songs" or "play eye of the tiger"'}`, 'Close', { duration: 3000 });
    }
  }

  generatePlaylistForRequest(songName: string, artist?: string): void {
    const query = artist ? `${songName} by ${artist}` : songName;
    this.aiService.getPlaylistRecommendation('workout', query, 'medium').subscribe({
      next: (res) => {
        if (res.playlist && res.playlist.length > 0) {
          this.tracks = res.playlist;
          this.playTrack(this.tracks[0]);
          this.snackBar.open(`🎵 Now playing playlist with "${songName}"`, '', { duration: 2000 });
        }
      },
      error: () => this.snackBar.open('Failed to find song', 'Close', { duration: 2000 })
    });
  }

  generateLanguagePlaylist(language: string): void {
    this.loadingPlaylist = true;
    this.aiService.getPlaylistRecommendation(`${language} workout songs`, 'energetic', 'medium').subscribe({
      next: (res) => {
        if (res.playlist && res.playlist.length > 0) {
          this.tracks = res.playlist;
          this.playTrack(this.tracks[0]);
          this.snackBar.open(`🎵 ${language} playlist ready!`, '', { duration: 2000 });
        }
        this.loadingPlaylist = false;
      },
      error: () => {
        this.snackBar.open('Failed to generate playlist', 'Close', { duration: 2000 });
        this.loadingPlaylist = false;
      }
    });
  }

  generateGenrePlaylist(genre: string): void {
    this.loadingPlaylist = true;
    this.aiService.getPlaylistRecommendation(`${genre} workout music`, 'energetic', 'medium').subscribe({
      next: (res) => {
        if (res.playlist && res.playlist.length > 0) {
          this.tracks = res.playlist;
          this.playTrack(this.tracks[0]);
          this.snackBar.open(`🎵 ${genre} playlist ready!`, '', { duration: 2000 });
        }
        this.loadingPlaylist = false;
      },
      error: () => {
        this.snackBar.open('Failed to generate playlist', 'Close', { duration: 2000 });
        this.loadingPlaylist = false;
      }
    });
  }

  generateArtistPlaylist(artist: string): void {
    this.loadingPlaylist = true;
    this.aiService.getPlaylistRecommendation(`${artist} best songs workout`, 'energetic', 'medium').subscribe({
      next: (res) => {
        if (res.playlist && res.playlist.length > 0) {
          this.tracks = res.playlist;
          this.playTrack(this.tracks[0]);
          this.snackBar.open(`🎵 ${artist} playlist ready!`, '', { duration: 2000 });
        }
        this.loadingPlaylist = false;
      },
      error: () => {
        this.snackBar.open('Failed to generate playlist', 'Close', { duration: 2000 });
        this.loadingPlaylist = false;
      }
    });
  }

  handleVoiceCommand(command: string): void {
    console.log('Voice command received:', command);

    switch (command) {
      case 'play':
        if (this.currentTrack) {
          this.isPlaying = true;
          this.snackBar.open('▶️ Playing music', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        } else if (this.filteredTracks.length > 0) {
          this.playTrack(this.filteredTracks[0]);
        }
        break;
      case 'pause':
        this.isPlaying = false;
        this.snackBar.open('⏸️ Music paused', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        break;
      case 'stop':
        this.stopMusic();
        this.snackBar.open('⏹️ Music stopped', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        break;
      case 'next':
        this.nextTrack();
        this.snackBar.open('⏭️ Next track', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        break;
      case 'previous':
        this.previousTrack();
        this.snackBar.open('⏮️ Previous track', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        break;
      case 'shuffle':
        this.shuffleTracks();
        this.snackBar.open('🔀 Playlist shuffled', '', { duration: 1500, panelClass: ['dbz-snackbar'] });
        break;
      case 'ai_playlist':
        this.getAIPlaylist();
        break;
    }
  }

  toggleVoiceControl(): void {
    if (!this.voiceService.isSupported()) {
      this.snackBar.open('Voice control not supported in this browser. Try Chrome or Edge.', 'Close', { duration: 4000 });
      return;
    }
    this.voiceService.toggleListening();
  }

  getAIPlaylist(): void {
    this.loadingPlaylist = true;
    this.snackBar.open('🤖 AI is generating your playlist...', '', { duration: 2000 });

    this.aiService.getPlaylistRecommendation('workout', this.selectedMood, 'medium').subscribe({
      next: (res) => {
        if (res.playlist && res.playlist.length > 0) {
          this.tracks = res.playlist;
          this.snackBar.open('🎵 AI playlist ready! ' + res.playlist.length + ' tracks loaded', '', { duration: 3000 });
        }
        this.loadingPlaylist = false;
      },
      error: (err) => {
        console.error('Playlist error:', err);
        this.snackBar.open('Failed to generate playlist. Using default tracks.', 'Close', { duration: 3000 });
        this.loadingPlaylist = false;
      }
    });
  }

  shuffleTracks(): void {
    const shuffled = [...this.tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.tracks = shuffled;
  }

  get filteredTracks(): Track[] {
    return this.tracks.filter(t => t.type === this.selectedType);
  }

  selectType(type: 'warm-up' | 'intense' | 'cool-down'): void {
    this.selectedType = type;
  }

  togglePlayer(): void {
    this.showPlayer = !this.showPlayer;
  }

  playTrack(track: Track): void {
    this.currentTrack = track;
    this.currentTrackIndex = this.filteredTracks.indexOf(track);
    this.isPlaying = true;

    // Construct URL with autoplay and enablejsapi for better control
    const videoId = track.youtubeId;
    const url = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;

    // Cache the sanitized URL
    this.safePlayerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log(`🎵 Playing: ${track.name} (${videoId})`);
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;

    if (this.playerFrame && this.playerFrame.nativeElement.contentWindow) {
      const command = this.isPlaying ? 'playVideo' : 'pauseVideo';
      this.playerFrame.nativeElement.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: []
      }), '*');
    }
  }

  nextTrack(): void {
    const tracks = this.filteredTracks;
    if (tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    this.playTrack(tracks[this.currentTrackIndex]);
  }

  previousTrack(): void {
    const tracks = this.filteredTracks;
    if (tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + tracks.length) % tracks.length;
    this.playTrack(tracks[this.currentTrackIndex]);
  }

  stopMusic(): void {
    this.currentTrack = null;
    this.safePlayerUrl = null;
    this.isPlaying = false;
  }

  getPlayerUrl(): SafeResourceUrl {
    if (!this.currentTrack) return '';
    const url = `https://www.youtube.com/embed/${this.currentTrack.youtubeId}?autoplay=1&loop=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
