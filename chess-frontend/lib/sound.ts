export const playMoveSound = ()=>{
    const audio = new Audio("/sound/move.mp3");
    audio.volume = 0.4;
    audio.play();
}

export const playCaptureSound = ()=>{
    const audio = new Audio("/sound/capture.mp3");
    audio.volume = 0.4;
    audio.play();
}