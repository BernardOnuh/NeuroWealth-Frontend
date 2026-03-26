export interface NotificationPreferences {
  categories: {
    transactions: boolean;
    system: boolean;
    promotions: boolean;
  };
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  categories: {
    transactions: true,
    system: true,
    promotions: false,
  },
  channels: {
    inApp: true,
    email: true,
    push: false,
  },
};
