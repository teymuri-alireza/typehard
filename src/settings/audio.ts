const keyboardAudio: HTMLAudioElement = new Audio("/sounds/keyboard.mp3");

export function playKeyboardSound(): void {
    keyboardAudio.currentTime = 0;

    void keyboardAudio.play();
}