const mongoose = require("mongoose");
const Asset = require("./item.model");

const baseRoute = "item";
const {
  post,
  getByID,
  getAll,
  update,
  remove,
  getPagination,
} = require("../../../util/mongo_db/mongoDB_Post");
const route = (prop) => {
  // **************** Declaration ****************
  const urlAPI = `/${prop.main_route}/${baseRoute}`;

  prop.app.post(`${urlAPI}`, async (req, res) => {
    try {
      const { name, qty, low_stock_alert } = req.body;

      // ✅ Simple body validation
      if (!name || qty === undefined) {
        return res.status(400).json({
          success: false,
          message: "name and qty are required",
        });
      }

      if (typeof qty !== "number" || qty < 0) {
        return res.status(400).json({
          success: false,
          message: "qty must be a number >= 0",
        });
      }

      if (
        low_stock_alert !== undefined &&
        (typeof low_stock_alert !== "number" || low_stock_alert < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "low_stock_alert must be a number >= 0",
        });
      }

      // ✅ Create document
      const data = await Asset.create({
        name,
        qty,
        low_stock_alert,
      });

      res.status(201).json({
        success: true,
        message: "Asset created successfully",
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: serverError,
        error: err,
      });
    }
  });

  prop.app.get(`${urlAPI}/:id`, async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID",
        });
      }

      // ✅ Use findById (not find)
      const data = await Asset.findById(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });

  prop.app.get(`${urlAPI}-all`, async (req, res) => {
    try {
      const data = await Asset.find({});

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });

  prop.app.delete(`${urlAPI}/:id`, async (req, res) => {
    try {
      const { id } = req.params;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID",
        });
      }

      // ✅ Delete by ID
      const deleted = await Asset.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Asset deleted successfully",
        data: deleted,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });

  prop.app.get(`${urlAPI}`, async (req, res) => {
    try {
      var result = await getPagination(req.query, Asset, [], []);
      res.json({ success: true, ...result });
    } catch (err) {
      res.json({
        success: false,
        message: `មានបញ្ហាក្នុងប្រព័ន្ធ សូមព្យាយាមម្តងទៀត: ${err.message}`,
      });
    }
  });

  prop.app.put(`${urlAPI}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, qty, low_stock_alert } = req.body;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid asset ID",
        });
      }

      // ✅ Build update object dynamically
      const updateData = {};

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            success: false,
            message: "name cannot be empty",
          });
        }
        updateData.name = name;
      }

      if (qty !== undefined) {
        if (typeof qty !== "number" || qty < 0) {
          return res.status(400).json({
            success: false,
            message: "qty must be a number >= 0",
          });
        }
        updateData.qty = qty;
      }

      if (low_stock_alert !== undefined) {
        if (typeof low_stock_alert !== "number" || low_stock_alert < 0) {
          return res.status(400).json({
            success: false,
            message: "low_stock_alert must be a number >= 0",
          });
        }
        updateData.low_stock_alert = low_stock_alert;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      // ✅ Update and return new document
      const updated = await Asset.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Asset updated successfully",
        data: updated,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });
};

module.exports = route;
