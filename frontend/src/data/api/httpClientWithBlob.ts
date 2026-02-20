export const httpClientWithBlob = async (
  url: string,
  options?: RequestInit
) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BACKEND_API_URL is not defined");
    throw new Error("API URL is not configured");
  }

  console.log("Making request to:", `${baseUrl}${url}`);

  const response = await fetch(`${baseUrl}${url}`, options);
  if (!response.ok) {
    const contentType = response.headers.get("Content-Type");
    const isJson = contentType && contentType.includes("application/json");

    const errorData = isJson
      ? await response.json()
      : { message: await response.text() };
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return await response.blob();
};
