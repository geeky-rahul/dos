import auth from "@react-native-firebase/auth";

const API_URL = "http://10.0.2.2:5000";

export const syncUserWithBackend = async () => {
  try {
    const user = auth().currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error syncing user with backend:", error);
    return null;
  }
};
