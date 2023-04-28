// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

declare const __DATE__: string;
declare const __RELOAD_SW__: boolean;

declare namespace App {
  interface Supabase {
    Database: import('./DatabaseDefinitions').Database;
    SchemaName: 'public';
  }

  // interface Locals {}
  interface PageData {
    session: import('@supabase/supabase-js').Session | null;
  }
  // interface Platform {}
  // interface Stuff {}
}
declare module 'virtual:pwa-register/svelte' {
  import type { Writable } from 'svelte/store';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite/client" />

// src/app.d.ts
/// <reference types="@sveltejs/kit" />
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
