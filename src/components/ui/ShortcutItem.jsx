export default function ShortcutItem({
  label,
  value
}) {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-[#475569] mb-2">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}