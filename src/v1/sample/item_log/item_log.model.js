const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    status: { type: String, required: true }, // pending, completed, cancelled
    qty: { type: Number, required: true },
    qty_old: { type: Number, required: true },
    qty_transaction: { type: Number, required: true },

    type: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },

    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    name_approved_by: { type: String, required: true },
    name_request_by: { type: String, required: true },
    office: { type: String, required: true },
    reason: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_date", updatedAt: "updated_date" },
  },
);

module.exports = mongoose.model("Item_LOg", locationSchema);
