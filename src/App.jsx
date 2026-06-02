import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import TopBar from "./components/layout/TopBar";
import ToolBar from "./components/layout/ToolBar";
import LeftPagesSidebar from "./components/layout/LeftPagesSidebar";
import RightPanel from "./components/layout/RightPanel";
import UploadScreen from "./components/screens/UploadScreen";
import EditorScreen from "./components/screens/EditorScreen";

import {
  savePdfFile,
  getLastOpenedPdf,
  saveFileEdits,
  getFileEdits,
  getAllPdfFiles,
  getPdfFile,
  setLastOpenedPdf,
  clearAllPdfFiles,
  deletePdfFileById
} from "./utils/localDb";

import { exportEditedPdf } from "./utils/exportPdf";

export default function App() {
  const uploadInputRef = useRef(null);

  const [fileRecord, setFileRecord] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const [activeTool, setActiveTool] = useState("upload");
  const [selectedPage, setSelectedPage] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [numPages, setNumPages] = useState(0);

  const [edits, setEditsState] = useState([]);
  const [pageViewports, setPageViewports] = useState({});

  const [recentFiles, setRecentFiles] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const commitEdits = useCallback((updater) => {
    setEditsState((prev) => {
      const next =
        typeof updater === "function"
          ? updater(prev)
          : updater;

      setUndoStack((history) => [
        ...history,
        prev
      ]);

      setRedoStack([]);

      return next;
    });
  }, []);

  const setEdits = commitEdits;

  useEffect(() => {
    restoreLastFile();
  }, []);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!fileRecord?.id) return;

    const timeout = setTimeout(() => {
      const editsToSave = edits.map((edit) => ({
        ...edit,
        selected: false
      }));

      saveFileEdits(fileRecord.id, editsToSave);
    }, 300);

    return () => clearTimeout(timeout);
  }, [edits, fileRecord?.id]);

  const resetCurrentFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    setFileRecord(null);
    setFileUrl(null);
    setEditsState([]);
    setUndoStack([]);
    setRedoStack([]);
    setPageViewports({});
    setSelectedPage(1);
    setSelectedElement(null);
    setNumPages(0);
    setActiveTool("upload");
  };

  const restoreLastFile = async () => {
    const files = await getAllPdfFiles();

    setRecentFiles(files);

    const lastFile = await getLastOpenedPdf();

    if (!lastFile?.blob) {
      return;
    }

    const savedEdits = await getFileEdits(lastFile.id);
    const url = URL.createObjectURL(lastFile.blob);

    setFileRecord(lastFile);
    setFileUrl(url);
    setEditsState(savedEdits);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedPage(1);
    setSelectedElement(null);
    setActiveTool("select");
  };

  const handleOpenUploadPicker = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadInputChange = async (event) => {
    const uploadedFile = event.target.files?.[0];

    await handleFileSelect(uploadedFile);

    event.target.value = "";
  };

  const handleFileSelect = async (uploadedFile) => {
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    const savedFile = await savePdfFile(uploadedFile);
    const url = URL.createObjectURL(savedFile.blob);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    const files = await getAllPdfFiles();

    setRecentFiles(files);
    setFileRecord(savedFile);
    setFileUrl(url);
    setEditsState([]);
    setUndoStack([]);
    setRedoStack([]);
    setPageViewports({});
    setSelectedPage(1);
    setSelectedElement(null);
    setActiveTool("select");
  };

  const handleOpenPreviousFile = async (fileId) => {
    const selectedFile = await getPdfFile(fileId);

    if (!selectedFile?.blob) return;

    const savedEdits = await getFileEdits(fileId);
    const url = URL.createObjectURL(selectedFile.blob);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    await setLastOpenedPdf(fileId);

    setFileRecord(selectedFile);
    setFileUrl(url);
    setEditsState(savedEdits);
    setUndoStack([]);
    setRedoStack([]);
    setPageViewports({});
    setSelectedPage(1);
    setSelectedElement(null);
    setActiveTool("select");
  };

  const handleDeletePreviousFile = async (fileId) => {
    await deletePdfFileById(fileId);

    const files = await getAllPdfFiles();

    setRecentFiles(files);

    if (fileRecord?.id === fileId) {
      resetCurrentFile();
    }
  };

  const handleClearAllFiles = async () => {
    const confirmed = window.confirm(
      "Delete all locally saved PDFs and edits from this browser?"
    );

    if (!confirmed) return;

    await clearAllPdfFiles();

    setRecentFiles([]);
    resetCurrentFile();
  };

  const handleDownload = async () => {
    await exportEditedPdf({
      fileRecord,
      edits,
      pageViewports
    });
  };

  const updateSelectedElement = useCallback(
    (updates) => {
      if (!selectedElement?.id) return;

      setEdits((prev) => {
        const updatedEdits = prev.map((edit) =>
          edit.id === selectedElement.id
            ? {
              ...edit,
              ...updates,
              selected: true
            }
            : edit
        );

        const updatedSelected = updatedEdits.find(
          (edit) => edit.id === selectedElement.id
        );

        setSelectedElement(updatedSelected || null);

        return updatedEdits;
      });
    },
    [
      selectedElement,
      setEdits
    ]
  );

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement?.id) return;

    setEdits((prev) =>
      prev.filter(
        (edit) => edit.id !== selectedElement.id
      )
    );

    setSelectedElement(null);
  }, [
    selectedElement,
    setEdits
  ]);

  const handleDone = () => {
    setActiveTool("select");
    setSelectedElement(null);

    setEdits((prev) =>
      prev.map((edit) => ({
        ...edit,
        selected: false
      }))
    );
  };

  const handleUndo = useCallback(() => {
    setUndoStack((history) => {
      if (history.length === 0) {
        return history;
      }

      const previous = history[history.length - 1];

      setRedoStack((redo) => [
        edits,
        ...redo
      ]);

      setEditsState(previous);
      setSelectedElement(null);

      return history.slice(0, -1);
    });
  }, [edits]);

  const handleRedo = useCallback(() => {
    setRedoStack((redo) => {
      if (redo.length === 0) {
        return redo;
      }

      const next = redo[0];

      setUndoStack((history) => [
        ...history,
        edits
      ]);

      setEditsState(next);
      setSelectedElement(null);

      return redo.slice(1);
    });
  }, [edits]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag =
        document.activeElement?.tagName?.toLowerCase();

      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select";

      if (isTyping) return;

      if (event.key === "Escape") {
        event.preventDefault();
        handleDone();
      }

      if (!modKey) {
        const key = event.key.toLowerCase();

        if (key === "t") {
          event.preventDefault();
          setActiveTool("text");
        }

        if (key === "c") {
          event.preventDefault();
          setActiveTool("cover");
        }

        if (key === "h") {
          event.preventDefault();
          setActiveTool("highlight");
        }

        if (key === "i") {
          event.preventDefault();
          setActiveTool("image");
        }

        if (key === "s") {
          event.preventDefault();
          setActiveTool("sign");
        }

        if (key === "v") {
          event.preventDefault();
          setActiveTool("select");
        }
      }

      if (
        modKey &&
        event.key.toLowerCase() === "d"
      ) {
        event.preventDefault();
        handleDownload();
      }

      const isMac =
        navigator.platform
          .toLowerCase()
          .includes("mac");

      const modKey = isMac
        ? event.metaKey
        : event.ctrlKey;

      if (
        event.key === "Delete" ||
        event.key === "Backspace"
      ) {
        if (selectedElement) {
          event.preventDefault();
          deleteSelectedElement();
        }
      }

      if (
        modKey &&
        event.key.toLowerCase() === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleUndo();
      }

      if (
        (modKey &&
          event.key.toLowerCase() === "y") ||
        (modKey &&
          event.shiftKey &&
          event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedElement,
    deleteSelectedElement,
    handleUndo,
    handleRedo,
    handleDone,
    handleDownload
  ]);

  const pages = Array.from(
    {
      length: numPages || 0
    },
    (_, index) => index + 1
  );

  return (
    <div className="h-screen overflow-hidden bg-[#f3f4f6] text-[#111827]">
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUploadInputChange}
        className="hidden"
      />

      <TopBar
        hasFile={Boolean(fileRecord)}
        fileName={fileRecord?.name}
        recentFiles={recentFiles}
        onOpenPreviousFile={handleOpenPreviousFile}
        onDeletePreviousFile={handleDeletePreviousFile}
        onClearAllFiles={handleClearAllFiles}
        onDownload={handleDownload}
      />

      <ToolBar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onUpload={handleOpenUploadPicker}
        onDone={handleDone}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className="h-[calc(100vh-112px)] grid grid-cols-[82px_1fr_320px]">
        <LeftPagesSidebar
          fileUrl={fileUrl}
          pages={pages}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="relative overflow-hidden bg-[#f7f8fb]">
          {!fileUrl ? (
            <UploadScreen onFileSelect={handleFileSelect} />
          ) : (
            <EditorScreen
              fileRecord={fileRecord}
              fileUrl={fileUrl}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              setSelectedElement={setSelectedElement}
              setNumPages={setNumPages}
              edits={edits}
              setEdits={setEdits}
              setPageViewports={setPageViewports}
            />
          )}
        </main>

        <RightPanel
          activeTool={activeTool}
          selectedElement={selectedElement}
          onUpdateSelected={updateSelectedElement}
          onDeleteSelected={deleteSelectedElement}
        />
      </div>
    </div>
  );
}