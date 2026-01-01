import { Injectable, EventEmitter } from '@angular/core';

export interface VoiceCommand {
    command: string;
    confidence: number;
    rawTranscript: string;
    params?: any;
}

@Injectable({
    providedIn: 'root'
})
export class VoiceCommandService {
    private recognition: any = null;
    private isListening = false;

    // Event emitters
    onCommand = new EventEmitter<VoiceCommand>();
    onRawTranscript = new EventEmitter<string>(); // For AI processing
    onListeningChange = new EventEmitter<boolean>();
    onError = new EventEmitter<string>();

    // Simple commands that don't need AI
    private simpleCommands: { [key: string]: string } = {
        'pause': 'pause',
        'stop': 'stop',
        'next': 'next',
        'skip': 'next',
        'previous': 'previous',
        'back': 'previous',
        'shuffle': 'shuffle',
        'louder': 'volume_up',
        'volume up': 'volume_up',
        'quieter': 'volume_down',
        'volume down': 'volume_down',
        'mute': 'mute',
        // Dashboard Commands
        'generate workout': 'generate_workout',
        'create workout': 'generate_workout',
        'make workout': 'generate_workout',
        'plan meals': 'generate_meal',
        'meal plan': 'generate_meal',
        'create meal plan': 'generate_meal',
        'refresh analysis': 'refresh_analysis',
        'update report': 'refresh_analysis'
    };

    constructor() {
        this.initRecognition();
    }

    private initRecognition(): void {
        const SpeechRecognition = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.toLowerCase().trim();
            const confidence = event.results[last][0].confidence;

            console.log('🎤 Voice heard:', transcript, 'Confidence:', confidence);

            // Check for simple commands first
            const simpleCommand = this.matchSimpleCommand(transcript);
            if (simpleCommand) {
                this.onCommand.emit({
                    command: simpleCommand,
                    confidence,
                    rawTranscript: transcript
                });
                return;
            }

            // For complex commands, emit the raw transcript for AI processing
            this.onRawTranscript.emit(transcript);
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
                this.onError.emit(event.error);
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                try {
                    this.recognition.start();
                } catch (e) {
                    // Already started
                }
            }
        };
    }

    private matchSimpleCommand(transcript: string): string | null {
        // Exact match
        if (this.simpleCommands[transcript]) {
            return this.simpleCommands[transcript];
        }

        // Check if transcript starts with simple command
        for (const [phrase, command] of Object.entries(this.simpleCommands)) {
            if (transcript === phrase || transcript.startsWith(phrase + ' ')) {
                return command;
            }
        }

        return null;
    }

    isSupported(): boolean {
        return this.recognition !== null;
    }

    getIsListening(): boolean {
        return this.isListening;
    }

    startListening(): void {
        if (!this.recognition) {
            this.onError.emit('Speech recognition not supported');
            return;
        }

        if (this.isListening) return;

        try {
            this.recognition.start();
            this.isListening = true;
            this.onListeningChange.emit(true);
            console.log('🎤 Voice recognition started');
        } catch (e) {
            console.error('Failed to start recognition:', e);
            this.onError.emit('Failed to start voice recognition');
        }
    }

    stopListening(): void {
        if (!this.recognition || !this.isListening) return;

        try {
            this.recognition.stop();
            this.isListening = false;
            this.onListeningChange.emit(false);
            console.log('🎤 Voice recognition stopped');
        } catch (e) {
            console.error('Failed to stop recognition:', e);
        }
    }

    toggleListening(): void {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
}
