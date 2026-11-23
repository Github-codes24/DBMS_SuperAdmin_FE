import { useState,useEffect } from "react";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import ThemeSettingsPage from "./ThemeSettingsPage";
import { useToast } from "../../context";
import {
  updateSecuritySettings,
  updateMaintenanceMode,
  updateGeneralSettings,
  getPlatformSettings,
  getMySettings,
  updateMyNotifications,
  updateMyProfile
} from "./settingsService";

const tabs = ["Appearance", "Platform Security", "General & Maintenance", "Personal Information",];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Appearance");
  const { toast } = useToast();
 const [securitySettings, setSecuritySettings] = useState<any>({passwordMinLength: 10,sessionTimeoutMinutes: 30,maxLoginAttempts: 3,lockoutDuration: 30,requirePasswordComplexity: false,});
  const [generalSettings, setGeneralSettings] = useState({appName: "",supportEmail: "",});
  const [logo, setLogo] = useState("");
  const [maintenance, setMaintenance] = useState({enabled: true,message: "System maintenance in progress",});
  const [securityLoading, setSecurityLoading] = useState(false);
const [generalLoading, setGeneralLoading] = useState(false);
const [maintenanceLoading, setMaintenanceLoading] = useState(false);


const [profileData, setProfileData] = useState({
  name: "",
  email: "",
  avatar: "",
  role: "",
});


const [editProfile, setEditProfile] = useState({
  name: "",
  avatar: "",
});

const [notificationSettings, setNotificationSettings] = useState({
  channels: {
    email: true,
    push: true,
    inApp: true,
  },
  events: {
    roleChanges: true,
    projectUpdates: true,
    systemAlerts: true,
    productNews: true,
  },
  quietHours: {
    enabled: false,
    start: "",
    end: "",
  },
});

useEffect(() => {
  const fetchMySettings = async () => {
    try {
      const data = await getMySettings();

    const settings = data?.data;

setProfileData({
  name: settings?.user?.name || "",
  email: settings?.user?.email || "",
  avatar: settings?.avatar || "",
  role: settings?.user?.role || "",
});

setEditProfile({
  name: settings?.user?.name || "",
  avatar: settings?.avatar || "",
});

if (settings?.notifications) {
  setNotificationSettings({
    channels: {
      email: settings.notifications.channels?.email ?? true,
      push: settings.notifications.channels?.push ?? true,
      inApp: settings.notifications.channels?.inApp ?? true,
    },
    events: {
      roleChanges: settings.notifications.events?.roleChanges ?? true,
      projectUpdates: settings.notifications.events?.projectUpdates ?? true,
      systemAlerts: settings.notifications.events?.systemAlerts ?? true,
      productNews: settings.notifications.events?.productNews ?? false,
    },
    quietHours: {
      enabled: settings.notifications.quietHours?.enabled ?? false,
      start: settings.notifications.quietHours?.start ?? "",
      end: settings.notifications.quietHours?.end ?? "",
    },
  });
}
    } catch (error) {
      console.error("Failed to fetch personal settings:", error);
    }
  };

  fetchMySettings();
}, []);

useEffect(() => {
  if (activeTab === "Platform Security") {
    loadSecuritySettings();
  }
}, [activeTab]);

useEffect(() => {
  const loadPlatformSettings = async () => {
    try {
      const response = await getPlatformSettings();
      const settings = response?.data?.data ?? response?.data ?? response;

      if (settings?.general) {
        setGeneralSettings({
          appName: settings.general.appName ?? "",
          supportEmail: settings.general.supportEmail ?? "",
        });

        setLogo(settings.general.logo ?? "");
      }

      if (settings?.maintenance) {
        setMaintenance({
          enabled: settings.maintenance.enabled,
          message: settings.maintenance.message ?? "",
        });
      }

      if (settings?.security) {
        setSecuritySettings((prev:any) => ({
          ...prev,
          ...settings.security,
        }));
      }
    } catch (error) {
      console.error("Failed to load platform settings", error);
    }
  };

  loadPlatformSettings();
}, []);



