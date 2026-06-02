import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function LeftPagesSidebar({
  fileUrl,
  pages,
  selectedPage,
  setSelectedPage
}) {
  return (
    <aside className="border-r border-[#e5e7eb] bg-white flex flex-col">
      <div className="h-10 border-b border-[#e5e7eb] flex items-center justify-center">
        <p className="text-xs font-semibold text-[#6b7280]">
          Pages
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {!fileUrl && (
          <p className="text-center text-xs text-[#9ca3af] mt-4">
            No PDF
          </p>
        )}

        {fileUrl && (
          <Document
            file={fileUrl}
            loading={null}
          >
            {pages.map((page) => {
              const active = selectedPage === page;

              return (
                <button
                  key={page}
                  onClick={() => setSelectedPage(page)}
                  className={`
                    mx-auto block rounded-md border bg-white p-1 transition
                    ${
                      active
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-[#d1d5db] hover:border-blue-400"
                    }
                  `}
                >
                  <Page
                    pageNumber={page}
                    width={48}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />

                  <p className="mt-1 text-center text-[10px] font-semibold text-[#6b7280]">
                    {page}
                  </p>
                </button>
              );
            })}
          </Document>
        )}
      </div>
    </aside>
  );
}