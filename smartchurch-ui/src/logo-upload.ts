export async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read the selected file."));
    };
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadChurchLogo(apiBaseUrl: string, file: File) {
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch(`${apiBaseUrl}/church-assets/logo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dataUrl }),
  });

  const payload = (await response.json()) as {
    logoUrl?: string;
    message?: string;
  };

  if (!response.ok || !payload.logoUrl) {
    throw new Error(payload.message ?? "Logo upload failed.");
  }

  return payload.logoUrl;
}
