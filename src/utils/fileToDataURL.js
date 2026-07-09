/**
 * Reads a File/Blob and resolves with a base64 data URL.
 * Unlike URL.createObjectURL(), this can be safely stored in
 * localStorage and will survive page reloads.
 */
export const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
