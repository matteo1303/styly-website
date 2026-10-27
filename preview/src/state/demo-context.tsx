import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

type DemoContextValue = {
  savedLookIds: string[];
  wornCount: number;
  wornItemCounts: Record<string, number>;
  laundryItems: string[];
  demoItems: { id: string; name: string; category: string; price: number }[];
  totalSpend: number;
  saveLook: (id: string) => void;
  wearLook: (id: string, items: string[]) => void;
  toggleLaundry: (id: string) => void;
  addDemoItem: (item: { name: string; category: string; price: number }) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: PropsWithChildren) {
  const [savedLookIds, setSavedLookIds] = useState<string[]>([]);
  const [wearData, setWearData] = useState<{ looks: string[]; items: Record<string, number> }>({ looks: [], items: {} });
  const [laundryItems, setLaundryItems] = useState(['linen-shirt', 'black-jeans']);
  const [demoItems, setDemoItems] = useState<{ id: string; name: string; category: string; price: number }[]>([]);
  const value = useMemo(() => ({
    savedLookIds,
    wornCount: wearData.looks.length,
    wornItemCounts: wearData.items,
    laundryItems,
    demoItems,
    totalSpend: demoItems.reduce((total, item) => total + item.price, 0),
    saveLook: (id: string) => setSavedLookIds((current) => current.includes(id) ? current : [...current, id]),
    wearLook: (id: string, items: string[]) => setWearData((current) => current.looks.includes(id) ? current : ({ looks: [...current.looks, id], items: items.reduce((counts, item) => ({ ...counts, [item]: (counts[item] ?? 0) + 1 }), current.items) })),
    toggleLaundry: (id: string) => setLaundryItems((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    addDemoItem: (item: { name: string; category: string; price: number }) => setDemoItems((current) => [...current, { ...item, id: `demo-${Date.now()}-${current.length}` }]),
  }), [savedLookIds, wearData, laundryItems, demoItems]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used within DemoProvider');
  return value;
}
