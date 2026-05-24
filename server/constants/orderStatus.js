/** Order lifecycle statuses */
const ORDER_STATUS = Object.freeze({
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
});

/** Payment statuses */
const PAYMENT_STATUS = Object.freeze({
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
});

module.exports = { ORDER_STATUS, PAYMENT_STATUS };
