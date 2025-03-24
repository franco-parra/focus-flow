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

export async function logoutUser(refreshToken: string) {
  const response = await fetch(`http://localhost:8000/api/token/blacklist/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}
