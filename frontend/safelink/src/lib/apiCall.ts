export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`http://localhost:5000/api${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

