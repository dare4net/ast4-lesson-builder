export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-screen overflow-hidden">
      {children}
    </div>
  );
} 