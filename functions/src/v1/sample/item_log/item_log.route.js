const mongoose = require("mongoose");
const AssetLog = require("./item_log.model");
const Asset = require("../item/item.model");

const baseRoute = "items_log";
const { getPagination } = require("../../../util/mongo_db/mongoDB_Post");

const route = (prop) => {
  const urlAPI = `/${prop.main_route}/${baseRoute}`;

  // **************** Create Item Log ****************
  prop.app.post(`${urlAPI}`, async (req, res) => {
    try {
      const {
        status,
        qty,
        type,
        item_id,
        name_approved_by,
        name_request_by,
        office,
        reason,
        qty_old,
        qty_transaction,
      } = req.body;

      // ✅ Validation
      if (!status || !qty || !type || !item_id) {
        return res.status(400).json({
          success: false,
          message: "status, qty, type, and item_id are required fields",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid item_id",
        });
      }

      if (!name_approved_by || !name_request_by || !office || !reason) {
        return res.status(400).json({
          success: false,
          message:
            "name_approved_by, name_request_by, office, and reason are required",
        });
      }

      const data = await AssetLog.create({
        status,
        qty,
        qty_old,
        qty_transaction,
        type,
        item_id,
        name_approved_by,
        name_request_by,
        office,
        reason,
      });

      res.status(201).json({
        success: true,
        message: "Item log created successfully",
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

  // **************** Get Item Log by ID ****************
  prop.app.get(`${urlAPI}/:id`, async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid log ID",
        });
      }

      const data = await AssetLog.findById(id).populate("item_id");

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Log not found",
        });
      }

      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });

  // **************** Get All Logs ****************
  prop.app.get(`${urlAPI}-all`, async (req, res) => {
    try {
      const data = await AssetLog.find({ deleted: false }).populate("item_id");

      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Error",
        error: err.message,
      });
    }
  });

  // **************** Delete Log (Soft Delete) ****************
  prop.app.delete(`${urlAPI}/:id`, async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid log ID",
        });
      }

      const deleted = await AssetLog.findByIdAndUpdate(
        id,
        { deleted: true },
        { new: true },
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Log not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Log deleted successfully",
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

  // **************** Pagination + Search ****************
  prop.app.get(`${urlAPI}`, async (req, res) => {
    try {
      const result = await getPagination(
        req.query,
        AssetLog,
        ["item_id"], // populate item details
        [],
      );
      res.json({ success: true, ...result });
    } catch (err) {
      res.json({
        success: false,
        message: `មានបញ្ហាក្នុងប្រព័ន្ធ សូមព្យាយាមម្តងទៀត: ${err.message}`,
      });
    }
  });

  // **************** Pagination + Search ****************

  prop.app.get(`${urlAPI}-by-id_item/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await getPaginations(
        id,
        req.query,
        AssetLog,
        ["item_id"], // populate item details
        [],
      );

      const data = await Asset.findById(id);
      res.json({ success: true, ...result, item: data });
    } catch (err) {
      res.json({
        success: false,
        message: `មានបញ្ហាក្នុងប្រព័ន្ធ សូមព្យាយាមម្តងទៀត: ${err.message}`,
      });
    }
  });

  async function getPaginations(
    id,
    query,
    Model,
    populate = [],
    additionalFilter = [],
  ) {
    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = query.sort || "created_date";
    const sortOrder = query.order === "asc" ? 1 : -1;

    // Soft delete toggle
    const includeDeleted = query.includeDeleted === "true";
    const deleteFilter = includeDeleted ? {} : { deleted: false };

    // Specific ID Filter (q_id + q_key_id)
    const qId = query.q_id;
    const qKeyId = query.q_key_id;
    let specificOr = [];

    if (qId && qKeyId) {
      let ids;
      let fields;

      try {
        ids = Array.isArray(qId) ? qId : JSON.parse(qId);
      } catch {
        ids = [qId];
      }

      try {
        fields = Array.isArray(qKeyId) ? qKeyId : JSON.parse(qKeyId || "[]");
      } catch {
        fields = qKeyId ? qKeyId.split(",") : [];
      }

      const validObjectIds = ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (fields.length && validObjectIds.length) {
        specificOr = fields.map((field) => ({
          [field]: { $in: validObjectIds },
        }));
      }
    }

    // General keyword search (q + q_key)
    const keyword = query.q?.trim();
    const qKeys = query.q_key;
    let generalOr = [];

    if (keyword && qKeys) {
      let fields;

      try {
        fields = Array.isArray(qKeys) ? qKeys : JSON.parse(qKeys || "[]");
      } catch {
        fields = qKeys ? qKeys.split(",") : [];
      }

      generalOr = fields.map((field) => {
        if (
          (field.endsWith("_id") && mongoose.Types.ObjectId.isValid(keyword)) ||
          (field.endsWith("created_by_id") &&
            mongoose.Types.ObjectId.isValid(keyword))
        ) {
          return { [field]: new mongoose.Types.ObjectId(keyword) };
        }
        return { [field]: { $regex: keyword, $options: "i" } };
      });
    }

    // Compose final MongoDB filter
    let mongoFilter = {
      ...deleteFilter,
      item_id: id,
    };

    if (specificOr.length && generalOr.length) {
      mongoFilter.$and = [{ $or: specificOr }, { $or: generalOr }];
    } else if (specificOr.length) {
      mongoFilter.$or = specificOr;
    } else if (generalOr.length) {
      mongoFilter.$or = generalOr;
    }

    // ✅ Add additional filters like is_super_admin: false
    if (additionalFilter.length > 0) {
      if (mongoFilter.$and) {
        mongoFilter.$and.push(...additionalFilter);
      } else {
        mongoFilter.$and = [...additionalFilter];
      }
    }

    // Query database with filter, pagination, sorting
    const [data, total] = await Promise.all([
      Model.find(mongoFilter)
        .sort({ [sortField]: sortOrder })
        .populate(populate)
        .skip(skip)
        .limit(limit),
      Model.countDocuments(mongoFilter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }
};

module.exports = route;
