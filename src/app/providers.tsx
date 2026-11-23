"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";
import { StoreProvider } from "@/store/app-store";
import { CatalogProvider } from "@/store/catalog";
import { ToastProvider } from "@/store/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <CatalogProvider>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </CatalogProvider>
    </StoreProvider>
  );
}
