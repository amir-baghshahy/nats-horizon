/**
 * Stored message information
 */
export interface StoredMessage {
  sequence: number;
  subject: string;
  data: string;
  timestamp: number;
  headers?: Record<string, string[]>;
}

/**
 * Message view mode
 */
export type MessageViewMode = "list" | "grid";

/**
 * Message filter options
 */
export interface MessageFilters {
  search: string;
  subjectPattern: string;
  minSequence?: number;
  maxSequence?: number;
}

/**
 * Message statistics
 */
export interface MessageStats {
  total: number;
  totalBytes: number;
  avgSize: number;
  oldest?: number;
  newest?: number;
}
