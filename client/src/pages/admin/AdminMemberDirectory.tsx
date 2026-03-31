import { AdminLoungeLayout } from './AdminLoungeLayout';
import MemberDirectoryCore from '@/components/members/MemberDirectoryCore';

export default function AdminMemberDirectory() {
  return (
    <AdminLoungeLayout breadcrumbs={[{ label: 'Members' }]}>
      <MemberDirectoryCore
        variant="admin"
        gradientCSS="linear-gradient(135deg, #475569 0%, #334155 50%, #64748b 100%)"
        accentColor="#64748b"
        accentLight="#f8fafc"
      />
    </AdminLoungeLayout>
  );
}
