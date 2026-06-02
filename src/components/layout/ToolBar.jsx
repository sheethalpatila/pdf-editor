import {
  Upload,
  Type,
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
  },
  {
    id: "select",
    label: "Select",
    icon: MousePointer2
  }
];

export default function ToolBar({
  activeTool,
  setActiveTool,
  onUpload,
  onDone,
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
                ${
                  active
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

        <button
          onClick={onDone}
          className="ml-3 h-9 px-4 rounded-md flex items-center gap-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Check size={17} />
          Done
        </button>
      </div>
    </div>
  );
}