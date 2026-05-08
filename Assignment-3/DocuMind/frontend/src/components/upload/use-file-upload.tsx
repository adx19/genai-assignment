import { useState } from "react";

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    setFile(uploadedFile);
  };

  return {
    file,
    setFile,
    onDrop,
  };
}
