import {
  Upload,
  Type,
  Edit3,
  PenLine,
  Image,
  Highlighter,
  MousePointer2,
  Undo2,
  Redo2,
  Square,
  Check
} from "lucide-react";

const tools = [
  {
    id: "upload",
    label: "Upload",
    icon: Upload
  },
  {
    id: "text",
    label: "Text",
    icon: Type
  },
  {
    id: "editText",
    label: "Edit Text",
    icon: Edit3
  },
  {
    id: "cover",
    label: "Cover",
    icon: Square
  },
  {
    id: "sign",
    label: "Sign",
    icon: PenLine
  },
  {
    id: "image",
    label: "Image",
    icon: Image
  },
  {
    id: "highlight",
    label: "Highlight",
    icon: Highlighter
  }
];

export default function ToolBar({
  activeTool,
  setActiveTool,
  onUpload,
  onUndo,
  onRedo
}) {
  const handleToolClick = (toolId) => {
    if (toolId === "upload") {
      onUpload?.();
      return;
    }

    setActiveTool(toolId);
  };

  return (
    <div className="h-12 border-b border-[#e5e7eb] bg-white flex items-center px-4">
      <div className="flex items-center gap-2 pr-4 border-r border-[#e5e7eb]">
        <button
          onClick={onUndo}
          title="Undo"
          className="h-8 w-8 rounded-md flex items-center justify-center text-[#4b5563] hover:bg-[#f3f4f6]"
        >
          <Undo2 size={17} />
        </button>

        <button
          onClick={onRedo}
          title="Redo"
          className="h-8 w-8 rounded-md flex items-center justify-center text-[#4b5563] hover:bg-[#f3f4f6]"
        >
          <Redo2 size={17} />
        </button>
      </div>

      <div className="flex items-center gap-1 pl-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`
                h-9 px-3 rounded-md flex items-center gap-2 text-sm font-medium transition
                ${active
                  ? "bg-blue-600 text-white"
                  : "text-[#374151] hover:bg-[#f3f4f6]"
                }
              `}
            >
              <Icon size={17} />
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}