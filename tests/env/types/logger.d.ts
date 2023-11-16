type LoggerMock = typeof console & {
    mute(): void;
    unmute(): void;
}