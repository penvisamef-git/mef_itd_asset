const index = (prop) => {
  // Declaration
  prop.main_route = "api/v1/admin";

  // All Route ==========================
  const authRoute = require("./auth/auth.route");
  const sessionRoute = require("./session/session.route");
  const userRoute = require("./user/user.route");
  const userGroupRoute = require("./user/group/group_user.route");
  const activityLogRoute = require("./activity_log/activity_log.route");
  const activityLogCategoryRoute = require("./activity_log_category/activity_log_category.route");

  // Implement ==========================
  authRoute(prop); // Auth
  sessionRoute(prop); // Auth
  userRoute(prop); // User
  userGroupRoute(prop); // Group Permission
  activityLogRoute(prop); // Log
  activityLogCategoryRoute(prop); // Log

  // Sample
  const item = require("../sample/item/item.route");
  const itemLog = require("../sample/item_log/item_log.route");
  item(prop);
  itemLog(prop);
};

module.exports = index;
