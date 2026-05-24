const mongoose = require("mongoose");

// ─── Cart item sub-schema ─────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price:    { type: Number, required: true },   // locked price at add time
  },
  { _id: true }
);

// ─── Cart schema (1 cart per user) ───────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
    // Recomputed on every mutation
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Method: recalculate total price ─────────────────────────────────────
cartSchema.methods.recalculateTotal = function () {
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
