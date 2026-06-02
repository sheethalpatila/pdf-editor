import { useEffect, useRef, useState } from "react";

export default function useDragResize({
  edit,
  onSelect,
  onUpdate,
  minWidth = 20,
  minHeight = 10
}) {
  const [mode, setMode] = useState(null);

  const startRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const startDrag = (event) => {
    event.stopPropagation();
    event.preventDefault();

    onSelect(edit);

    startRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: edit.x,
      y: edit.y,
      width: edit.width || 0,
      height: edit.height || 0
    };

    setMode("drag");
  };

  const startResize = (event) => {
    event.stopPropagation();
    event.preventDefault();

    onSelect(edit);

    startRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: edit.x,
      y: edit.y,
      width: edit.width || 0,
      height: edit.height || 0
    };

    setMode("resize");
  };

  useEffect(() => {
    if (!mode) return;

    const handleMouseMove = (event) => {
      const dx = event.clientX - startRef.current.mouseX;
      const dy = event.clientY - startRef.current.mouseY;

      if (mode === "drag") {
        onUpdate(edit.id, {
          x: startRef.current.x + dx,
          y: startRef.current.y + dy
        });
      }

      if (mode === "resize") {
        onUpdate(edit.id, {
          width: Math.max(
            minWidth,
            startRef.current.width + dx
          ),
          height: Math.max(
            minHeight,
            startRef.current.height + dy
          )
        });
      }
    };

    const handleMouseUp = () => {
      setMode(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    mode,
    edit.id,
    minWidth,
    minHeight,
    onUpdate
  ]);

  return {
    startDrag,
    startResize,
    isDragging: mode === "drag",
    isResizing: mode === "resize"
  };
}