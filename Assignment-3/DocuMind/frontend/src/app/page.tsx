"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar/sidebar";
import ChatArea from "@/components/chat/chat-area";
import Topbar from "@/components/chat/topbar";

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main
      className="
        flex
        h-screen
        bg-[#030303]
        text-white
        overflow-hidden
      "
    >
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          toggleSidebar={() =>
            setMobileOpen(true)
          }
        />

        <ChatArea />
      </div>
    </main>
  );
}