const loadSecuritySettings = async () => {
  try {
    setSecurityLoading(true)
    const data = await getPlatformSettings();
    setSecuritySettings((prev: any) => ({
  ...prev,
  ...(data?.data?.security ?? data?.security ?? {}),
}));
  } catch (error) {
    console.error("Failed to load security settings", error);
  } finally {
    setSecurityLoading(false)
  }
};


const saveSecuritySettings = async () => {
  try {
    setSecurityLoading(true)
    await updateSecuritySettings({
  passwordMinLength: securitySettings.passwordMinLength,
  sessionTimeoutMinutes: securitySettings.sessionTimeoutMinutes,
  maxLoginAttempts: securitySettings.maxLoginAttempts,
  // lockoutDuration: securitySettings.lockoutDuration,
  // requirePasswordComplexity: securitySettings.requirePasswordComplexity,
});
    toast.success("Security settings saved successfully");
  } catch (error) {
    console.error("Failed to save security settings", error);
    toast.error("Failed to save security settings");
  } finally {
    setSecurityLoading(false)
  }
};

const saveGeneralSettings = async () => {

  try {
    setGeneralLoading(true);
    await updateGeneralSettings({ ...generalSettings, logo });
    toast.success("General settings saved successfully");
  } catch (error) {
    console.error("Failed to save general settings", error);
    toast.error("Failed to save general settings");
  } finally {
    setGeneralLoading(false);
  }
};

const saveMaintenanceSettings = async () => {
  try {
    setMaintenanceLoading(true)
    await updateMaintenanceMode(maintenance);
    toast.success("Maintenance settings saved successfully");
  } catch (error) {
    console.error("Failed to save maintenance settings", error);
    toast.error("Failed to save maintenance settings");
  } finally {
    setMaintenanceLoading(false)
  }
};



  return (
     <ResponsiveLayout title="Settings">
    <div className="w-full px-6 pt-2">
     

      <div className="flex gap-2 border-b border-gray-200 mb-6 mt-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 whitespace-nowrap text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab
                ? "text-orange-600 border-b-2 border-orange-500 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Appearance" && <ThemeSettingsPage />}

      {activeTab === "Personal Information" && (
  <div className="space-y-5">

  
  
{/* Profile Card */}
<div className="bg-white rounded-xl border border-gray-200 p-6">

  {/* Profile Header */}
  <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">

    {/* Profile Photo */}
    <div className="flex flex-col items-center shrink-0">
      <div className="relative h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-semibold overflow-hidden border-2 border-orange-400">
        {editProfile.avatar || profileData.avatar ? (
          <img
            src={editProfile.avatar || profileData.avatar}
            alt="Profile"
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          (profileData.name || "A").trim().charAt(0).toUpperCase()
        )}
      </div>

      <label className="mt-3 text-sm font-medium text-orange-600 cursor-pointer hover:text-orange-700">
        Change Profile Picture
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > 2 * 1024 * 1024) {
  toast.error("Image size must be less than 2MB");
  return;
}
if (file && !file.type.startsWith("image/")) {
  toast.error("Please select a valid image");
  return;
}
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
  const imageData = reader.result;

  if (typeof imageData === "string") {
    setEditProfile((prev) => ({
      ...prev,
      avatar: imageData,
    }));
  }
};

