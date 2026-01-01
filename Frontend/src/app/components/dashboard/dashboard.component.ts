import { Component, OnInit } from '@angular/core';
import { AIService } from '../../services/ai.service';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VoiceCommandService } from '../../services/voice-command.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    loading = true;
    healthAnalysis = '';
    weeklyReport: any = null;
    streak = 0;
    fatigueLevel = 'Low';
    userName = 'Warrior'; // Default fallback
    isListening = false;
    private voiceSubscription?: Subscription;
    private listeningSubscription?: Subscription;

    constructor(
        private aiService: AIService,
        private apiService: ApiService,
        private snackBar: MatSnackBar,
        public voiceService: VoiceCommandService
    ) { }

    ngOnInit() {
        this.loadDashboardData();

        // Voice Command Subscription
        this.voiceSubscription = this.voiceService.onCommand.subscribe(cmd => {
            this.handleVoiceCommand(cmd.command);
        });

        this.listeningSubscription = this.voiceService.onListeningChange.subscribe(listening => {
            this.isListening = listening;
        });
    }

    ngOnDestroy() {
        this.voiceSubscription?.unsubscribe();
        this.listeningSubscription?.unsubscribe();
        this.voiceService.stopListening();
    }

    toggleVoiceControl() {
        this.voiceService.toggleListening();
    }

    handleVoiceCommand(command: string) {
        console.log('Dashboard Voice Command:', command);
        switch (command) {
            case 'generate_workout':
                this.snackBar.open('🎙️ Generating workout...', '', { duration: 2000 });
                // Assuming GenerateWorkoutComponent is separate, we might need a shared service or event
                // For now, we'll simulate the user intent or trigger a simpler action
                // Ideally, this component would have access to the generation method or emit an event
                break;
            case 'generate_meal':
                this.snackBar.open('🎙️ Creating meal plan...', '', { duration: 2000 });
                break;
            case 'refresh_analysis':
                this.loadDashboardData();
                this.snackBar.open('🎙️ Refreshing analysis...', '', { duration: 2000 });
                break;
        }
    }

    loadDashboardData() {
        this.loading = true;

        // Fetch Profile for Streak & Fatigue
        this.apiService.getProfile().subscribe({
            next: (profile: any) => {
                this.streak = profile.streak_count || 0;
                this.fatigueLevel = profile.fatigue_level || 'Low';
                this.userName = profile.name || profile.email?.split('@')[0] || 'Warrior';

                // Fetch AI Analysis after profile to ensure valid token/session
                this.aiService.getHealthAnalysis().subscribe({
                    next: (res: any) => {
                        // Replace [User Name] placeholder with actual name
                        this.healthAnalysis = res.analysis
                            .replace(/\[User Name\]/gi, this.userName)
                            .replace(/\[user name\]/gi, this.userName)
                            .replace(/\[Username\]/gi, this.userName);
                        this.loading = false;
                    },
                    error: (err: any) => {
                        // Non-critical, just hide loading
                        this.loading = false;
                    }
                });
            },
            error: (err: any) => {
                this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    updateFatigue(level: string) {
        this.fatigueLevel = level;
        this.aiService.updateFatigue(level).subscribe({
            next: () => {
                this.snackBar.open(`Fatigue updated to ${level}. Workouts will adapt!`, 'Close', { duration: 3000 });
            }
        });
    }

    getFatiguePercent(): number {
        switch (this.fatigueLevel) {
            case 'High': return 85;
            case 'Medium': return 50;
            default: return 20;
        }
    }

    downloadPDF(): void {
        if (!this.healthAnalysis) {
            this.snackBar.open('No health report to download', 'Close', { duration: 3000 });
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - margin * 2;
        let yPosition = 0;

        // ===== HEADER SECTION =====
        // Header background gradient effect (orange to gold)
        doc.setFillColor(255, 107, 53);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Secondary accent bar
        doc.setFillColor(255, 165, 0);
        doc.rect(0, 45, pageWidth, 3, 'F');

        // Logo/App name
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('LIMITBREAKER', margin, 12);

        // Main title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Weekly AI Health Report', margin, 30);

        // Date subtitle
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 230, 200);
        const dateStr = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(dateStr, margin, 40);

        yPosition = 60;

        // ===== USER STATS BOX =====
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(margin, yPosition, maxWidth, 25, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Current Streak', margin + 10, yPosition + 10);
        doc.text('Fatigue Level', margin + 70, yPosition + 10);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 107, 53);
        doc.text(`${this.streak} days`, margin + 10, yPosition + 20);

        const fatigueColor = this.fatigueLevel === 'High' ? [220, 53, 69] :
            this.fatigueLevel === 'Medium' ? [255, 193, 7] : [40, 167, 69];
        doc.setTextColor(fatigueColor[0], fatigueColor[1], fatigueColor[2]);
        doc.text(`${this.fatigueLevel}`, margin + 70, yPosition + 20);

        yPosition += 35;

        // ===== REPORT CONTENT =====
        // Section header
        doc.setFillColor(255, 107, 53);
        doc.rect(margin, yPosition, 4, 15, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('AI Analysis & Recommendations', margin + 10, yPosition + 10);
        yPosition += 25;

        // Report content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        // Clean markdown formatting and emojis for PDF
        const cleanText = this.healthAnalysis
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '')
            .replace(/\n\n/g, '\n')
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // Symbols & Pictographs
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // Transport & Map
            .replace(/[\u{1F700}-\u{1F77F}]/gu, '')  // Alchemical
            .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')  // Geometric Shapes
            .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')  // Supplemental Arrows
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')  // Supplemental Symbols
            .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')  // Chess Symbols
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')  // Symbols Extended
            .replace(/[\u{2600}-\u{26FF}]/gu, '')    // Misc Symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')    // Dingbats
            .trim();

        const lines = doc.splitTextToSize(cleanText, maxWidth - 5);

        for (const line of lines) {
            if (yPosition > pageHeight - 30) {
                // Add page with header
                doc.addPage();
                doc.setFillColor(255, 107, 53);
                doc.rect(0, 0, pageWidth, 15, 'F');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                doc.text('LimitBreaker - Weekly AI Health Report (continued)', margin, 10);
                yPosition = 25;
                doc.setTextColor(60, 60, 60);
                doc.setFontSize(11);
            }
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
        }

        // ===== FOOTER =====
        const footerY = pageHeight - 15;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by LimitBreaker AI • Your Personal Health Companion', margin, footerY);
        doc.text(`Page 1`, pageWidth - margin - 15, footerY);

        // Download
        doc.save(`LimitBreaker-Health-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        this.snackBar.open('PDF downloaded successfully! 📄', 'Close', { duration: 3000 });
    }
}
