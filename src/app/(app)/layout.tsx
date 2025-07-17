import { AppHeader } from '@/components/app-header';
import dbConnect from '@/lib/db';
import User from '@/lib/models/user.model';
import { verifySession } from '@/lib/session';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { userId } = await verifySession();
    await dbConnect();
    const user = await User.findById(userId).select('name email');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={JSON.parse(JSON.stringify(user))} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
