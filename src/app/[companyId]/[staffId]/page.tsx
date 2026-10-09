import React from 'react';
import { MainApp } from '@/components/MainApp';

interface StaffPageProps {
  params: Promise<{
    companyId: string;
    staffId: string;
  }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { companyId, staffId } = await params;
  return (
    <MainApp
      initialCompanyId={companyId}
      initialStaffId={staffId}
      initialView="mypage"
    />
  );
}
