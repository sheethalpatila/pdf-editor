import {
  SlidersHorizontal,
  Keyboard,
  Trash2
} from "lucide-react";

const textColors = [
  "#111827",
  "#ef4444",
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea"
];

const fontSizes = [
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  16,
  18,
  20,
  24,
  28,
  32,
  40
];

export default function RightPanel({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected
}) {
  return (
    <aside className="h-full border-l border-[#e5e7eb] bg-white flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 py-2 border-b border-[#e5e7eb] bg-white">
        <h2 className="text-md font-bold text-[#111827]">
          Properties
        </h2>

        <p className="text-xs text-[#6b7280]">
          Edit selected element
        </p>
      </div>

      <div className="min-h-0 flex-[1.4] overflow-y-auto p-6">
        {!selectedElement ? (
          <EmptyState />
        ) : selectedElement.type === "text" ? (
          <TextProperties
            selectedElement={selectedElement}
            onUpdateSelected={onUpdateSelected}
            onDeleteSelected={onDeleteSelected}
          />
        ) : selectedElement.type === "cover" ? (
          <CoverProperties
            selectedElement={selectedElement}
            onUpdateSelected={onUpdateSelected}
            onDeleteSelected={onDeleteSelected}
          />
        ) : selectedElement.type === "highlight" ? (
          <HighlightProperties
            selectedElement={selectedElement}
            onUpdateSelected={onUpdateSelected}
            onDeleteSelected={onDeleteSelected}
          />
        ) : selectedElement.type === "image" ||
          selectedElement.type === "sign" ? (
          <ImageProperties
            selectedElement={selectedElement}
            onUpdateSelected={onUpdateSelected}
            onDeleteSelected={onDeleteSelected}
          />
        ) : (
          <UnsupportedElement />
        )}
      </div>

      <div className="shrink-0 border-t border-[#e5e7eb] bg-[#f9fafb]">
        <div className="px-5 pt-4 pb-3 border-b border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#111827]">
            Shortcuts
          </h3>

          <Keyboard
            size={15}
            className="text-[#475569]"
          />
        </div>

        <div className="max-h-[220px] overflow-y-auto px-5 py-3">
          <Shortcut label="Add Text" value="T" />
          <Shortcut label="Edit PDF Text" value="E" />
          <Shortcut label="Cover / Whiteout" value="C" />
          <Shortcut label="Highlight" value="H" />
          <Shortcut label="Image" value="I" />
          <Shortcut label="Signature" value="S" />
          <Shortcut label="Select Tool" value="V" />
          <Shortcut label="Done / Deselect" value="Esc" />
          <Shortcut label="Delete Selected" value="Del" />
          <Shortcut label="Undo" value="⌘ / Ctrl + Z" />
          <Shortcut label="Redo" value="⌘ / Ctrl + Y" />
          <Shortcut label="Redo" value="⌘ / Ctrl + Shift + Z" />
          <Shortcut label="Download" value="⌘ / Ctrl + D" />
        </div>
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center text-center">
      <div>
        <SlidersHorizontal
          size={54}
          className="mx-auto text-[#cbd5e1]"
        />

        <p className="mt-5 text-sm leading-6 text-[#94a3b8]">
          Select an element on the PDF to edit its properties.
        </p>
      </div>
    </div>
  );
}

function UnsupportedElement() {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-[#6b7280]">
      This element type is not editable yet.
    </div>
  );
}

