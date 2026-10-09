'use client';

import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/lib/types';
import { INITIAL_COMPANIES, DEFAULT_SUPER_ADMIN } from '@/lib/mockData';

const STORAGE_COMPANIES_KEY = 'craft_companies_cache_v1';
const STORAGE_ADMIN_PASSWORD_KEY = 'craft_super_admin_pw_v1';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [adminPassword, setAdminPassword] = useState<string>(DEFAULT_SUPER_ADMIN.defaultPassword);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 建設会社一覧の復元
      const savedCompanies = localStorage.getItem(STORAGE_COMPANIES_KEY);
      if (savedCompanies) {
        try {
          const parsed = JSON.parse(savedCompanies);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCompanies(parsed);
          }
        } catch (e) {
          console.error('Failed to parse cached companies', e);
        }
      } else {
        localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(INITIAL_COMPANIES));
      }

      // 自社パスワードの復元
      const savedPw = localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY);
      if (savedPw) {
        setAdminPassword(savedPw);
      }
    }
  }, []);

  // 建設会社の追加
  const addCompany = useCallback((newCompany: Omit<Company, 'id' | 'createdAt'>) => {
    const id = `company-${Date.now()}`;
    const company: Company = {
      ...newCompany,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCompanies((prev) => {
      const next = [company, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(next));
      }
      return next;
    });
    return company;
  }, []);

  // 建設会社の更新
  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // 建設会社の削除
  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_COMPANIES_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // 自社（Creative SD）管理者パスワードの変更
  const updateAdminPassword = useCallback((newPassword: string) => {
    setAdminPassword(newPassword);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ADMIN_PASSWORD_KEY, newPassword);
    }
  }, []);

  return {
    companies,
    adminPassword,
    addCompany,
    updateCompany,
    deleteCompany,
    updateAdminPassword,
  };
}
