import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-exercise-video',
  template: `
    <div class="video-card" *ngIf="exerciseName">
      <div class="video-header" (click)="toggleVideo()">
        <mat-icon>{{ showVideo ? 'expand_less' : 'play_circle' }}</mat-icon>
        <span>{{ showVideo ? 'Hide Tutorial' : 'Watch Tutorial' }}</span>
      </div>
      
      <div class="video-container" *ngIf="showVideo && safeVideoUrl">
        <iframe 
          [src]="safeVideoUrl" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `,
  styles: [`
    .video-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 180, 216, 0.2);
      border-radius: 12px;
      overflow: hidden;
      margin-top: 10px;
    }

    .video-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      color: #00b4d8;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .video-header:hover {
      background: rgba(0, 180, 216, 0.1);
    }

    .video-header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .video-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
    }

    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ExerciseVideoComponent {
  @Input() exerciseName: string = '';
  showVideo = false;
  safeVideoUrl: SafeResourceUrl | null = null;

  // Map exercise names to YouTube video IDs
  private videoMap: { [key: string]: string } = {
    'push-ups': 'IODxDxX7oi4',
    'pushups': 'IODxDxX7oi4',
    'squats': 'aclHkVaku9U',
    'squat': 'aclHkVaku9U',
    'deadlift': 'op9kVnSso6Q',
    'deadlifts': 'op9kVnSso6Q',
    'bench press': 'rT7DgCr-3pg',
    'plank': 'pSHjTRCQxIw',
    'lunges': 'QOVaHwm-Q6U',
    'lunge': 'QOVaHwm-Q6U',
    'burpees': 'TU8QYVW0gDU',
    'burpee': 'TU8QYVW0gDU',
    'pull-ups': 'eGo4IYlbE5g',
    'pullups': 'eGo4IYlbE5g',
    'crunches': '5ER5Of4MOPI',
    'crunch': '5ER5Of4MOPI',
    'jumping jacks': 'c4DAnQ6DtF8',
    'mountain climbers': 'nmwgirgXLYM',
    'bicep curls': 'ykJmrZ5v0Oo',
    'tricep dips': '6kALZikXxLc',
    'leg raises': 'l4kQd9eWclE',
    'russian twists': 'wkD8rjkodUI',
    'default': 'ml6cT4AZdqI' // General workout video
  };

  constructor(private sanitizer: DomSanitizer) { }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
    if (this.showVideo) {
      this.updateSafeUrl();
    }
  }

  private updateSafeUrl(): void {
    const url = this.getVideoUrl();
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private getVideoUrl(): string {
    const searchKey = this.exerciseName.toLowerCase();
    let videoId = this.videoMap['default'];

    // Find matching video
    for (const key of Object.keys(this.videoMap)) {
      if (searchKey.includes(key)) {
        videoId = this.videoMap[key];
        break;
      }
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
}
