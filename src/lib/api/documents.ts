export async function uploadDocumentFile(file: File): Promise<{ key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "Upload failed.");
  }

  return response.json() as Promise<{ key: string; url: string }>;
}
