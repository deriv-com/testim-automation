exports.config = {
  beforeSuite: function (suite) {
    console.log("beforeSuite", suite);

    return {
      g_execution_id: suite.executionId,
      g_login: process.env.G_LOGIN || "",
      g_password: process.env.G_PASSWORD || "",

      g_login_bo: process.env.G_LOGIN_BO || "",
      g_password_bo: process.env.G_PASSWORD_BO || "",

      g_login_non_partner: process.env.G_LOGIN_NON_PARTNER || "",
      g_password_non_partner: process.env.G_PASSWORD_NON_PARTNER || "",
    };
  },
};
