export function downloadBlob(data: Blob | string | object, filename: string) {
  let blob: Blob;
  if (typeof data === "string") {
    blob = new Blob([data], { type: "application/octet-stream" });
  } else if (data instanceof Blob) {
    blob = data;
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}