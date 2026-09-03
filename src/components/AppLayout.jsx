import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { NotificationToasts } from "./NotificationCenter";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  useEffect(() => {
    const closeOnOutsidePointer = (event) => {
      if (event.target.closest("[data-sidebar-toggle]")) return;
      if (sidebarOpen && !sidebarRef.current?.contains(event.target)) setSidebarOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [sidebarOpen]);
  return <div className="app-layout"><Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((current) => !current)} /><div className="app-body"><Sidebar ref={sidebarRef} open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><main className="content">{children}</main></div><NotificationToasts /></div>;
}
