import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminModerationPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <AdminDashboard />
    </div>
  );
}
