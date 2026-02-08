"use client";

import { useState, useRef, useEffect } from "react";

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File) => void;
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
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⭐ จุดสำคัญ: sync preview จาก parent
  useEffect(() => {
    setPreviewUrl(preview || null);
  }, [preview]);

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
  };

  return (
    <div className="w-full">
      {label && <label className="block mb-2 font-medium">{label}</label>}

      <div
        onClick={handleClick}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
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
          <p>คลิกหรือลากไฟล์มาวางที่นี่</p>
        )}
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
