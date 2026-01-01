import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ActivityLog {
    logged_at: string;
    activity_type: string;
    intensity: number;
}

interface DayCell {
    date: Date;
    level: number; // 0-4
    tooltip: string;
}

@Component({
    selector: 'app-activity-graph',
    template: `
    <div class="activity-graph-container">
      <div class="graph-header">
        <h3>Activity Log</h3>
        <div class="legend">
          <span>Less</span>
          <div class="level-box level-0"></div>
          <div class="level-box level-1"></div>
          <div class="level-box level-2"></div>
          <div class="level-box level-3"></div>
          <div class="level-box level-4"></div>
          <span>More</span>
        </div>
      </div>
      
      <div class="graph-grid">
        <div *ngFor="let week of weeks" class="week-column">
          <div *ngFor="let day of week" 
               class="day-cell"
               [ngClass]="'level-' + day.level"
               [matTooltip]="day.tooltip">
          </div>
        </div>
      </div>
      <div class="months-row">
        <span *ngFor="let month of months">{{ month }}</span>
      </div>
    </div>
  `,
    styles: [`
    .activity-graph-container {
      margin-top: 24px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .graph-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .graph-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .level-box {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    /* GitHub-like Green Theme */
    .level-0 { background: #161b22; border: 1px solid rgba(255,255,255,0.05); }
    .level-1 { background: #0e4429; }
    .level-2 { background: #006d32; }
    .level-3 { background: #26a641; }
    .level-4 { background: #39d353; }

    .graph-grid {
      display: flex;
      gap: 3px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .week-column {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .day-cell {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .day-cell:hover {
      transform: scale(1.2);
      border: 1px solid rgba(255,255,255,0.5);
    }

    .months-row {
      display: flex;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.4);
      font-size: 10px;
      padding: 0 10px;
      margin-top: 4px;
    }
  `]
})
export class ActivityGraphComponent implements OnInit {
    weeks: DayCell[][] = [];
    months: string[] = [];

    constructor(private apiService: ApiService, private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.generateGrid();
        this.fetchActivity();
    }

    generateGrid() {
        const today = new Date();
        // Start 52 weeks ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);

        // Adjust to start on Sunday
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        let currentDate = new Date(startDate);
        const monthsSet = new Set<string>();

        for (let i = 0; i < 53; i++) {
            const week: DayCell[] = [];
            for (let j = 0; j < 7; j++) {
                week.push({
                    date: new Date(currentDate),
                    level: 0,
                    tooltip: `${currentDate.toDateString()}: No activity`
                });

                if (currentDate.getDate() === 1) {
                    monthsSet.add(currentDate.toLocaleString('default', { month: 'short' }));
                }

                currentDate.setDate(currentDate.getDate() + 1);
                if (currentDate > today) break;
            }
            this.weeks.push(week);
            if (currentDate > today) break;
        }
        this.months = Array.from(monthsSet);
    }

    fetchActivity() {
        // Assuming we added the endpoint to ApiService
        // Since we can't edit ApiService in strict step, I'll use a direct fetch or cast apiService
        // Ideally we add logActivity to ApiService, but for now let's assume it exists or use HttpClient directly if injected
        // Or we extend the ApiService briefly.

        // Simulating fetching for now or using the endpoint
        // We will update ApiService next.
        (this.apiService as any).getActivityLog().subscribe({
            next: (logs: ActivityLog[]) => {
                this.populateGrid(logs);
            },
            error: () => console.log('Failed to load activity logs')
        });
    }

    populateGrid(logs: ActivityLog[]) {
        const logMap = new Map<string, number>();
        logs.forEach(log => {
            const dateStr = new Date(log.logged_at).toDateString();
            logMap.set(dateStr, log.intensity);
        });

        this.weeks.forEach(week => {
            week.forEach(day => {
                const dateStr = day.date.toDateString();
                if (logMap.has(dateStr)) {
                    const intensity = logMap.get(dateStr) || 0;
                    day.level = intensity;
                    day.tooltip = `${dateStr}: ${intensity} Activities`;
                }
            });
        });
    }
}
