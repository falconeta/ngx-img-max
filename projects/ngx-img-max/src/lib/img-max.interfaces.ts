export interface ImageConfig {
  maxWidth: number;
  maxHeight: number;
  logExecutionTime: boolean;
}

export interface ImageError {
  resizedFile: File;
  reason: string;
  error: string;
}
