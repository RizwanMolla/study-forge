export default function StudyZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 pt-2">{children}</div>
    </div>
  );
}
