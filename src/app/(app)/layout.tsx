import { AppHeader } from '@/components/app-header';
import dbConnect from '@/lib/db';
import User from '@/lib/models/user.model';
import { verifySession } from '@/lib/session';
import { GraduationCap } from 'lucide-react';

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
      <footer className="bg-muted/40 border-t mt-12">
            <div className="container px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">StudyForge</span>
                </div>
                <p className="text-center md:text-right text-muted-foreground">
                © {new Date().getFullYear()} StudyForge. Built by <span className="text-foreground font-medium">Md Rizwan Molla</span>. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
  );
}
