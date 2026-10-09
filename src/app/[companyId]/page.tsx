import React from 'react';
import { MainApp } from '@/components/MainApp';

interface CompanyPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { companyId } = await params;
  return <MainApp initialCompanyId={companyId} initialView="main" />;
}
