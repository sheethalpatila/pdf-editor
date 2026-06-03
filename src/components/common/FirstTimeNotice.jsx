import {
  CheckCircle2,
  FileText,
  MousePointer2,
  Search,
  ShieldCheck,
  Upload,
  X
} from "lucide-react";

export default function FirstTimeNotice({
  onClose
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText
                size={24}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                Welcome to DocPrecision
              </h2>

              <p className="text-sm text-[#6b7280]">
                Browser-only PDF editor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
            <ShieldCheck
              size={22}
              className="shrink-0 text-emerald-600 mt-0.5"
            />

            <div>
              <p className="text-sm font-bold text-[#111827]">
                Your files stay in your browser
              </p>

              <p className="mt-1 text-sm leading-6 text-[#4b5563]">
                Uploaded PDFs are stored locally using browser IndexedDB.
                Files are not uploaded to our server, Vercel, Firebase,
                or any external database.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-sm font-bold text-[#111827] mb-2">
              Scanned PDFs are not supported yet
            </p>

            <p className="text-sm leading-6 text-[#4b5563]">
              This editor works best with text-based PDFs where text is
              selectable and searchable. Image-only or scanned PDFs need OCR,
              which is not added in this version.
            </p>
          </div>

          <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4">
            <p className="text-sm font-bold text-[#111827] mb-3">
              Quick navigation guide
            </p>

            <div className="space-y-3">
              <GuideItem
                icon={Upload}
                title="Upload"
                description="Upload a text-based PDF from your browser."
              />

              <GuideItem
                icon={MousePointer2}
                title="Select and edit"
                description="Use Select to move, resize, update, or delete added elements."
              />

              <GuideItem
                icon={FileText}
                title="Edit PDF text"
                description="Use Edit Text to click selectable PDF text. The app covers old text and places editable replacement text."
              />

              <GuideItem
                icon={Search}
                title="Search"
                description="Use the search box to find text inside text-based PDFs."
              />

              <GuideItem
                icon={CheckCircle2}
                title="Download or print"
                description="Download or print the edited PDF only, not the whole browser page."
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4">
            <p className="text-sm font-bold text-[#111827] mb-2">
              Local storage note
            </p>

            <p className="text-sm leading-6 text-[#4b5563]">
              Files are available only in the same browser and same website.
              If you clear site data, use another browser, another device, or
              another domain, those local files will not be available.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb] flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideItem({
  icon: Icon,
  title,
  description
}) {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-center">
        <Icon
          size={17}
          className="text-blue-600"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-[#111827]">
          {title}
        </p>

        <p className="text-sm leading-5 text-[#6b7280]">
          {description}
        </p>
      </div>
    </div>
  );
}