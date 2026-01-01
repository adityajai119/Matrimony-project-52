import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-food-analysis',
  template: `
    <div class="analysis-card">
      <div class="card-header">
        <mat-icon class="camera-icon">photo_camera</mat-icon>
        <span class="card-title">AI Food Scanner</span>
      </div>

      <!-- Upload/Camera Section with Drag & Drop -->
      <div class="upload-section" *ngIf="!analyzing && !result"
           (drop)="onDrop($event)"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           [class.drag-over]="isDragOver">
        <div class="image-preview" *ngIf="previewUrl">
          <img [src]="previewUrl" alt="Food Preview">
          <button mat-mini-fab color="warn" class="remove-btn" (click)="clearImage()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="upload-controls" *ngIf="!previewUrl">
          <div class="drop-zone" (click)="fileInput.click()">
            <mat-icon class="drop-icon">cloud_upload</mat-icon>
            <span class="drop-text">Drag & Drop Image Here</span>
            <span class="drop-subtext">or click to upload / take photo</span>
          </div>
          <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none">
        </div>

        <button 
          mat-raised-button 
          color="primary" 
          class="analyze-btn" 
          *ngIf="previewUrl" 
          (click)="analyze()">
          <mat-icon>auto_awesome</mat-icon>
          Analyze Calories
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="analyzing">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Analyzing your food with AI...</p>
      </div>

      <!-- Result Section -->
      <div class="result-section" *ngIf="result">
        <div class="food-header">
          <h3>{{ result.name }}</h3>
          <div class="calories-badge">{{ result.calories }} kcal</div>
        </div>

        <p class="description">{{ result.description }}</p>

        <div class="macros-grid">
          <div class="macro-item protein">
            <span class="macro-val">{{ result.protein }}g</span>
            <span class="macro-label">Protein</span>
          </div>
          <div class="macro-item carbs">
            <span class="macro-val">{{ result.carbs }}g</span>
            <span class="macro-label">Carbs</span>
          </div>
          <div class="macro-item fat">
            <span class="macro-val">{{ result.fat }}g</span>
            <span class="macro-label">Fat</span>
          </div>
        </div>

        <div class="advice-box" *ngIf="result.advice">
          <mat-icon>tips_and_updates</mat-icon>
          <p>{{ result.advice }}</p>
        </div>

        <div class="actions">
          <button mat-button color="primary" (click)="saveToLog()">
            <mat-icon>check</mat-icon> Log Meal
          </button>
          <button mat-button color="warn" (click)="reset()">
            <mat-icon>refresh</mat-icon> Scan Another
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-card {
      background: linear-gradient(145deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.95));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      color: #fff;
    }

    .camera-icon {
      color: #00e5ff;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .image-preview {
      position: relative;
      width: 100%;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .upload-btn {
      width: 100%;
      height: 120px;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #aaa;
    }

    /* Drag and Drop Zone */
    .drop-zone {
      width: 100%;
      min-height: 140px;
      border: 2px dashed rgba(0, 229, 255, 0.3);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(0, 229, 255, 0.02);
    }

    .drop-zone:hover {
      border-color: rgba(0, 229, 255, 0.5);
      background: rgba(0, 229, 255, 0.05);
    }

    .upload-section.drag-over .drop-zone {
      border-color: #00e5ff;
      background: rgba(0, 229, 255, 0.15);
      transform: scale(1.02);
    }

    .drop-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #00e5ff;
      opacity: 0.7;
    }

    .drop-text {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }

    .drop-subtext {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .analyze-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      background: linear-gradient(135deg, #00e5ff, #2979ff);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #aaa;
      gap: 15px;
    }

    .result-section {
      animation: fadeIn 0.5s ease;
    }

    .food-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .food-header h3 {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .calories-badge {
      background: #ff6b35;
      color: #fff;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
    }

    .description {
      color: #aaa;
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .macros-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .macro-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 10px;
      text-align: center;
    }

    .macro-val {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    .macro-label {
      font-size: 12px;
      color: #aaa;
    }

    .protein .macro-val { color: #00e676; }
    .carbs .macro-val { color: #2979ff; }
    .fat .macro-val { color: #ffeb3b; }

    .advice-box {
      background: rgba(0, 229, 255, 0.1);
      border-left: 3px solid #00e5ff;
      padding: 12px;
      border-radius: 0 8px 8px 0;
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .advice-box mat-icon {
      color: #00e5ff;
    }

    .advice-box p {
      margin: 0;
      font-size: 13px;
      color: #ddd;
    }

    .actions {
      display: flex;
      justify-content: space-between;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FoodAnalysisComponent {
  @Output() mealLogged = new EventEmitter<any>();

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  analyzing = false;
  result: any = null;
  isDragOver = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.previewUrl = null;
    this.selectedFile = null;
  }

  analyze(): void {
    if (!this.selectedFile) return;

    this.analyzing = true;
    this.apiService.analyzeFood(this.selectedFile).subscribe({
      next: (res) => {
        this.result = res.analysis;
        this.analyzing = false;
        this.snackBar.open('Analysis Complete! 🍎', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.analyzing = false;
        this.snackBar.open('Failed to analyze image. Try again.', 'Close', { duration: 3000 });
      }
    });
  }

  saveToLog(): void {
    // In a real app, this would save to the backend database
    // For now, emit event to parent
    this.mealLogged.emit(this.result);
    this.snackBar.open(`Logged: ${this.result.name} (${this.result.calories} kcal)`, 'Close', { duration: 3000 });
    this.reset();
  }

  reset(): void {
    this.clearImage();
    this.result = null;
  }

  // Drag and Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    const items = event.dataTransfer?.items;

    // Check for dropped files first
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.handleFile(file);
        return;
      }
    }

    // Check for image URL (dragged from browser)
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === 'text/uri-list' || item.type === 'text/plain') {
          item.getAsString((url: string) => {
            if (this.isImageUrl(url)) {
              this.loadImageFromUrl(url);
            }
          });
          return;
        }
      }
    }

    this.snackBar.open('Please drop an image file', 'Close', { duration: 3000 });
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
      lowerUrl.includes('image') ||
      lowerUrl.startsWith('data:image');
  }

  private loadImageFromUrl(url: string): void {
    // For external URLs, we need to fetch and convert to file
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], 'dropped-image.jpg', { type: blob.type || 'image/jpeg' });
        this.handleFile(file);
        this.snackBar.open('Image loaded! Ready to analyze.', 'Close', { duration: 2000 });
      })
      .catch(err => {
        console.error('Failed to load image from URL:', err);
        // Fallback: just show the URL as preview (won't work for analysis but shows something)
        this.previewUrl = url;
        this.snackBar.open('Image preview loaded. For analysis, please upload a local file.', 'Close', { duration: 4000 });
      });
  }
}
