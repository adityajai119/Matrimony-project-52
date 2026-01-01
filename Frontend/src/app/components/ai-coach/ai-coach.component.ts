import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { AIService } from '../../services/ai.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    time: Date;
}

@Component({
    selector: 'app-ai-coach',
    templateUrl: './ai-coach.component.html',
    styleUrls: ['./ai-coach.component.css']
})
export class AICoachComponent implements AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    isOpen = false;
    userInput = '';
    loading = false;
    messages: ChatMessage[] = [
        { role: 'model', text: "I am Vegeta, Prince of all Saiyans! What training do you require today, Warrior?", time: new Date() }
    ];

    suggestions = [
        "Why am I weak?",
        "Give me a Saiyan workout",
        "What should I eat for power?",
        "Analyze my power level"
    ];

    constructor(private aiService: AIService, private snackBar: MatSnackBar) { }

    ngAfterViewChecked() {
        // Only auto-scroll if we are already near the bottom or it's a new message
        // Ideally, we handle this more gracefully, but for now, let's just do it on open or message add
    }

    scrollToBottom(): void {
        try {
            setTimeout(() => {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }, 100);
        } catch (err) { }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.scrollToBottom();
        }
    }

    sendMessage(text: string = this.userInput) {
        if (!text.trim()) return;

        // Add user message
        this.messages.push({ role: 'user', text, time: new Date() });
        this.userInput = '';
        this.loading = true;
        this.scrollToBottom();

        this.aiService.chat(text).subscribe({
            next: (res: any) => {
                this.messages.push({ role: 'model', text: res.response, time: new Date() });
                this.loading = false;
                this.scrollToBottom();
            },
            error: (err: any) => {
                this.snackBar.open('💀 Vegeta is meditating! Try again later, Warrior.', 'Close', { duration: 3000, panelClass: ['dbz-snackbar'] });
                this.loading = false;
                this.messages.push({ role: 'model', text: "My scouter is malfunctioning. Check your connection!", time: new Date() });
                this.scrollToBottom();
            }
        });
    }

    selectSuggestion(suggestion: string) {
        this.sendMessage(suggestion);
    }
}