function TextProperties({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected
}) {
  return (
    <div className="space-y-6">
      <SelectedBadge
        label={
          selectedElement.source === "detectedText"
            ? "Edited PDF Text"
            : "Text Element"
        }
      />

      <div>
        <label className="text-xs font-bold text-[#6b7280] mb-2 block">
          TEXT
        </label>

        <textarea
          value={selectedElement.text || ""}
          onChange={(event) =>
            onUpdateSelected({
              text: event.target.value
            })
          }
          rows={4}
          className="w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-[#6b7280] mb-2 block">
          FONT SIZE
        </label>

        <select
          value={selectedElement.fontSize || 18}
          onChange={(event) =>
            onUpdateSelected({
              fontSize: Number(event.target.value)
            })
          }
          className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#111827] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          {fontSizes.map((size) => (
            <option
              key={size}
              value={size}
            >
              {size}px
            </option>
          ))}
        </select>
      </div>

      <div>
  <label className="text-xs font-bold text-[#6b7280] mb-2 block">
    FONT FAMILY
  </label>

  <select
    value={selectedElement.fontFamily || "Times New Roman"}
    onChange={(event) =>
      onUpdateSelected({
        fontFamily: event.target.value
      })
    }
    className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#111827] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
  >
    <option value="Times New Roman">
      Times New Roman
    </option>

    <option value="Arial">
      Arial / Helvetica
    </option>

    <option value="Courier New">
      Courier New
    </option>
  </select>
</div>

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-2">
          STYLE
        </p>

        <div className="flex gap-2">
          <button
            onClick={() =>
              onUpdateSelected({
                fontWeight:
                  selectedElement.fontWeight === "bold"
                    ? "normal"
                    : "bold"
              })
            }
            className={`
              h-9 px-3 rounded-lg border text-sm font-bold
              ${
                selectedElement.fontWeight === "bold"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-[#d1d5db] bg-white text-[#374151]"
              }
            `}
          >
            B
          </button>

          <button
            onClick={() =>
              onUpdateSelected({
                fontStyle:
                  selectedElement.fontStyle === "italic"
                    ? "normal"
                    : "italic"
              })
            }
            className={`
              h-9 px-3 rounded-lg border text-sm italic font-semibold
              ${
                selectedElement.fontStyle === "italic"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-[#d1d5db] bg-white text-[#374151]"
              }
            `}
          >
            I
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-3">
          TEXT COLOR
        </p>

        <div className="flex flex-wrap gap-3">
          {textColors.map((color) => {
            const active =
              selectedElement.color === color;

            return (
              <button
                key={color}
                onClick={() =>
                  onUpdateSelected({
                    color
                  })
                }
                className={`
                  h-8 w-8 rounded-full border transition
                  ${
                    active
                      ? "ring-2 ring-blue-600 ring-offset-2"
                      : "hover:scale-105"
                  }
                `}
                style={{
                  backgroundColor: color,
                  borderColor: color
                }}
              />
            );
          })}

          <input
            type="color"
            value={selectedElement.color || "#111827"}
            onChange={(event) =>
              onUpdateSelected({
                color: event.target.value
              })
            }
            className="h-8 w-10 cursor-pointer rounded border border-[#d1d5db] bg-white p-1"
          />
        </div>
      </div>

      <SizeFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <PositionFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <DeleteButton
        label="Delete Text"
        onDeleteSelected={onDeleteSelected}
      />
    </div>
  );
}

function CoverProperties({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected
}) {
  return (
    <div className="space-y-6">
      <SelectedBadge label="Cover Box" />

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-3">
          COVER COLOR
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              onUpdateSelected({
                color: "#ffffff"
              })
            }
            className="h-8 w-8 rounded-full border border-[#94a3b8] bg-white ring-2 ring-blue-600 ring-offset-2"
          />

          <input
            type="color"
            value={selectedElement.color || "#ffffff"}
            onChange={(event) =>
              onUpdateSelected({
                color: event.target.value
              })
            }
            className="h-8 w-10 cursor-pointer rounded border border-[#d1d5db] bg-white p-1"
          />
        </div>
      </div>

      <SizeFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <PositionFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <DeleteButton
        label="Delete Cover"
        onDeleteSelected={onDeleteSelected}
      />
    </div>
  );
}

