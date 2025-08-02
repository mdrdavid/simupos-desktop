export const httpClient = async (url: string, options?: RequestInit) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API}${url}`,
    options
  );
  const contentType = response.headers.get("Content-Type");
  const isJson = contentType && contentType.includes("application/json");
  const parseErrorBody = async () =>
    isJson ? await response.json() : { message: await response.text() };

  switch (response.status) {
    case 200:
    case 201:
    case 204:
      return isJson ? await response.json() : null;
    case 400: {
      const errorData = await parseErrorBody();
      throw new Error(errorData.message || "Bad Request");
    }
    case 401:
      window.location.href = "/auth/login";
      return null;
    case 403: {
      const errorData = await parseErrorBody();
      throw new Error(errorData.message || "Forbidden");
    }
    case 404: {
      const errorData = await parseErrorBody();
      throw new Error(errorData.message || "Not Found");
    }
    case 409: {
      const errorData = await parseErrorBody();
      throw {
        ...errorData,
        status: 409,
        isDuplicate: true,
      };
    }
    case 422: {
      const errorData = await parseErrorBody();
      throw new Error(errorData.message || "Unprocessable Entity");
    }
    case 500: {
      const errorData = await parseErrorBody();
      throw new Error(errorData.message || "Internal Server Error");
    }
    default: {
      const errorData = await parseErrorBody();
      throw new Error(
        errorData.message || `Unexpected Error: ${response.status}`
      );
    }
  }
};
