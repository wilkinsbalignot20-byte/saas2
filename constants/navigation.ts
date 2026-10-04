 // constants/navigation.ts
export type NavItem = {
  href: string;
  label: string;
  // 1. IDINAGDAG ANG 'palette' SA MGA PINAPAYAGANG ICON TYPES MO
  icon: 'dashboard' | 'package' | 'palette' | 'receipt' | 'truck' | 'wallet' | 'tag' | 'chart' | 'chat' | 'cpu' | 'file';
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const getSellerNavigation = (seller: string): NavGroup[] => [
  {
    label: 'Overview',
    items: [{ href: `/dashboard/${seller}`, label: 'Dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Catalog & orders',
    items: [
      { href: `/dashboard/${seller}/products`, label: 'Products', icon: 'package' },
      // 2. DITO NATIN OPISYAL NA IKIKABIT ANG BAGONG STOREFRONT DESIGN NAV LINK:
      { href: `/dashboard/${seller}/storefront`, label: 'Storefront Design', icon: 'palette' },
      { href: `/dashboard/${seller}/orders`, label: 'Orders & shipping', icon: 'receipt' },
      { href: `/dashboard/${seller}/logistics`, label: 'Logistics control', icon: 'truck' },
    ],
  },
  {
    label: 'Money & growth',
    items: [
      { href: `/dashboard/${seller}/finance`, label: 'Finance & income', icon: 'wallet' },
      { href: `/dashboard/${seller}/marketing`, label: 'Vouchers & ads', icon: 'tag' },
      { href: `/dashboard/${seller}/insights`, label: 'Insights', icon: 'chart' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: `/dashboard/${seller}/chat`, label: 'Customer chat', icon: 'chat' },
      { href: `/dashboard/${seller}/automation`, label: 'Automation engine', icon: 'cpu' },
      { href: `/dashboard/${seller}/reports`, label: 'Reports', icon: 'file' },
    ],
  },
];
