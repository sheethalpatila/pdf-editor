import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Document,
  Page,
  pdfjs
} from "react-pdf";

import TextOverlay from "../editor/TextOverlay";
import CoverOverlay from "../editor/CoverOverlay";
import HighlightOverlay from "../editor/HighlightOverlay";
import ImageOverlay from "../editor/ImageOverlay";
import DetectedTextLayer from "../editor/DetectedTextLayer";

import { extractPdfTextItems } from "../../utils/extractPdfText";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PAGE_WIDTH = 820;

export default function EditorScreen({
  fileRecord,
  fileUrl,
  activeTool,
  setActiveTool,
  selectedPage,
  setSelectedPage,
  setSelectedElement,
  setNumPages,
  edits,
  setEdits,
  setPageViewports,
  searchResults = [],
  activeSearchIndex = -1
}) {
  const pageWrapperRef = useRef(null);

  const [detectedTextItems, setDetectedTextItems] =
    useState([]);

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);

    if (selectedPage > numPages) {
      setSelectedPage(1);
    }
  };

  const pageEdits = edits.filter(
    (edit) => edit.pageNumber === selectedPage
  );

  const pageSearchResults = searchResults.filter(
    (result) => result.pageNumber === selectedPage
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDetectedText() {
      if (
        !fileUrl ||
        !selectedPage ||
        activeTool !== "editText"
      ) {
        setDetectedTextItems([]);
        return;
      }

      try {
        const items = await extractPdfTextItems({
          fileUrl,
          pageNumber: selectedPage,
          renderWidth: PAGE_WIDTH
        });

        if (!cancelled) {
          setDetectedTextItems(items);
        }
      } catch (error) {
        console.error(
          "Failed to extract PDF text:",
          error
        );

        if (!cancelled) {
          setDetectedTextItems([]);
        }
      }
    }

    loadDetectedText();

    return () => {
      cancelled = true;
    };
  }, [
    fileUrl,
    selectedPage,
    activeTool
  ]);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const addImageLikeEdit = async ({
    x,
    y,
    type
  }) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/png,image/jpeg,image/jpg";

    input.onchange = async () => {
      const imageFile = input.files?.[0];

      if (!imageFile) return;

      const src = await fileToDataUrl(imageFile);

      const newImage = {
        id: crypto.randomUUID(),
        type,
        pageNumber: selectedPage,
        x,
        y,
        width: type === "sign" ? 180 : 220,
        height: type === "sign" ? 70 : 140,
        src,
        selected: true
      };

      setEdits((prev) => {
        const updated = [
          ...prev.map((edit) => ({
            ...edit,
            selected: false
          })),
          newImage
        ];

        setSelectedElement(newImage);
        setActiveTool("select");

        return updated;
      });
    };

    input.click();
  };

  const handlePageClick = async (event) => {
    const pageContainer = event.currentTarget;
    const rect = pageContainer.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (activeTool === "text") {
      const newText = {
        id: crypto.randomUUID(),
        type: "text",
        pageNumber: selectedPage,
        x,
        y,
        text: "New text",
        fontSize: 18,
        color: "#111827",
        selected: true
      };

      setEdits((prev) => {
        const updated = [
          ...prev.map((edit) => ({
            ...edit,
            selected: false
          })),
          newText
        ];

        setSelectedElement(newText);
        setActiveTool("select");

        return updated;
      });

      return;
    }

    if (activeTool === "cover") {
      const newCover = {
        id: crypto.randomUUID(),
        type: "cover",
        pageNumber: selectedPage,
        x,
        y,
        width: 160,
        height: 38,
        color: "#ffffff",
        selected: true
      };

      setEdits((prev) => {
        const updated = [
          ...prev.map((edit) => ({
            ...edit,
            selected: false
          })),
          newCover
        ];

        setSelectedElement(newCover);
        setActiveTool("select");

        return updated;
      });

      return;
    }

    if (activeTool === "highlight") {
      const newHighlight = {
        id: crypto.randomUUID(),
        type: "highlight",
        pageNumber: selectedPage,
        x,
        y,
        width: 180,
        height: 28,
        color: "#facc15",
        opacity: 0.35,
        selected: true
      };

      setEdits((prev) => {
        const updated = [
          ...prev.map((edit) => ({
            ...edit,
            selected: false
          })),
          newHighlight
        ];

        setSelectedElement(newHighlight);
        setActiveTool("select");

        return updated;
      });

      return;
    }

    if (activeTool === "image") {
      await addImageLikeEdit({
        x,
        y,
        type: "image"
      });

      return;
    }

    if (activeTool === "sign") {
      await addImageLikeEdit({
        x,
        y,
        type: "sign"
      });

      return;
    }

    setEdits((prev) =>
      prev.map((edit) => ({
        ...edit,
        selected: false
      }))
    );

    setSelectedElement(null);
  };

  const handleSelect = (selectedEdit) => {
    setEdits((prev) => {
      const updated = prev.map((edit) => ({
        ...edit,
        selected: edit.id === selectedEdit.id
      }));

      const latestSelected = updated.find(
        (edit) => edit.id === selectedEdit.id
      );

      setSelectedElement(latestSelected || null);

      return updated;
    });
  };

  const handleUpdate = (id, updates) => {
    setEdits((prev) => {
      const updated = prev.map((edit) =>
        edit.id === id
          ? {
            ...edit,
            ...updates
          }
          : edit
      );

      const selected = updated.find(
        (edit) => edit.id === id
      );

      if (selected?.selected) {
        setSelectedElement(selected);
      }

      return updated;
    });
  };

  const handleDelete = (id) => {
    setEdits((prev) =>
      prev.filter((edit) => edit.id !== id)
    );

    setSelectedElement(null);
  };

  const updateMainPageViewport = () => {
    window.requestAnimationFrame(() => {
      if (!pageWrapperRef.current) return;

      const rect =
        pageWrapperRef.current.getBoundingClientRect();

      setPageViewports((prev) => ({
        ...prev,
        [selectedPage]: {
          width: rect.width,
          height: rect.height
        }
      }));
    });
  };

  const handleDetectedTextClick = (item) => {
    const paddingX = 3;
    const paddingY = 2;

    const coverEdit = {
      id: crypto.randomUUID(),
      type: "cover",
      pageNumber: selectedPage,
      x: item.x - paddingX,
      y: item.y - paddingY,
      width: item.width + paddingX * 2,
      height: item.height + paddingY * 2,
      color: "#ffffff",
      selected: false,
      source: "detectedText"
    };

    const replacementText = {
      id: crypto.randomUUID(),
      type: "text",
      pageNumber: selectedPage,
      x: item.x,
      y: item.y,
      width: item.width,
      height: Math.max(
        item.height + 8,
        (item.fontSize || 12) * 1.4
      ),
      text: item.text,
      originalText: item.text,
      fontSize: Math.max(
        8,
        Math.round((item.fontSize || 12) * 0.95)
      ),
      color: item.color || "#111827",
      fontWeight: item.fontWeight || "normal",
      fontStyle: item.fontStyle || "normal",
      fontFamily: item.fontFamily || "Times New Roman",
      selected: true,
      source: "detectedText"
    };

    setEdits((prev) => {
      const updated = [
        ...prev.map((edit) => ({
          ...edit,
          selected: false
        })),
        coverEdit,
        replacementText
      ];

      setSelectedElement(replacementText);
      setActiveTool("select");

      return updated;
    });
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              {fileRecord?.name}
            </h2>

            <p className="text-xs text-[#6b7280]">
              Active tool: {activeTool}
            </p>
          </div>

          <p className="text-xs font-bold text-[#6b7280]">
            Page {selectedPage}
          </p>
        </div>

        <div className="flex justify-center pb-20">
          <Document
            file={fileUrl}
            onLoadSuccess={handleLoadSuccess}
            loading={
              <div className="rounded-lg bg-white p-6 shadow-sm text-sm text-[#6b7280]">
                Loading PDF...
              </div>
            }
            error={
              <div className="rounded-lg bg-red-50 p-6 text-sm text-red-600">
                Failed to load PDF.
              </div>
            }
          >
            <div
              ref={pageWrapperRef}
              onClick={handlePageClick}
              className={`
                relative inline-block bg-white shadow-xl
                ${activeTool === "text"
                  ? "cursor-text"
                  : activeTool === "cover" ||
                    activeTool === "highlight" ||
                    activeTool === "image" ||
                    activeTool === "sign" ||
                    activeTool === "editText"
                    ? "cursor-crosshair"
                    : "cursor-default"
                }
              `}
            >
              <Page
                pageNumber={selectedPage}
                width={PAGE_WIDTH}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onRenderSuccess={updateMainPageViewport}
              />

              {pageEdits.map((edit) => {
                if (edit.type === "cover") {
                  return (
                    <CoverOverlay
                      key={edit.id}
                      edit={edit}
                      selected={edit.selected}
                      onSelect={handleSelect}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  );
                }

                if (edit.type === "highlight") {
                  return (
                    <HighlightOverlay
                      key={edit.id}
                      edit={edit}
                      selected={edit.selected}
                      onSelect={handleSelect}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  );
                }

                if (edit.type === "text") {
                  return (
                    <TextOverlay
                      key={edit.id}
                      edit={edit}
                      selected={edit.selected}
                      onSelect={handleSelect}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  );
                }

                if (edit.type === "image" || edit.type === "sign") {
                  return (
                    <ImageOverlay
                      key={edit.id}
                      edit={edit}
                      selected={edit.selected}
                      onSelect={handleSelect}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  );
                }

                return null;
              })}

              <SearchResultLayer
                results={pageSearchResults}
                activeSearchResult={
                  searchResults[activeSearchIndex]
                }
              />

              <DetectedTextLayer
                items={detectedTextItems}
                active={activeTool === "editText"}
                onTextClick={handleDetectedTextClick}
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
}

function SearchResultLayer({
  results,
  activeSearchResult
}) {
  if (!results.length) return null;

  return (
    <div className="absolute inset-0 z-25 pointer-events-none">
      {results.map((result) => {
        const active =
          activeSearchResult?.searchId === result.searchId;

        return (
          <div
            key={result.searchId}
            className={`
              absolute rounded-sm border
              ${
                active
                  ? "border-orange-500 bg-orange-300/50"
                  : "border-yellow-500 bg-yellow-300/35"
              }
            `}
            style={{
              left: result.x,
              top: result.y,
              width: result.width,
              height: result.height
            }}
          />
        );
      })}
    </div>
  );
}