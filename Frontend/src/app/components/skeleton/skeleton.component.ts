import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-skeleton',
    template: `
    <div class="skeleton-wrapper" [ngStyle]="{'width': width, 'height': height}">
      <div class="skeleton" [class.circle]="type === 'circle'" [class.text]="type === 'text'"></div>
    </div>
  `,
    styles: [`
    .skeleton-wrapper {
      overflow: hidden;
    }
    .skeleton {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #16213e 25%, #1f3460 50%, #16213e 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .skeleton.circle {
      border-radius: 50%;
    }
    .skeleton.text {
      border-radius: 4px;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
    @Input() width = '100%';
    @Input() height = '20px';
    @Input() type: 'rect' | 'circle' | 'text' = 'rect';
}
