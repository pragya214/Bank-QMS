import api from "../../api/axios";

export const defaultSettings = {
  organization_name: "Bank Queue",
  display_title: "Queue Display Board",
  welcome_message: "Welcome to Bank QMS",
  token_prefix: "A",
  estimated_wait_per_token: 5,
  display_next_count: 5,
  auto_refresh_seconds: 5,
  turn_soon_threshold: 2,
  sound_enabled: true,
  browser_notification_enabled: true,
  daily_token_reset: false,
};

export const getAppSettings = async () => {
  try {
    const res = await api.get("/settings");
    return res.data.settings || defaultSettings;
  } catch (error) {
    console.error("Settings fetch failed:", error);
    return defaultSettings;
  }
};