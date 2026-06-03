export default function DetectedTextLayer({
  items,
  active,
  onTextClick
}) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-30">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.text}
          onClick={(event) => {
            event.stopPropagation();
            onTextClick(item);
          }}
          className="
            absolute
            border
            border-blue-500/50
            bg-blue-400/5
            hover:bg-blue-400/20
            hover:border-blue-600
            transition
          "
          style={{
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height
          }}
        />
      ))}
    </div>
  );
}