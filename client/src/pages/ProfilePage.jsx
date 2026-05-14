import { useEffect, useRef, useState } from "react";
import { UserCircle2, Phone, ShieldCheck, Camera } from "lucide-react";
import api from "../api/axios";
import { useNotifications } from "../context/NotificationContext";

function ProfilePage() {
  const { pushNotification } = useNotifications();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await api.get("/auth/profile");

      console.log("FETCH PROFILE RESPONSE:", res.data);

      setUser(res.data.user);
      setName(res.data.user?.name || "");
      setPhoto(res.data.user?.profile_photo_url || "");
      setRemovePhoto(false);

      localStorage.setItem("qms_user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
      console.error("FETCH PROFILE ERROR RESPONSE:", err.response?.data);
      pushNotification("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    console.log("SELECTED FILE:", file);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushNotification("Please select a valid image", "error");
      return;
    }

    if (file.size > 1024 * 1024) {
      pushNotification("Image size should be less than 1MB", "error");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      console.log("BASE64 PHOTO START:", String(result).slice(0, 50));
      console.log("BASE64 PHOTO LENGTH:", result?.length);

      if (!result || !String(result).startsWith("data:image/")) {
        pushNotification("Invalid image data", "error");
        return;
      }

      setPhoto(result);
      setRemovePhoto(false);
    };

    reader.onerror = () => {
      console.error("FILEREADER ERROR:", reader.error);
      pushNotification("Failed to read image", "error");
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    console.log("PHOTO REMOVE CLICKED");

    setPhoto("");
    setRemovePhoto(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name,
        profile_photo_url: removePhoto ? null : photo,
        remove_photo: removePhoto,
      };

      console.log("PROFILE UPDATE PAYLOAD:", {
        name: payload.name,
        remove_photo: payload.remove_photo,
        hasPhoto: !!payload.profile_photo_url,
        photoLength: payload.profile_photo_url?.length || 0,
        photoStart: payload.profile_photo_url?.slice?.(0, 50),
      });

      const res = await api.put("/auth/profile", payload);

      console.log("PROFILE UPDATE RESPONSE:", res.data);

      setUser(res.data.user);
      setPhoto(res.data.user?.profile_photo_url || "");
      setRemovePhoto(false);

      localStorage.setItem("qms_user", JSON.stringify(res.data.user));

      pushNotification(res.data.message, "success");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      console.error("PROFILE UPDATE ERROR RESPONSE:", err.response?.data);

      pushNotification(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-[30px] bg-gradient-to-r from-[#11274D] to-[#5777B2] p-8 text-white shadow-xl">
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 rounded-3xl bg-white/15 flex items-center justify-center overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle2 size={54} />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
            <p className="text-white/75 mt-1">{user?.phone_no}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <Phone className="text-[#5777B2]" />
          <p className="text-sm text-slate-500 mt-3">Mobile Number</p>
          <p className="font-bold text-slate-900">{user?.phone_no}</p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <ShieldCheck className="text-green-600" />
          <p className="text-sm text-slate-500 mt-3">Role</p>
          <p className="font-bold text-slate-900">{user?.role || "admin"}</p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <UserCircle2 className="text-purple-600" />
          <p className="text-sm text-slate-500 mt-3">User ID</p>
          <p className="font-bold text-slate-900 truncate">{user?.id}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          Update your name and profile photo.
        </p>

        <form onSubmit={handleUpdate} className="mt-6 space-y-6 max-w-xl">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img
                  src={photo}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle2 size={44} className="text-slate-400" />
              )}
            </div>

            <label className="cursor-pointer rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 flex items-center gap-2">
              <Camera size={18} />
              Upload Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition-all focus:border-[#5777B2] focus:ring-4 focus:ring-[#5777B2]/10"
          />

          <div className="flex gap-3">
            <button
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-[#5777B2] to-[#6C7790] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            {photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="rounded-2xl bg-red-50 px-6 py-3.5 font-semibold text-red-600 transition hover:bg-red-100"
              >
                Remove Photo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;