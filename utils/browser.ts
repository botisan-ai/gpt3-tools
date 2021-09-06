export function downloadFile(filename: string, fileData: string): void {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.download = filename;
  const blob = new Blob([fileData]);
  a.href = URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
