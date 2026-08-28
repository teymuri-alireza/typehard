import keyboardSound from "../assets/sounds/keyboard.mp3";

const keyboardAudio: HTMLAudioElement = new Audio(keyboardSound);

export function playKeyboardSound(): void {
    keyboardAudio.currentTime = 0;

    void keyboardAudio.play();
}