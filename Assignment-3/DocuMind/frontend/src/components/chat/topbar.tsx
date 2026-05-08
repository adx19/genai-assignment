"use client";

import { IconMenu2 } from "@tabler/icons-react";

type TopbarProps = {
  toggleSidebar: () => void;
};

export default function Topbar({
  toggleSidebar,
}: TopbarProps) {
  return (
    <div
      className="
        lg:hidden
        flex
        items-center
        justify-between
        px-5
        py-4
        border-b
        border-white/10
        bg-black/30
        backdrop-blur-xl
      "
    >
      <button
        onClick={toggleSidebar}
        className="
          p-2
          rounded-xl
          bg-white/5
          border
          border-white/10
        "
      >
        <IconMenu2 size={22} />
      </button>

      <h1 className="font-semibold text-lg">
        DocuMind
      </h1>

      <div className="w-10" />
    </div>
  );
}
