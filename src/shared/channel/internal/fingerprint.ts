import type { Fingerprint } from "./types";
import uid from "tiny-uid";

export const FINGERPRINT_LENGTH = 7;
export const FINGERPRINT_PREFIX = "uid::" as const;
export const FINGERPRINT_FULL_LENGTH = FINGERPRINT_PREFIX.length + FINGERPRINT_LENGTH;

export function createFingerprint(): Fingerprint {
    return `${FINGERPRINT_PREFIX}${uid(FINGERPRINT_LENGTH)}`;
}

export function isValidFingerprint(fingerprint: string): fingerprint is Fingerprint {
    return fingerprint.startsWith(FINGERPRINT_PREFIX) && fingerprint.length === FINGERPRINT_FULL_LENGTH;
}
