import { useState } from "react";

import {
  FileText,
  FolderOpen,
  ChevronDown,
  Search,
  Printer,
  Save,
  Download,
  Trash2,
  X
} from "lucide-react";

export default function TopBar({
  hasFile,
  fileName,
  recentFiles = [],
  onOpenPreviousFile,
  onDeletePreviousFile,
  onClearAllFiles,
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
            <div className="absolute left-0 top-12 z-50 w-[360px] rounded-xl border border-[#e5e7eb] bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
                <p className="text-sm font-bold text-[#111827]">
                  Local files
                </p>

                <button
                  onClick={() => {
                    onClearAllFiles?.();
                    setOpen(false);
                  }}
                  disabled={recentFiles.length === 0}
                  className={`
                    flex items-center gap-1 text-xs font-bold
                    ${recentFiles.length === 0
                      ? "text-[#9ca3af] cursor-not-allowed"
                      : "text-red-600 hover:text-red-700"
                    }
                  `}
                >
                  <Trash2 size={14} />
                  Clear all
                </button>
              </div>
              {recentFiles.length === 0 ? (
                <div className="p-4 text-sm text-[#6b7280]">
                  No previous files
                </div>
              ) : (
                <div className="max-h-[340px] overflow-y-auto">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 border-b border-[#f3f4f6] hover:bg-[#f9fafb]"
                    >
                      <button
                        onClick={() => {
                          onOpenPreviousFile(file.id);
                          setOpen(false);
                        }}
                        className="min-w-0 flex-1 px-4 py-3 text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {file.name}
                        </p>

                        <p className="text-xs text-[#6b7280]">
                          {Math.round(file.size / 1024)} KB
                        </p>
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeletePreviousFile?.(file.id);
                        }}
                        title="Delete this local file"
                        className="mr-3 h-8 w-8 rounded-md flex items-center justify-center text-[#9ca3af] hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
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
            ${hasFile
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