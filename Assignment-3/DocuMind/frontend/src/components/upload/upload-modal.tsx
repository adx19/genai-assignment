"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  IconFileText,
  IconUpload,
  IconX,
} from "@tabler/icons-react";

import { useDropzone } from "react-dropzone";
import { useFileUpload } from "./use-file-upload";

type UploadModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function UploadModal({
  open,
  setOpen,
}: UploadModalProps) {
  const { file, setFile, onDrop } = useFileUpload();

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
      },
    });

  const handleUpload = async () => {
    if (!file || uploading) return;

    try {
      setUploading(true);
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://genai-assignment-dotk.onrender.com/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      window.dispatchEvent(new Event("documentsUpdated"));

      const data = await response.json();
      console.log(data);

      setStatus("success");

      // reset + close modal after short delay
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setStatus("idle");
      }, 800);
    } catch (err) {
      console.error(err);
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 1500);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-white/10 bg-[#0a0a0a] text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Upload Document
          </DialogTitle>
        </DialogHeader>

        {!file ? (
          <div
            {...getRootProps()}
            className={`
              mt-6
              border-2
              border-dashed
              rounded-3xl
              p-16
              flex
              flex-col
              items-center
              justify-center
              text-center
              transition
              cursor-pointer
              bg-white/[0.02]

              ${
                isDragActive
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 hover:border-violet-500/50"
              }
            `}
          >
            <input {...getInputProps()} />

            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-5">
              <IconUpload size={30} />
            </div>

            <h2 className="text-xl font-semibold">
              {isDragActive
                ? "Drop your document"
                : "Drag & Drop your PDF"}
            </h2>

            <p className="text-white/50 mt-2">
              Upload PDFs or text documents for AI analysis
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <IconFileText size={28} />
                </div>

                <div>
                  <h2 className="font-medium">
                    {file.name}
                  </h2>
                  <p className="text-sm text-white/40">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Status UI */}
            {status === "uploading" && (
              <p className="text-sm text-white/50 mt-3">
                Processing document...
              </p>
            )}

            {status === "success" && (
              <p className="text-sm text-green-400 mt-3">
                Upload successful!
              </p>
            )}

            {status === "error" && (
              <p className="text-sm text-red-400 mt-3">
                Upload failed. Try again.
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="
                mt-6
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-violet-600
                to-blue-600
                py-4
                font-medium
                hover:scale-[1.01]
                transition
                disabled:opacity-50
              "
            >
              {status === "uploading" && "Processing..."}
              {status === "success" && "Done ✓"}
              {status === "error" && "Try Again"}
              {status === "idle" && "Process Document"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
