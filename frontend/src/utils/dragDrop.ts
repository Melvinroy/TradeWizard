// Utility functions for drag and drop file handling

export const extractFilesFromDragEvent = (e: React.DragEvent): File[] => {
  const files: File[] = [];
  
  // Method 1: Standard files property (works in most browsers)
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    return Array.from(e.dataTransfer.files);
  }
  
  // Method 2: Items API (for better browser support)
  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    const items = Array.from(e.dataTransfer.items);
    for (const item of items) {
      // Only process file items
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  }
  
  return files;
};

// New function to extract file paths from drag event (for VS Code and other editors)
export const extractFilePathFromDragEvent = (e: React.DragEvent): string | null => {
  // Try different data types that contain file paths
  const pathSources = [
    'text/plain',
    'text/uri-list',
    'codefiles',
    'application/vnd.code.uri-list'
  ];
  
  for (const type of pathSources) {
    try {
      const data = e.dataTransfer.getData(type);
      if (data) {
        // Handle different formats
        if (type === 'codefiles') {
          // VS Code format: ["path"]
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0];
            }
          } catch {}
        } else if (type === 'text/uri-list' || type === 'application/vnd.code.uri-list') {
          // URI format: file:///path
          if (data.startsWith('file:///')) {
            return decodeURIComponent(data.replace('file:///', '').replace(/\//g, '\\'));
          }
        } else if (type === 'text/plain') {
          // Plain text path
          if (data.includes(':\\') || data.includes('/')) {
            return data.trim();
          }
        }
      }
    } catch (error) {
      console.log(`Error reading ${type}:`, error);
    }
  }
  
  return null;
};

// Convert file path to File object by reading it
export const createFileFromPath = async (filePath: string): Promise<File | null> => {
  try {
    // For security reasons, we can't directly read files from arbitrary paths in the browser
    // This would require a file input or the File System Access API
    // Instead, we'll show an error message suggesting to use the browse button
    return null;
  } catch (error) {
    console.error('Error creating file from path:', error);
    return null;
  }
};

export const isValidCSVFile = (file: File): boolean => {
  if (!file) return false;
  
  const fileName = file.name.toLowerCase();
  
  // Check file extension
  const validExtensions = ['.csv', '.txt', '.dat'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  // Check MIME type (can be unreliable for CSV)
  const validMimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain',
    'text/x-csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    '' // Empty MIME type is common for CSV files
  ];
  const hasValidMimeType = validMimeTypes.includes(file.type);
  
  // Accept if either extension or MIME type is valid
  return hasValidExtension || hasValidMimeType;
};

export const hasFileInDragEvent = (e: React.DragEvent): boolean => {
  if (!e.dataTransfer) return false;
  
  // Check if types array contains 'Files'
  if (e.dataTransfer.types) {
    const types = Array.from(e.dataTransfer.types);
    return types.includes('Files') || types.includes('application/x-moz-file');
  }
  
  // Check items
  if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
    return Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
  }
  
  // Check files
  return e.dataTransfer.files && e.dataTransfer.files.length > 0;
};