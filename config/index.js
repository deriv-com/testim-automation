const { WebClient } = require("@slack/web-api");
const moment = require("moment");
require("dotenv").config();

const emoji = {
  inProgress: ":workinprogress:",
  failed: ":release_fail:",
  passed: ":white_check_mark:",
};

const token = process.env.SLACK_TOKEN;
const client = new WebClient(token);
const channelId = process.env.SLACK_CHANNEL_ID;
const project = encodeURIComponent(process.env.TESTIM_PROJECT);
const branch = encodeURIComponent(process.env.BRANCH);

const appName = process.env.APP_NAME;
const environment = process.env.ENVIRONMENT;
const testPlan = process.env.SUITE_NAME;

let id;
let date;

exports.config = {
  beforeSuite: async function (suite) {
    date = moment().utc().format("MMMM D, YYYY @ HH:mm:ss UTC");
    id = suite.executionId;

    const testimLink = `https://app.testim.io/#/project/${project}/branch/${branch}/runs/suites/${id}`;

    let messageId;
    try {
      const message = await client.chat.postMessage({
        channel: channelId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${testimLink}|${appName} [${environment}] - ${testPlan} [${date}] ${emoji.inProgress}>`,
            },
          },
        ],
      });
      console.log("Message posted successfully");

      messageId = message.ts;
    } catch (error) {
      console.error("Error posting message:", error);
    }

    return { messageId };
  },

  afterSuite: async function (suite) {
    const { tests } = suite;

    const failedTests = tests.filter((test) => test.status === "failed");
    const testimLink = `https://app.testim.io/#/project/${project}/branch/${branch}/runs/suites/${id}`;

    try {
      const message = await client.chat.update({
        channel: channelId,
        ts: suite.messageId,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${testimLink}|${appName} [${environment}] - ${testPlan} [${date}] ${
                failedTests.length > 0 ? emoji.failed : emoji.passed
              }>`,
              emoji: true,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error updating message:", error);
    }
  },
};
