import { useEffect, useState } from "react";
import api from "../api/axios";
import { Save } from "lucide-react";

function SettingsPage() {
  const [formData, setFormData] = useState({
    organization_name: "",
    display_title: "",
    welcome_message: "",
    token_prefix: "",
    estimated_wait_per_token: 5,
    display_next_count: 5,
    auto_refresh_seconds: 5,
    turn_soon_threshold: 2,
    sound_enabled: true,
    browser_notification_enabled: true,
    daily_token_reset: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= GET SETTINGS =================
  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setFormData(res.data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ================= SAVE =================
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.put("/settings", formData);

      setMessage("Settings saved successfully");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">

        <input
          name="organization_name"
          value={formData.organization_name}
          onChange={handleChange}
          placeholder="Organization Name"
          className="w-full border p-3 rounded-xl"
        />

        <input
          name="display_title"
          value={formData.display_title}
          onChange={handleChange}
          placeholder="Display Title"
          className="w-full border p-3 rounded-xl"
        />

        <input
          name="welcome_message"
          value={formData.welcome_message}
          onChange={handleChange}
          placeholder="Welcome Message"
          className="w-full border p-3 rounded-xl"
        />

        <input
          name="token_prefix"
          value={formData.token_prefix}
          onChange={handleChange}
          placeholder="Token Prefix"
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          name="estimated_wait_per_token"
          value={formData.estimated_wait_per_token}
          onChange={handleChange}
          placeholder="Wait per Token"
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          name="display_next_count"
          value={formData.display_next_count}
          onChange={handleChange}
          placeholder="Next Tokens Count"
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          name="auto_refresh_seconds"
          value={formData.auto_refresh_seconds}
          onChange={handleChange}
          placeholder="Auto Refresh Seconds"
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          name="turn_soon_threshold"
          value={formData.turn_soon_threshold}
          onChange={handleChange}
          placeholder="Turn Soon Threshold"
          className="w-full border p-3 rounded-xl"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sound_enabled"
            checked={formData.sound_enabled}
            onChange={handleChange}
          />
          Sound Enabled
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="browser_notification_enabled"
            checked={formData.browser_notification_enabled}
            onChange={handleChange}
          />
          Browser Notifications
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="daily_token_reset"
            checked={formData.daily_token_reset}
            onChange={handleChange}
          />
          Daily Token Reset
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5777B2] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

export default SettingsPage;