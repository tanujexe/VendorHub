import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Truck,
  X,
  Eye,
  ArrowRight,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import api from "../../../services/api";

import { useToast } from "../../../components/ui/toast";
import QueryErrorPlaceholder from "../../../components/ui/QueryErrorPlaceholder";

const ORDER_STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];

const statusStyles = {
  Placed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shipped: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState("");

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["sellerOrders"],
    queryFn: async () => {
      const res = await api.get("/seller/orders/incoming?limit=50");
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, nextStatus }) => {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
        note: statusNote || `Status updated to ${nextStatus}`,
      });
      return res.data.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      setSelectedOrder(updatedOrder);
      setStatusNote("");
      toast.success(`Order updated to "${updatedOrder.orderStatus}" successfully!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order status.");
    },
  });

  const getNextStatus = (currentStatus) => {
    const currentIndex = ORDER_STATUS_STEPS.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < ORDER_STATUS_STEPS.length - 1) {
      return ORDER_STATUS_STEPS[currentIndex + 1];
    }
    return null;
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId, nextStatus });
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Incoming Orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track customer purchases, update order status, and manage shipments.
        </p>
      </div>

      {/* Loading / Error */}
      {error && (
        <QueryErrorPlaceholder
          error={error}
          refetch={refetch}
          message="Failed to load your orders."
        />
      )}

      {isLoading && (
        <div className="flex justify-center items-center gap-2 py-16 text-xs text-muted-foreground">
          <div className="w-4 h-4 border-t-2 border-primary rounded-full animate-spin" />
          Loading orders...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && (!orders || orders.length === 0) && (
        <div className="border border-dashed border-[#412d15] rounded-2xl text-center py-16 text-muted-foreground">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#e1dcc9]" />
          <p className="text-sm font-semibold text-foreground">No orders yet</p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            As soon as buyers checkout, their orders will appear here.
          </p>
        </div>
      )}

      {/* ── DESKTOP TABLE (hidden on mobile) ── */}
      {!isLoading && !error && orders && orders.length > 0 && (
        <>
          <div className="hidden sm:block bg-[#1f150c]/10 border border-[#412d15]/30 rounded-2xl overflow-hidden shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#412d15]/30 bg-black/40 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                    <th className="py-4 px-5">Order ID & Date</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Your Earnings</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#412d15]/10 bg-[#1f150c]/5">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="group hover:bg-[#412d15]/20 transition-colors duration-200"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-black/35 flex items-center justify-center border border-[#412d15]/40 shrink-0">
                            <ShoppingCart className="w-4 h-4 text-[#e1dcc9]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs text-muted-foreground font-semibold">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {order.shippingAddress?.name || "Customer"}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs font-bold text-[#e1dcc9]">
                        ₹{Math.round(order.sellerEarnings || (order.totalAmount * 0.95)).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusStyles[order.orderStatus] || "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#412d15]/30 border border-[#e1dcc9]/5 hover:bg-[#e1dcc9]/10 text-xs font-semibold text-[#e1dcc9] transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── MOBILE CARD LIST (hidden on sm+) ── */}
          <div className="sm:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#1f150c]/20 border border-[#412d15]/40 rounded-2xl p-4 space-y-3"
              >
                {/* Top row: ID + status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      statusStyles[order.orderStatus] || "bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Middle row: customer + earnings */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    <User className="w-3.5 h-3.5" />
                    {order.shippingAddress?.name || "Customer"}
                  </span>
                  <span className="font-bold text-[#e1dcc9] flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {Math.round(order.sellerEarnings || (order.totalAmount * 0.95)).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full py-2 rounded-xl bg-[#412d15]/30 border border-[#e1dcc9]/10 hover:bg-[#e1dcc9]/10 text-xs font-semibold text-[#e1dcc9] transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}


      {/* ── ORDER DETAIL DRAWER ── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Drawer — full width on mobile, max-md on sm+ */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="bg-[#1f150c] border-l border-[#412d15] w-full sm:max-w-md h-full relative z-10 flex flex-col"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#412d15] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#e1dcc9]" />
                    <div>
                      <h3 className="font-bold text-foreground text-sm">Order Details</h3>
                      <p className="text-[10px] text-muted-foreground">
                        #{selectedOrder._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 rounded-lg bg-black/35 hover:bg-black/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Purchased Items
                  </h4>
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/25 border border-[#412d15]/50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[#412d15]/50 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground shrink-0">
                        ₹{Math.round(item.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                <div className="p-4 rounded-xl bg-[#412d15]/15 border border-[#412d15]/50 text-xs space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </h4>
                  <p className="text-foreground font-semibold">{selectedOrder.shippingAddress?.name}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state} – {selectedOrder.shippingAddress?.pincode}
                  </p>
                  <p className="text-muted-foreground">
                    Phone:{" "}
                    <span className="text-foreground font-bold">
                      {selectedOrder.shippingAddress?.phone}
                    </span>
                  </p>
                </div>

                {/* Order timeline */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Order Timeline
                  </h4>
                  <div className="relative pl-6 border-l-2 border-[#412d15] space-y-5">
                    {ORDER_STATUS_STEPS.map((status, index) => {
                      const isCompleted =
                        ORDER_STATUS_STEPS.indexOf(selectedOrder.orderStatus) >= index;
                      const isCurrent = selectedOrder.orderStatus === status;
                      return (
                        <div key={status} className="relative">
                          <div
                            className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
                              isCompleted
                                ? "bg-[#e1dcc9] border-[#e1dcc9] text-black scale-110 font-black"
                                : "bg-black border-[#412d15] text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>
                          <div>
                            <h5
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? "text-[#e1dcc9]"
                                  : isCompleted
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {status}
                            </h5>
                            <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                              {isCurrent ? "Current Stage" : isCompleted ? "Completed" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky footer actions */}
              <div className="border-t border-[#412d15] p-4 bg-[#1f150c] space-y-3 shrink-0">
                {getNextStatus(selectedOrder.orderStatus) &&
                selectedOrder.orderStatus !== "Cancelled" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Note (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shipped via FedEx"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full bg-black/40 border border-[#412d15] rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground/50 outline-none focus:border-[#e1dcc9]/50"
                      />
                    </div>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, selectedOrder.orderStatus)
                      }
                      disabled={updateStatusMutation.isPending}
                      className="w-full py-2.5 rounded-xl bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] active:scale-[0.98] transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-sm disabled:opacity-50"
                    >
                      {updateStatusMutation.isPending ? (
                        <div className="w-3.5 h-3.5 border-t-2 border-black rounded-full animate-spin" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                      Mark as "{getNextStatus(selectedOrder.orderStatus)}"
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#412d15]/10 border border-[#412d15]/50 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Order Complete
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
