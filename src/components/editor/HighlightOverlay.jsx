import useDragResize from "./useDragResize";

export default function HighlightOverlay({
  edit,
  selected,
  onSelect,
  onUpdate,
  onDelete
}) {
  const {
    startDrag,
    startResize,
    isDragging
  } = useDragResize({
    edit,
    onSelect,
    onUpdate,
    minWidth: 20,
    minHeight: 8
  });

  return (
    <div
      className={`
        absolute z-10
        ${
          selected
            ? "border border-blue-600"
            : "border border-transparent hover:border-blue-300"
        }
      `}
      style={{
        left: edit.x,
        top: edit.y,
        width: edit.width,
        height: edit.height,
        backgroundColor: edit.color || "#facc15",
        opacity: edit.opacity ?? 0.35,
        cursor: isDragging ? "grabbing" : "move"
      }}
      onMouseDown={startDrag}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(edit);
      }}
    >
      {selected && (
        <>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(edit.id);
            }}
            className="absolute -right-6 -top-6 h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white"
          >
            ×
          </button>

          <div
            onMouseDown={startResize}
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-sm bg-blue-600 cursor-se-resize"
          />
        </>
      )}
    </div>
  );
}