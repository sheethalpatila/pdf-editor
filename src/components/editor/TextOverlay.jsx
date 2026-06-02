import { useEffect, useRef, useState } from "react";

export default function TextOverlay({
  edit,
  selected,
  onSelect,
  onUpdate,
  onDelete
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected]);

  const handleMouseDown = (event) => {
    event.stopPropagation();

    onSelect(edit);

    setDragging(true);

    setDragOffset({
      x: event.clientX - edit.x,
      y: event.clientY - edit.y
    });
  };

  const handleMouseMove = (event) => {
    if (!dragging) return;

    event.stopPropagation();

    onUpdate(edit.id, {
      x: event.clientX - dragOffset.x,
      y: event.clientY - dragOffset.y
    });
  };

  const stopDragging = () => {
    setDragging(false);
  };

  return (
    <div
      className="absolute z-20"
      style={{
        left: edit.x,
        top: edit.y
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div className="relative group">
        <input
          ref={inputRef}
          value={edit.text}
          onChange={(event) =>
            onUpdate(edit.id, {
              text: event.target.value
            })
          }
          onMouseDown={handleMouseDown}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(edit);
          }}
          className={`
            min-w-[120px] bg-transparent px-2 py-1 outline-none
            ${
              selected
                ? "border border-blue-600 bg-white/80"
                : "border border-transparent hover:border-blue-300"
            }
          `}
          style={{
            fontSize: `${edit.fontSize}px`,
            color: edit.color || "#111827"
          }}
        />

        {selected && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(edit.id);
            }}
            className="absolute -right-6 -top-6 h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}