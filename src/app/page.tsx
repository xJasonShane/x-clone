'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Timeline } from '@/components/Timeline';
import { RightSidebar } from '@/components/RightSidebar';
import { EditProfileModal } from '@/components/EditProfileModal';
import { MobileNav } from '@/components/MobileNav';

export default function Home() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        {/* Left Sidebar - Fixed width, sticky */}
        <div className="flex-shrink-0">
          <Sidebar onEditProfile={() => setIsEditModalOpen(true)} />
        </div>

        {/* Main Content - Fluid width with max-width */}
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-border/50 min-h-screen">
          <Timeline />
        </div>

        {/* Right Sidebar - Fixed width, sticky */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Edit Profile Modal */}
      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </main>
  );
}
