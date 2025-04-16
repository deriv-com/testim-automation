const { createSlackMessage } = require("./message.js");
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
const mentionedUsers = process.env.MENTIONED_USERS;
const mentionedUsersGroup = process.env.MENTIONED_USERS_GROUP;

const appName = process.env.APP_NAME;
const environment = process.env.ENVIRONMENT;
const testPlan = process.env.SUITE_NAME;

let id;
let date;
let messageId;

exports.config = {
  baseUrl: "https://app.testim.io",
  beforeSuite: async function (suite) {
    date = moment().utc().format("MMMM D, YYYY @ HH:mm:ss UTC");
    id = suite.executionId;

    const testimLink = `https://app.testim.io/#/project/${project}/branch/${branch}/runs/suites/${id}`;

    try {
      const message = await client.chat.postMessage({
        channel: channelId,
        blocks: createSlackMessage(
          appName,
          testPlan,
          environment,
          date,
          emoji.inProgress,
          testimLink,
          id
        ),
      });
      console.log("Message posted successfully");

      messageId = message.ts;
    } catch (error) {
      console.error("Error posting message:", error);
    }

    return {
      overrideTestData: {
        env: environment,
      },
    };
  },

  afterSuite: async function (suite) {
    const { tests } = suite;
    const failedTests = tests.filter((test) => test.status === "FAILED");
    const testimLink = `https://app.testim.io/#/project/${project}/branch/${branch}/runs/suites/${id}`;
    const icon = failedTests.length > 0 ? emoji.failed : emoji.passed;
    const users = mentionedUsers.split(",");
    const usersGroups = mentionedUsersGroup.split(",");

    try {
      await client.chat.update({
        channel: channelId,
        ts: messageId,
        blocks: createSlackMessage(
          appName,
          testPlan,
          environment,
          date,
          icon,
          testimLink,
          id,
          failedTests,
          users,
          usersGroups
        ),
      });
    } catch (error) {
      console.error("Error updating message:", error);
    }
  },
};
