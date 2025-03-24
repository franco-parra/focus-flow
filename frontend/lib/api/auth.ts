export async function authenticateUser(credentials: {
  username: string;
  password: string;
}) {
  const response = await fetch(`http://localhost:8000/api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return response.json();
}
