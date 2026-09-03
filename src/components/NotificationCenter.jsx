import { useState } from "react";
import assets from "../data/assets";
import { useNotifications } from "../context/NotificationContext";

const eventTypes = [
  ["priceUp", "Price Up"],
  ["priceDown", "Price Down"],
  ["buy", "Buy"],
  ["sell", "Sell"],
  ["autoBuy", "Auto-Buy"],
  ["autoSell", "Auto-Sell"],
];

export function NotificationToasts() {
  const { toastNotifications, removeNotification } = useNotifications();
  return <div className="notification-toasts" role="status" aria-live="polite">{toastNotifications.map((notification) => <div key={notification.id} className={`notification notification-${notification.type}`}><div className="notification-content"><strong>{notification.title}</strong><p>{notification.message}</p></div><button type="button" onClick={() => removeNotification(notification.id)}>×</button></div>)}</div>;
}

export default function NotificationCenter() {
  const { notifications, removeNotification, clearNotifications, preferences, togglePreference, setAllPreferences, setAssetPreferences } = useNotifications();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return <div className="notification-center">
    <button type="button" className="notification-bell" aria-label="Open notifications" onClick={() => setOpen((current) => !current)}>🔔{notifications.length > 0 && <span>{notifications.length > 99 ? "99+" : notifications.length}</span>}</button>
    {open && <div className="notification-panel">
      <div className="notification-panel-header"><strong>Notifications</strong><div><button type="button" className="secondary-button" onClick={clearNotifications} disabled={!notifications.length}>Clear</button><button type="button" className="secondary-button" onClick={() => setSettingsOpen((current) => !current)}>{settingsOpen ? "Close Settings" : "Settings"}</button></div></div>
      {settingsOpen ? <div className="notification-settings">
        <p>Toggle Bell and Toast separately for every asset and event.</p>
        <div className="notification-settings-actions"><strong>All Assets</strong><div><button type="button" className="secondary-button" onClick={() => setAllPreferences("notification", true)}>Select All Bell</button><button type="button" className="secondary-button" onClick={() => setAllPreferences("notification", false)}>Deselect All Bell</button><button type="button" className="secondary-button" onClick={() => setAllPreferences("toast", true)}>Select All Toast</button><button type="button" className="secondary-button" onClick={() => setAllPreferences("toast", false)}>Deselect All Toast</button></div></div>
        <div className="notification-settings-header"><span>Asset / Event</span><span>Bell All</span><span>Toast All</span></div>
        {assets.map((asset) => {
          const assetPreferences = preferences[asset.id];
          const bellAll = eventTypes.every(([category]) => assetPreferences?.notification[category] !== false);
          const toastAll = eventTypes.every(([category]) => assetPreferences?.toast[category] !== false);
          return <div key={asset.id} className="notification-asset-settings">
            <div className="notification-asset-header"><strong>{asset.name} ({asset.symbol})</strong><label><span>Bell All</span><input type="checkbox" checked={bellAll} onChange={(event) => setAssetPreferences(asset.id, "notification", event.target.checked)} /></label><label><span>Toast All</span><input type="checkbox" checked={toastAll} onChange={(event) => setAssetPreferences(asset.id, "toast", event.target.checked)} /></label></div>
            {eventTypes.map(([category, label]) => <div className="notification-setting-row" key={category}><span>{label}</span><label><input type="checkbox" checked={assetPreferences?.notification[category] !== false} onChange={() => togglePreference(asset.id, "notification", category)} /></label><label><input type="checkbox" checked={assetPreferences?.toast[category] !== false} onChange={() => togglePreference(asset.id, "toast", category)} /></label></div>)}
          </div>;
        })}
      </div> : <div className="notification-list">{notifications.length ? notifications.map((notification) => <div key={notification.id} className={`notification notification-${notification.type}`}><div className="notification-content"><strong>{notification.title}</strong><p>{notification.message}</p><small>{new Date(notification.createdAt).toLocaleTimeString()}</small></div><button type="button" onClick={() => removeNotification(notification.id)}>×</button></div>) : <p className="muted">No notifications yet.</p>}</div>}
    </div>}
  </div>;
}
