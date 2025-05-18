export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50">
      {/* Navigation breadcrumbs can be added here */}
      {children}
    </div>
  );
}