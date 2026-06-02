export default function InfoItem({
  icon: Icon,
  title,
  subtitle
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon
        size={24}
        className="text-[#5f6775]"
      />

      <p className="mt-3 text-sm font-bold text-[#0f172a] leading-tight">
        {title}
      </p>

      <p className="text-sm font-bold text-[#0f172a] leading-tight">
        {subtitle}
      </p>
    </div>
  );
}