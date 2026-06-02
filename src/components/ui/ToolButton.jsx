export default function ToolButton({
  tool,
  active,
  onClick
}) {
  const Icon = tool.icon;

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-11 rounded-md px-5 flex items-center gap-5 text-[15px] font-semibold transition
        ${
          active
            ? "bg-[#d5e1f4] text-[#4b5563]"
            : "text-[#4b5563] hover:bg-[#e8edf7]"
        }
      `}
    >
      <Icon size={21} />

      <span>
        {tool.label}
      </span>
    </button>
  );
}