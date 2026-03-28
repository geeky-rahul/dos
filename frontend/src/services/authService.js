import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '../constants/api';

export const syncUserWithBackend = async () => {
  try {
    const user = auth().currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
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

export const updateUserProfile = async (profileData) => {
  try {
    const user = auth().currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const message = await res.text();
      console.error(`API error: ${res.status} ${message}`);
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};
