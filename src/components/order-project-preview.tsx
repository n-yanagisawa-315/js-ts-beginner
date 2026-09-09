"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  ORDER_STORAGE_KEY,
  SEED_ORDERS,
  parseStoredOrders,
  type DemoOrder,
  type DemoOrderStatus,
} from "@/lib/order-project";

const ORDER_EVENT = "js-ts-beginner-demo-orders";
const SERVER_SNAPSHOT = JSON.stringify(SEED_ORDERS);
const NUMBER_FORMATTER = new Intl.NumberFormat("ja-JP");

export type OrderProjectPreviewProps = {
  compact?: boolean;
};

function subscribeOrders(callback: () => void) {
  window.addEventListener(ORDER_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ORDER_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function ordersSnapshot() {
  return localStorage.getItem(ORDER_STORAGE_KEY) ?? SERVER_SNAPSHOT;
}

function writeOrders(orders: DemoOrder[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDER_EVENT));
}

export function OrderProjectPreview({
  compact = false,
}: OrderProjectPreviewProps) {
  const formId = useId();
  const stored = useSyncExternalStore(
    subscribeOrders,
    ordersSnapshot,
    () => SERVER_SNAPSHOT,
  );
  const orders = useMemo(() => parseStoredOrders(stored), [stored]);
  const [filter, setFilter] = useState<"all" | DemoOrderStatus>("all");
  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [total, setTotal] = useState("");
  const [apiState, setApiState] = useState<"idle" | "loading" | "error">("idle");
  const { visibleOrders, paidTotal } = useMemo(() => {
    const visible: DemoOrder[] = [];
    let paid = 0;
    for (const order of orders) {
      if (filter === "all" || order.status === filter) visible.push(order);
      if (order.status === "paid") paid += order.total;
    }
    return { visibleOrders: visible, paidTotal: paid };
  }, [filter, orders]);

  function toggleStatus(id: string) {
    writeOrders(
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: order.status === "paid" ? "unpaid" : "paid",
            }
          : order,
      ),
    );
  }

  async function addOrder() {
    const amount = Number(total);
    if (!customer.trim() || !item.trim() || !Number.isFinite(amount) || amount <= 0) {
      return;
    }
    setApiState("loading");
    try {
      const response = await fetch("/api/demo-orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: customer.trim(),
          item: item.trim(),
          total: amount,
        }),
      });
      if (!response.ok) throw new Error("注文を追加できませんでした");
      const created = (await response.json()) as DemoOrder;
      const latestOrders = parseStoredOrders(ordersSnapshot());
      writeOrders([...latestOrders, created]);
      setCustomer("");
      setItem("");
      setTotal("");
      setApiState("idle");
    } catch {
      setApiState("error");
    }
  }

  async function reloadFromApi() {
    setApiState("loading");
    try {
      const response = await fetch("/api/demo-orders");
      if (!response.ok) throw new Error("注文を読み込めませんでした");
      const loaded = parseStoredOrders(JSON.stringify(await response.json()));
      writeOrders(loaded);
      setApiState("idle");
    } catch {
      setApiState("error");
    }
  }

  return (
    <section
      className={`order-project${compact ? " is-compact" : ""}`}
      aria-labelledby={`${formId}-title`}
    >
      <header className="order-project-head">
        <div>
          <p>この講座で作るもの</p>
          <h2 id={`${formId}-title`}>注文台帳</h2>
          <span>追加・絞り込み・支払更新・保存ができる画面</span>
        </div>
        <dl>
          <div>
            <dt>注文</dt>
            <dd>{orders.length}件</dd>
          </div>
          <div>
            <dt>支払済み合計</dt>
            <dd>{NUMBER_FORMATTER.format(paidTotal)}円</dd>
          </div>
        </dl>
      </header>

      <div className="order-project-body">
        <div className="order-project-toolbar">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as "all" | DemoOrderStatus);
            }}
            aria-label="注文状態で絞り込む"
          >
            {(
              [
                ["all", "すべて"],
                ["unpaid", "未払い"],
                ["paid", "支払済み"],
              ] as const
            ).map(([value, label]) => (
              <ToggleGroupItem
                key={value}
                value={value}
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => writeOrders(SEED_ORDERS)}
          >
            見本を元に戻す
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={apiState === "loading"}
            onClick={() => void reloadFromApi()}
          >
            {apiState === "loading" ? "APIを確認中…" : "APIから読み直す"}
          </Button>
        </div>

        <ul className="order-project-list" aria-live="polite">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <div>
                <span>{order.id}</span>
                <strong>{order.customer}</strong>
                <small>{order.item}</small>
              </div>
              <p>{NUMBER_FORMATTER.format(order.total)}円</p>
              <Button
                variant={order.status === "paid" ? "secondary" : "outline"}
                size="sm"
                className={`is-${order.status}`}
                onClick={() => toggleStatus(order.id)}
                aria-label={`${order.id}を${
                  order.status === "paid" ? "未払い" : "支払済み"
                }へ変更`}
              >
                {order.status === "paid" ? "支払済み" : "未払い"}
              </Button>
            </li>
          ))}
          {visibleOrders.length === 0 ? (
            <li className="is-empty">この状態の注文はありません。</li>
          ) : null}
        </ul>

        {!compact ? (
          <form
            className="order-project-form"
            onSubmit={(event) => {
              event.preventDefault();
              void addOrder();
            }}
          >
            <Field>
              <FieldLabel htmlFor={`${formId}-customer`}>顧客名</FieldLabel>
              <Input
                id={`${formId}-customer`}
                name="customer"
                autoComplete="off"
                value={customer}
                placeholder="例: Sora…"
                onChange={(event) => setCustomer(event.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-item`}>商品</FieldLabel>
              <Input
                id={`${formId}-item`}
                name="item"
                autoComplete="off"
                value={item}
                placeholder="例: マウス…"
                onChange={(event) => setItem(event.currentTarget.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-total`}>金額</FieldLabel>
              <Input
                id={`${formId}-total`}
                name="total"
                type="number"
                inputMode="numeric"
                min="1"
                value={total}
                placeholder="例: 3200…"
                onChange={(event) => setTotal(event.currentTarget.value)}
              />
            </Field>
            <Button
              type="submit"
              disabled={
                apiState === "loading" ||
                !customer.trim() ||
                !item.trim() ||
                Number(total) <= 0
              }
            >
              {apiState === "loading" ? (
                <>
                  <Spinner data-icon="inline-start" />
                  追加中…
                </>
              ) : (
                "未払い注文を追加"
              )}
            </Button>
            {apiState === "error" ? (
              <Alert variant="destructive" className="order-project-error">
                <AlertDescription>
                  APIへ接続できません。通信状況を確認して、もう一度試してください。
                </AlertDescription>
              </Alert>
            ) : null}
          </form>
        ) : null}
      </div>
    </section>
  );
}
