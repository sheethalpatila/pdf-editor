import useDragResize from "./useDragResize";

export default function ImageOverlay({
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
    minWidth: 30,
    minHeight: 20
  });

  return (
    <div
      className={`
        absolute z-20
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
        cursor: isDragging ? "grabbing" : "move"
      }}
      onMouseDown={startDrag}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(edit);
      }}
    >
      <img
        src={edit.src}
        alt={edit.type}
        className="h-full w-full object-contain pointer-events-none"
        draggable={false}
      />

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