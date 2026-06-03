import {
  CloudUpload,
  FileText
} from "lucide-react";

export default function UploadScreen({
  onFileSelect
}) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-5xl">
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="min-h-[620px] rounded-xl border border-dashed border-[#94a3b8] bg-white flex items-center justify-center shadow-sm"
        >
          <div className="w-full max-w-md text-center px-6">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <CloudUpload
                size={34}
                className="text-blue-600"
              />
            </div>

            <h1 className="text-2xl font-bold text-[#111827]">
              Upload your PDF
            </h1>

            <p className="mt-3 text-xs text-[#6b7280]">
              Works best with text-based PDFs. Scanned or image-only PDFs are not supported yet.
            </p>

            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
              Drag and drop your PDF here, or choose a file from your computer
              to start editing.
            </p>

            <label className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700">
              <FileText size={17} />
              Choose PDF

              <input
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
              />
            </label>

            <p className="mt-4 text-xs text-[#9ca3af]">
              Your file stays in the browser. No server upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}