reader.readAsDataURL(file);
          }}
        />
      </label>
    </div>

    {/* Profile Details */}
    <div className="pt-1">
      <h2 className="text-xl font-bold text-gray-900">
        {profileData.name || "Super Admin"}
      </h2>

      <div className="mt-2 inline-block bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
        Super Admin Master Account
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Senior Super Admin & Chief Data Officer
      </p>
    </div>
  </div>

  <div className="border-t border-gray-200 pt-6">

    {/* Profile Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={editProfile.name}
          onChange={(e) =>
            setEditProfile((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={profileData.email}
          readOnly
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm"
        />
      </div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Role
  </label>
  <input
    type="text"
    value={profileData.role}
    readOnly
    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm"
  />
</div>
    </div>
  </div>

  {/* Footer Buttons */}
  <div className="border-t border-gray-200 mt-6 pt-4 flex justify-end gap-4">

    <button
      type="button"
     onClick={() =>
  setEditProfile({
    name: profileData.name,
    avatar: profileData.avatar,
  })
}
      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
    >
      Cancel
    </button>

    <button
      type="button"
      onClick={async (  ) => {
        try {
await updateMyProfile({
  name: editProfile.name,
  avatar: editProfile.avatar,
});
setProfileData((prev) => ({
  ...prev,
  name: editProfile.name,
  avatar: editProfile.avatar,
}));
toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Profile update failed:", error);
          toast.error("Failed to update profile");
        }
      }}
      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2.5 rounded-lg transition-colors"
    >
      Save Profile Changes
    </button>

  </div>
</div>

    {/* Notification Preferences - UNCHANGED */}
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage which notifications you want to receive.
        </p>
      </div>

      {[
        {
          title: "Email Notifications",
          description: "Receive important updates and alerts via email.",
        },
        {
          title: "System Notifications",
          description: "Receive system updates and platform alerts.",
        },
        {
          title: "Security Alerts",
          description: "Get notified about security-related activities.",
        },
      ].map((item) => (
        <label
          key={item.title}
          className="flex items-center justify-between gap-4 border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">
              {item.title}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {item.description}
            </p>
          </div>

         <input
  type="checkbox"
  checked={
    item.title === "Email Notifications"
      ? notificationSettings.channels.email
      : item.title === "System Notifications"
      ? notificationSettings.channels.inApp
      : notificationSettings.events.systemAlerts
  }
  onChange={(e) => {
    if (item.title === "Email Notifications") {
      setNotificationSettings((prev) => ({
        ...prev,
        channels: { ...prev.channels, email: e.target.checked },
      }));
    } else if (item.title === "System Notifications") {
      setNotificationSettings((prev) => ({
        ...prev,
        channels: { ...prev.channels, inApp: e.target.checked },
      }));
    } else {
      setNotificationSettings((prev) => ({
        ...prev,
        events: { ...prev.events, systemAlerts: e.target.checked },
      }));
    }
  }}
  className="w-4 h-4 accent-orange-500 shrink-0"
/>
        </label>
      ))}
<div  className="border-t border-gray-200 my-5"></div>
    {/* Save Profile */}
    <div className="flex justify-end">
     <button
  type="button"
  onClick={async () => {
    try {
      await updateMyNotifications(notificationSettings);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    }
  }}
  className="bg-orange-500 mb-5 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition-colors"
>
  Save Changes