function HighlightProperties({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected
}) {
  return (
    <div className="space-y-6">
      <SelectedBadge label="Highlight" />

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-3">
          HIGHLIGHT COLOR
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            "#facc15",
            "#fde047",
            "#86efac",
            "#93c5fd",
            "#fca5a5",
            "#d8b4fe"
          ].map((color) => {
            const active =
              selectedElement.color === color;

            return (
              <button
                key={color}
                onClick={() =>
                  onUpdateSelected({
                    color
                  })
                }
                className={`
                  h-8 w-8 rounded-full border transition
                  ${
                    active
                      ? "ring-2 ring-blue-600 ring-offset-2"
                      : "hover:scale-105"
                  }
                `}
                style={{
                  backgroundColor: color,
                  borderColor: color
                }}
              />
            );
          })}

          <input
            type="color"
            value={selectedElement.color || "#facc15"}
            onChange={(event) =>
              onUpdateSelected({
                color: event.target.value
              })
            }
            className="h-8 w-10 cursor-pointer rounded border border-[#d1d5db] bg-white p-1"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-2">
          OPACITY
        </p>

        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={selectedElement.opacity ?? 0.35}
          onChange={(event) =>
            onUpdateSelected({
              opacity: Number(event.target.value)
            })
          }
          className="w-full"
        />

        <p className="mt-1 text-xs text-[#6b7280]">
          {Math.round(
            (selectedElement.opacity ?? 0.35) * 100
          )}
          %
        </p>
      </div>

      <SizeFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <PositionFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <DeleteButton
        label="Delete Highlight"
        onDeleteSelected={onDeleteSelected}
      />
    </div>
  );
}

function ImageProperties({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected
}) {
  const isSign = selectedElement.type === "sign";

  return (
    <div className="space-y-6">
      <SelectedBadge
        label={isSign ? "Signature" : "Image"}
      />

      <div>
        <p className="text-xs font-bold text-[#6b7280] mb-2">
          PREVIEW
        </p>

        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3">
          <img
            src={selectedElement.src}
            alt={selectedElement.type}
            className="max-h-32 w-full object-contain"
          />
        </div>
      </div>

      <SizeFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <PositionFields
        selectedElement={selectedElement}
        onUpdateSelected={onUpdateSelected}
      />

      <DeleteButton
        label={
          isSign
            ? "Delete Signature"
            : "Delete Image"
        }
        onDeleteSelected={onDeleteSelected}
      />
    </div>
  );
}

function SelectedBadge({ label }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#6b7280] mb-2">
        SELECTED
      </p>

      <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
        {label}
      </div>
    </div>
  );
}

function SizeFields({
  selectedElement,
  onUpdateSelected
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#6b7280] mb-2">
        SIZE
      </p>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width"
          value={Math.round(selectedElement.width || 0)}
          onChange={(value) =>
            onUpdateSelected({
              width: value
            })
          }
        />

        <NumberInput
          label="Height"
          value={Math.round(selectedElement.height || 0)}
          onChange={(value) =>
            onUpdateSelected({
              height: value
            })
          }
        />
      </div>
    </div>
  );
}

function PositionFields({
  selectedElement,
  onUpdateSelected
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#6b7280] mb-2">
        POSITION
      </p>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="X"
          value={Math.round(selectedElement.x || 0)}
          onChange={(value) =>
            onUpdateSelected({
              x: value
            })
          }
        />

        <NumberInput
          label="Y"
          value={Math.round(selectedElement.y || 0)}
          onChange={(value) =>
            onUpdateSelected({
              y: value
            })
          }
        />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#6b7280]">
        {label}
      </span>

      <input
        type="number"
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-1 h-9 w-full rounded-lg border border-[#d1d5db] px-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function DeleteButton({
  label,
  onDeleteSelected
}) {
  return (
    <button
      onClick={onDeleteSelected}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-50 text-sm font-bold text-red-600 hover:bg-red-100"
    >
      <Trash2 size={16} />
      {label}
    </button>
  );
}

function Shortcut({
  label,
  value
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-[#6b7280] mb-2">
      <span className="min-w-0 truncate">
        {label}
      </span>

      <span className="shrink-0 rounded-md border border-[#e5e7eb] bg-white px-2 py-0.5 text-xs font-semibold text-[#374151]">
        {value}
      </span>
    </div>
  );
}