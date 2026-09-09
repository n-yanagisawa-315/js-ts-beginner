export type DemoOrderStatus = "unpaid" | "paid";

export type DemoOrder = {
  id: string;
  customer: string;
  item: string;
  total: number;
  status: DemoOrderStatus;
};

export const ORDER_STORAGE_KEY = "js-ts-beginner-demo-orders-v1";

export const SEED_ORDERS: DemoOrder[] = [
  {
    id: "ORD-1042",
    customer: "Aya",
    item: "技術書",
    total: 2640,
    status: "paid",
  },
  {
    id: "ORD-1043",
    customer: "Ren",
    item: "キーボード",
    total: 8800,
    status: "unpaid",
  },
  {
    id: "ORD-1044",
    customer: "Mio",
    item: "USBケーブル",
    total: 1200,
    status: "unpaid",
  },
];

export function parseStoredOrders(value: string | null): DemoOrder[] {
  if (!value) return SEED_ORDERS;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return SEED_ORDERS;
    const valid = parsed.filter(
      (order): order is DemoOrder =>
        Boolean(order) &&
        typeof order === "object" &&
        "id" in order &&
        typeof order.id === "string" &&
        "customer" in order &&
        typeof order.customer === "string" &&
        "item" in order &&
        typeof order.item === "string" &&
        "total" in order &&
        typeof order.total === "number" &&
        "status" in order &&
        (order.status === "paid" || order.status === "unpaid"),
    );
    return valid.length > 0 ? valid : SEED_ORDERS;
  } catch {
    return SEED_ORDERS;
  }
}
