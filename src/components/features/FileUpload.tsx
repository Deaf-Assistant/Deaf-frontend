"use client";

import { useState, useRef, useEffect } from "react";

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File|null) => void;
  label?: string;
  type: "image" | "video";
  preview?: string;
}

export default function FileUpload({
  accept,
  maxSize,
  onFileSelect,
  label,
  type,
  preview,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  // ⭐ sync preview from parent
  useEffect(() => {
    setPreviewUrl(preview || null);
  }, [preview]);

  // — Paste listener: fires when this zone is hovered/focused —
  useEffect(() => {
    if (!isFocused) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const validateFile = (file: File): boolean => {
    setError("");

    if (file.size > maxSize) {
      setError(`ไฟล์ใหญ่เกินไป`);
      return false;
    }

    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    const isValid = acceptedTypes.some((type) =>
      type.startsWith(".")
        ? fileName.endsWith(type)
        : fileType === type,
    );

    if (!isValid) {
      setError("ประเภทไฟล์ไม่ถูกต้อง");
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    onFileSelect(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => inputRef.current?.click();

  const handleRemove = () => {
    setPreviewUrl(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onFileSelect(null);
  };

  // ── Drag handlers ──────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();   // ← critical: prevents browser from opening the file
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();   // ← critical: prevents browser from opening the file
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      {label && <label className="block mb-2 font-medium">{label}</label>}

      <div
        ref={zoneRef}
        onClick={handleClick}
        onMouseEnter={() => setIsFocused(true)}
        onMouseLeave={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-150 outline-none ${dragActive
          ? "border-blue-400 bg-blue-50"
          : isFocused
            ? "border-indigo-300 bg-indigo-50/40"
            : "border-gray-300 hover:border-gray-400"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <>
            {type === "image" ? (
              <img src={previewUrl} className="mx-auto rounded-lg" />
            ) : (
              <video src={previewUrl} controls className="mx-auto rounded-lg" />
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              ลบไฟล์
            </button>
          </>
        ) : (
          <div className="pointer-events-none select-none space-y-1">
            <p className="text-gray-500">
              {dragActive ? "วางไฟล์ที่นี่ได้เลย 📂" : "คลิกหรือลากไฟล์มาวางที่นี่"}
            </p>
            {type === "image" && !dragActive && (
              <p className="text-xs text-gray-400">หรือ Ctrl+V เพื่อวางรูปจาก clipboard</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

    </div>
  );
}
