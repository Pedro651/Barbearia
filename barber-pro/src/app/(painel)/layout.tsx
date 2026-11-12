import AdminGuard from "../../components/guard/AdminGuard";

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}