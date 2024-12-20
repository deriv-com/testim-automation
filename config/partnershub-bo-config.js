const axios = require("axios");
require("dotenv").config();

exports.config = {
  beforeSuite: function (suite) {
    console.log("beforeSuite", suite);

    const slackApiUrl =
      "https://hooks.slack.com/triggers/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";

    const testim_link = `https://app.testim.io/#/project/${encodeURIComponent(
      process.env.TESTIM_PROJECT
    )}/branch/Jia%2Ftest-webhook/runs/suites/${encodeURIComponent(
      suite.executionId
    )}`;

    axios
      .post(slackApiUrl, {
        suite: `Test suite started: TestIM Partners Hub Smoke`,
        testim_link: testim_link,
        environment: process.env.GITHUB_INPUT_ENVIRONMENT,
      })
      .then((response) => {
        console.log(`Slack API posted successfully: ${response.status}`);
      })
      .catch((error) => {
        console.error(`Error posting to Slack API: ${error}`);
      });

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
