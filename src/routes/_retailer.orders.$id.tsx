import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader, StatusPill } from "@/components/app/ui";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { cancelOrder, getOrder } from "@/repositories/orderRepo";
import { OrderDetailView } from "@/components/app/OrderDetailView";
import { toUserMessage } from "@/lib/errors";
import { formatDateTime, formatWon } from "@/lib/format";

export const Route = createFileRoute("/_retailer/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order #${params.id} — HoleSaler` },
      { name: "description", content: "Order lines, shipment, payments and refunds." },
      { property: "og:title", content: `Order #${params.id} — HoleSaler` },
      { property: "og:description", content: "Order lines, shipment, payments and refunds." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const id = Number(Route.useParams().id);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["orders", "detail", id], queryFn: () => getOrder(id) });
  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => toast.success(`Order #${id} cancelled`),
    onError: (err) =>
      toast.error(
        toUserMessage(err, {
          ORDER_NOT_CANCELLABLE: "This order has been paid. After delivery you can return goods by contacting us.",
        }),
      ),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["catalogue"] });
    },
  });

  if (q.error) toast.error(toUserMessage(q.error), { id: "order-error" });
  const o = q.data;

  return (
    <>
      <Link to="/orders" className="mb-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My orders
      </Link>
      <PageHeader
        title={`Order #${id}`}
        description={o ? `Ordered ${formatDateTime(o.ordered_at)} · Total ${formatWon(o.total_amount)}` : "Loading…"}
        actions={
          o && (
            <div className="flex items-center gap-3">
              <StatusPill status={o.status} />
              {o.status === "PENDING_PAYMENT" && (
                <ConfirmButton
                  label="Cancel order"
                  title={`Cancel order #${id}?`}
                  description="The order will be cancelled and the boxes released. This cannot be undone."
                  confirmLabel="Cancel order"
                  disabled={cancel.isPending}
                  onConfirm={() => cancel.mutate()}
                />
              )}
            </div>
          )
        }
      />
      {o && <OrderDetailView order={o} />}
    </>
  );
}
