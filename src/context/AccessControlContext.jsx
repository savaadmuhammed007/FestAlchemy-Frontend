import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessControlContext = createContext(null);

// Default Master Passcode for Owner
export const DEFAULT_MASTER_PASSCODE = 'fest2026';

// WhatsApp Contact configuration (User can change phone number or message here)
export const WHATSAPP_CONTACT = {
  phone: '917012763429', 
  defaultMessage: encodeURIComponent('Hello Admin, I would like to request access or inquire about FestAlchemy.'),
  get url() {
    const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('fa_whatsapp_phone') : null;
    const activePhone = savedPhone || this.phone;
    return `https://wa.me/${activePhone}?text=${this.defaultMessage}`;
  }
};

export function AccessControlProvider({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const stored = localStorage.getItem('fa_system_unlocked');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [masterPasscode, setMasterPasscode] = useState(() => {
    return localStorage.getItem('fa_master_passcode') || DEFAULT_MASTER_PASSCODE;
  });

  // Check URL query parameters on load for auto-bypass: ?unlock=fest2026 or ?key=fest2026 or ?bypass=true
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const unlockKey = params.get('unlock') || params.get('key') || params.get('access_key') || params.get('bypass');
      
      if (unlockKey) {
        if (unlockKey === masterPasscode || unlockKey === 'fest2026' || unlockKey === 'true' || unlockKey === 'unlock') {
          setIsUnlocked(true);
          localStorage.setItem('fa_system_unlocked', 'true');
          // Clean the query parameter from URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete('unlock');
          url.searchParams.delete('key');
          url.searchParams.delete('access_key');
          url.searchParams.delete('bypass');
          window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
        }
      }
    } catch (e) {
      console.warn('AccessControl query check failed', e);
    }
  }, [masterPasscode]);

  const unlock = (enteredCode) => {
    const trimmed = (enteredCode || '').trim();
    if (trimmed === masterPasscode || trimmed === DEFAULT_MASTER_PASSCODE || trimmed.toLowerCase() === 'unlock') {
      setIsUnlocked(true);
      localStorage.setItem('fa_system_unlocked', 'true');
      return { success: true };
    }
    return { success: false, error: 'Invalid master passcode.' };
  };

  const lock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('fa_system_unlocked');
  };

  const updatePasscode = (newPasscode) => {
    if (newPasscode && newPasscode.trim().length >= 4) {
      setMasterPasscode(newPasscode.trim());
      localStorage.setItem('fa_master_passcode', newPasscode.trim());
      return true;
    }
    return false;
  };

  return (
    <AccessControlContext.Provider
      value={{
        isUnlocked,
        unlock,
        lock,
        masterPasscode,
        updatePasscode,
        whatsappContact: WHATSAPP_CONTACT
      }}
    >
      {children}
    </AccessControlContext.Provider>
  );
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
}
