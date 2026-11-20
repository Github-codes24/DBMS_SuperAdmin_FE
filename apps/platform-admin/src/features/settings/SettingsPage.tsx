import { useState,useEffect } from "react";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import ThemeSettingsPage from "./ThemeSettingsPage";
import { useToast } from "../../context";
import {
  getSecuritySettings,
  updateSecuritySettings,
  updateMaintenanceMode,
  updateGeneralSettings,
  getPlatformSettings
} from "./settingsService";

const tabs = ["Appearance", "Platform Security", "General & Maintenance"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Appearance");
  const { toast } = useToast();
 const [securitySettings, setSecuritySettings] = useState<any>({passwordMinLength: 10,sessionTimeoutMinutes: 30,maxLoginAttempts: 3,lockoutDuration: 30,requirePasswordComplexity: false,});
  const [generalSettings, setGeneralSettings] = useState({appName: "",supportEmail: "",});
  const [maintenance, setMaintenance] = useState({enabled: true,message: "System maintenance in progress",});
  const [securityLoading, setSecurityLoading] = useState(false);
const [generalLoading, setGeneralLoading] = useState(false);
const [maintenanceLoading, setMaintenanceLoading] = useState(false);

useEffect(() => {
  if (activeTab === "Platform Security") {
    loadSecuritySettings();
  }
}, [activeTab]);

useEffect(() => {
  const loadMaintenanceSettings = async () => {
    try {
      const data = await getPlatformSettings();

      const savedMaintenance =
        data?.data?.maintenance ??
        data?.maintenance ??
        data?.data?.platform?.maintenance ??
        data?.platform?.maintenance;

      if (savedMaintenance) {
        setMaintenance({
          enabled: savedMaintenance.enabled,
          message: savedMaintenance.message || "",
        });
      }
    } catch (error) {
      console.error("Failed to load maintenance settings", error);
    }
  };

  loadMaintenanceSettings();
}, []);

const loadSecuritySettings = async () => {
  try {
    setSecurityLoading(true)
    const data = await getSecuritySettings();
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
    await updateGeneralSettings(generalSettings);
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
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
    <div>
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
  onClick={saveGeneralSettings}
  disabled={generalLoading}
  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
>
  {generalLoading ? "Saving..." : "Save General Settings"}
</button>

  </div>
)}

       </div>
  </ResponsiveLayout>
  );
}