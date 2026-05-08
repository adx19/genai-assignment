"use client";

import { motion } from "framer-motion";

import {
  IconFileText,
  IconPlus,
  IconSparkles,
  IconX,
  IconClock,
} from "@tabler/icons-react";

import {
  useEffect,
  useState,
} from "react";

import UploadModal from "../upload/upload-modal";

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

type DocumentType = {
  id: string;
  filename: string;
  status: string;
  uploadedAt?: string;
};

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const [open, setOpen] = useState(false);

  const [documents, setDocuments] =
    useState<DocumentType[]>([]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/documents"
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch documents"
        );
      }

      const data = await res.json();

      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const interval = setInterval(() => {
      fetchDocuments();
    }, 2000);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <>
      <UploadModal
        open={open}
        setOpen={setOpen}
      />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            z-40
            lg:hidden
          "
        />
      )}

      <motion.div
        initial={{
          x: -40,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className={`
          fixed lg:relative z-50
          h-full
          w-[300px]
          border-r
          border-white/10
          bg-[#090909]/95
          backdrop-blur-2xl
          flex
          flex-col
          overflow-hidden
          transition-transform
          duration-300
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Top Section */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="
                  h-11
                  w-11
                  rounded-2xl
                  bg-gradient-to-br
                  from-violet-500
                  to-blue-500
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-violet-500/20
                "
              >
                <IconSparkles size={22} />
              </div>

              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  DocuMind
                </h1>

                <p className="text-xs text-white/40">
                  AI Document Workspace
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setMobileOpen(false)
              }
              className="
                lg:hidden
                text-white/60
                hover:text-white
                transition
              "
            >
              <IconX size={22} />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setOpen(true)}
            className="
              mt-6
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-blue-600
              p-4
              flex
              items-center
              justify-center
              gap-2
              font-medium
              hover:scale-[1.02]
              transition
              shadow-lg
              shadow-violet-500/20
            "
          >
            <IconPlus size={18} />
            Upload Document
          </button>
        </div>

        {/* Documents */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Documents
            </p>

            <div className="text-xs text-white/30">
              {documents.length}
            </div>
          </div>

          {documents.length === 0 ? (
            <div
              className="
                h-[220px]
                rounded-3xl
                border
                border-dashed
                border-white/10
                bg-white/[0.02]
                flex
                items-center
                justify-center
                text-center
                px-6
              "
            >
              <div>
                <IconFileText
                  size={34}
                  className="mx-auto mb-4 text-white/20"
                />

                <p className="text-sm text-white/40 leading-relaxed">
                  Upload a document to
                  start chatting with AI
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{
                    scale: 1.02,
                  }}
                  className="
                    group
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                    cursor-pointer
                    transition
                    hover:bg-white/[0.06]
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        h-10
                        w-10
                        rounded-2xl
                        bg-white/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <IconFileText
                        size={18}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2
                        className="
                          text-sm
                          font-medium
                          truncate
                          text-white/90
                        "
                      >
                        {doc.filename}
                      </h2>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />

                        <p className="text-xs text-white/40">
                          {doc.status}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-white/25">
                        <IconClock
                          size={12}
                        />

                        <p className="text-[11px]">
                          Current session
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div
          className="
            p-5
            border-t
            border-white/10
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-4
            "
          >
            <p className="text-sm text-white/60 leading-relaxed">
              Built with Next.js,
              Express, Groq & RAG AI
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
