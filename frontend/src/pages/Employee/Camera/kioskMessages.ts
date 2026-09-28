export type ErrorCode =
  | 'NO_FACE'
  | 'POOR_QUALITY'
  | 'LIVENESS_FAILED'
  | 'NOT_RECOGNIZED'
  | 'LOW_CONFIDENCE'
  | 'EMPLOYEE_INACTIVE'
  | 'NO_CHECKIN'
  | 'ALREADY_CHECKED_IN'
  | 'INVALID_IMAGE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'CAMERA_DENIED'
  | 'TOO_MANY_ERRORS';

export const KIOSK_MESSAGES: Record<ErrorCode, string> = {
  NO_FACE: "Please face the camera",
  POOR_QUALITY: "Improve lighting and hold still",
  LIVENESS_FAILED: "Face the camera and stay still",
  NOT_RECOGNIZED: "Face not recognized. Try again",
  LOW_CONFIDENCE: "Face the camera and hold still",
  EMPLOYEE_INACTIVE: "Account inactive. Contact HR",
  NO_CHECKIN: "You haven't checked in",
  ALREADY_CHECKED_IN: "Already checked in",
  INVALID_IMAGE: "Camera error. Trying again...",
  SERVER_ERROR: "Server error. Trying again...",
  NETWORK_ERROR: "Check your internet connection",
  CAMERA_DENIED: "Allow camera access",
  TOO_MANY_ERRORS: "Something went wrong. Tap Retry"
};

export function getKioskMessage(code?: string): string {
  if (!code) return KIOSK_MESSAGES.SERVER_ERROR;
  return KIOSK_MESSAGES[code as ErrorCode] || KIOSK_MESSAGES.SERVER_ERROR;
}

export const TERMINAL_CODES = [
  'EMPLOYEE_INACTIVE',
  'NO_CHECKIN',
  'ALREADY_CHECKED_IN',
  'CAMERA_DENIED'
];
