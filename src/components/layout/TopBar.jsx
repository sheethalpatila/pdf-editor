import { useState } from "react";

import {
  FileText,
  FolderOpen,
  ChevronDown,
  Search,
  Printer,
  Save,
  Download
} from "lucide-react";

export default function TopBar({
  hasFile,
  fileName,
  recentFiles = [],
  onOpenPreviousFile,
  onDownload
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 border-b border-[#e5e7eb] bg-white px-5 flex items-center justify-between">
      <div className="flex items-center gap-7">
        <div className="flex items-center gap-3">
          <FileText
            size={24}
            className="text-blue-600"
          />

          <h1 className="text-[22px] font-bold text-[#111827]">
            DocPrecision
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="h-10 px-4 rounded-lg border border-[#d1d5db] bg-white text-[#111827] flex items-center gap-2 text-sm font-semibold hover:bg-[#f9fafb]"
          >
            <FolderOpen size={17} />
            Previously Opened
            <ChevronDown size={15} />
          </button>

          {open && (
            <div className="absolute left-0 top-12 z-50 w-[330px] rounded-xl border border-[#e5e7eb] bg-white shadow-xl overflow-hidden">
              {recentFiles.length === 0 ? (
                <div className="p-4 text-sm text-[#6b7280]">
                  No previous files
                </div>
              ) : (
                recentFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onOpenPreviousFile(file.id);
                      setOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#f9fafb] border-b border-[#f3f4f6]"
                  >
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {file.name}
                    </p>

                    <p className="text-xs text-[#6b7280]">
                      {Math.round(file.size / 1024)} KB
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {fileName && (
          <div className="max-w-[260px] truncate rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm font-medium text-[#374151]">
            {fileName}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="h-10 w-[220px] rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3 flex items-center gap-2">
          <Search
            size={18}
            className="text-[#6b7280]"
          />

          <input
            placeholder="Search..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#6b7280]"
          />
        </div>

        <button
          onClick={() => window.print()}
          className="text-[#111827] hover:text-blue-600"
        >
          <Printer size={22} />
        </button>

        <button className="text-[#111827] hover:text-blue-600">
          <Save size={21} />
        </button>

        <button
          disabled={!hasFile}
          onClick={onDownload}
          className={`
            h-10 px-6 rounded-lg text-sm font-bold flex items-center gap-2
            ${
              hasFile
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
            }
          `}
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </header>
  );
}