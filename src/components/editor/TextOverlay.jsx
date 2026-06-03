import {
  useEffect,
  useRef,
  useState
} from "react";
import { getCssFontFamily } from "../../utils/fontResolver";

export default function TextOverlay({
  edit,
  selected,
  onSelect,
  onUpdate,
  onDelete
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });

  const [resizeStart, setResizeStart] = useState({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0
  });

  const fontSize = Number(edit.fontSize || 18);
  const width = Number(edit.width || 180);
  const height = Number(edit.height || fontSize + 14);

  useEffect(() => {
    if (selected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (dragging) {
        onUpdate(edit.id, {
          x: event.clientX - dragOffset.x,
          y: event.clientY - dragOffset.y
        });
      }

      if (resizing) {
        const dx = event.clientX - resizeStart.mouseX;
        const dy = event.clientY - resizeStart.mouseY;

        onUpdate(edit.id, {
          width: Math.max(
            40,
            resizeStart.width + dx
          ),
          height: Math.max(
            fontSize + 10,
            resizeStart.height + dy
          )
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, [
    dragging,
    resizing,
    dragOffset,
    resizeStart,
    edit.id,
    fontSize,
    onUpdate
  ]);

  const handleMouseDown = (event) => {
    event.stopPropagation();

    onSelect(edit);

    setDragging(true);

    setDragOffset({
      x: event.clientX - edit.x,
      y: event.clientY - edit.y
    });
  };

  const handleResizeMouseDown = (event) => {
    event.stopPropagation();
    event.preventDefault();

    onSelect(edit);

    setResizing(true);

    setResizeStart({
      mouseX: event.clientX,
      mouseY: event.clientY,
      width,
      height
    });
  };

  const handleTextChange = (event) => {
    onUpdate(edit.id, {
      text: event.target.value
    });
  };

  return (
    <div
      className="absolute z-20"
      style={{
        left: edit.x,
        top: edit.y,
        width,
        minHeight: height
      }}
    >
      <div className="relative group">
        <textarea
          ref={inputRef}
          value={edit.text || ""}
          onChange={handleTextChange}
          onMouseDown={(event) => {
            if (event.detail === 2) return;

            handleMouseDown(event);
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(edit);
          }}
          rows={1}
          spellCheck={false}
          className={`
            block
            w-full
            resize-none
            overflow-hidden
            bg-transparent
            px-1
            py-0
            outline-none
            leading-tight
            ${
              selected
                ? "border border-blue-600 bg-white/80"
                : "border border-transparent hover:border-blue-300"
            }
          `}
          style={{
  width,
  minHeight: height,
  fontSize: `${fontSize}px`,
  color: edit.color || "#111827",
  fontWeight: edit.fontWeight || "normal",
  fontStyle: edit.fontStyle || "normal",
  fontFamily: getCssFontFamily(edit.fontFamily),
  lineHeight: 1.15,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  letterSpacing: "normal"
}}
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
              onMouseDown={handleResizeMouseDown}
              className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-sm bg-blue-600 cursor-se-resize"
            />
          </>
        )}
      </div>
    </div>
  );
}