</button>
    </div>
    </div>

  </div>
)}
      {activeTab === "Platform Security" && (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Platform Security
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Configure password and session security policies.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium mb-2">
          
          Session Timeout (minutes)
        </label>
        <select
  value={securitySettings.sessionTimeoutMinutes}
  onChange={(e) =>
    setSecuritySettings({
      ...securitySettings,
      sessionTimeoutMinutes: Number(e.target.value),
    })
  }
  className="w-full border rounded-lg px-3 py-2"
>
  <option value={15}>15 Minutes</option>
  <option value={30}>30 Minutes</option>
  <option value={60}>60 Minutes</option>
  <option value={120}>120 Minutes</option>
</select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Minimum Password Length
        </label>
        <input
          type="number"
          placeholder="12"
          value={securitySettings.passwordMinLength ?? ""}
onChange={(e) =>
  setSecuritySettings({
    ...securitySettings,
    passwordMinLength: Number(e.target.value),
  })
}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Maximum Failed Login Attempts
        </label>
        <input
          type="number"
          placeholder="5"
          value={securitySettings.maxLoginAttempts ?? ""}
onChange={(e) =>
  setSecuritySettings({
    ...securitySettings,
    maxLoginAttempts: Number(e.target.value),
  })
}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Lockout Duration (minutes)
        </label>
        <input
          type="number"
          placeholder="30"
          value={securitySettings.lockoutDuration ?? ""}
onChange={(e) =>
  setSecuritySettings({
    ...securitySettings,
    lockoutDuration: Number(e.target.value),
  })
}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
    </div>

    <div className="border rounded-lg p-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
  type="checkbox"
  checked={securitySettings.requirePasswordComplexity ?? false}
  onChange={(e) =>
    setSecuritySettings({
      ...securitySettings,
      requirePasswordComplexity: e.target.checked,
    })
  }
  className="w-4 h-4 accent-orange-500"
/>
        <span className="text-sm font-medium">Require Password Complexity</span>
      </label>
      <p className="text-sm text-gray-500 mt-1 ml-7">
        Require uppercase, lowercase, numbers and special characters.
      </p>
    </div>

    <button
  onClick={saveSecuritySettings}
  disabled={securityLoading}
  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
>
  {securityLoading ? "Saving..." : "Save Security Settings"}
</button>
  </div>
)}

     
{activeTab === "General & Maintenance" && (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      saveGeneralSettings();
    }}
    className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
  >    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        General & Maintenance
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Manage platform information and maintenance mode.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium mb-2">
          System Name
        </label>
        <input
          type="text"
          placeholder="DBMS Super Admin"
    required
minLength={2}
onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  input.setCustomValidity(
    input.value.trim() === ""
      ? "System Name is required"
      : "Enter at least 2 characters"
  );
}}
onInput={(e: React.FormEvent<HTMLInputElement>) => {
  e.currentTarget.setCustomValidity("");
}}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={generalSettings.appName}
onChange={(e) =>
  setGeneralSettings({ ...generalSettings, appName: e.target.value })
}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Support Email
        </label>
        <input
          type="email"
          placeholder="support@example.com"
          value={generalSettings.supportEmail}
onChange={(e) =>
  setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
    </div>
    <div className="mt-4">
  <label className="block text-sm font-medium mb-2">
    Platform Logo
  </label>

  <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-3">
    <input
      type="text"
      placeholder="Enter logo URL"
      value={logo}
      onChange={(e) => setLogo(e.target.value)}
      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
    />

    {logo && (
      <div className="h-12 w-12 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center p-2">
        <img
          src={logo}
          alt="Platform Logo"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )}
  </div>
</div>
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">
          Maintenance Mode
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Temporarily restrict platform access during maintenance.
        </p>
      </div>
     <button
  type="button"
  onClick={() =>
    setMaintenance({
      ...maintenance,
      enabled: !maintenance.enabled,
    })
  }
  className={`relative w-11 h-6 rounded-full transition-colors ${
    maintenance.enabled ? "bg-orange-500" : "bg-gray-300"
  }`}
>
  <span
    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
      maintenance.enabled ? "translate-x-5" : "translate-x-0"
    }`}
  />
</button>
    </div>
    <div>
  <label className="block text-sm font-medium mb-2">
    Maintenance Message
  </label>
  <textarea
    value={maintenance.message}
    onChange={(e) =>
      setMaintenance({ ...maintenance, message: e.target.value })
    }
    placeholder="Enter maintenance message"
    className="w-full border border-gray-300 rounded-lg px-3 py-2"
    rows={3}
  />
</div>
    <button
  onClick={saveMaintenanceSettings}
  disabled={maintenanceLoading}
  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 mr-10 rounded-lg disabled:opacity-50"
>
  {maintenanceLoading ? "Saving..." : "Save Maintenance Settings"}
</button>

{/* General Settings Save */}
<button
  type="submit"
  disabled={generalLoading}
  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
>
  {generalLoading ? "Saving..." : "Save General Settings"}
</button>

    </form>
)}

       </div>
  </ResponsiveLayout>
  );
}