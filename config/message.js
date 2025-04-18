function createSlackMessage(
  project,
  testPlan,
  environment,
  date,
  emoji,
  testLink,
  id,
  failedTests,
  mentionUsers = [],
  mentionUsersGroup = []
) {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${project} [${environment}] - ${testPlan} - [${date}] ${emoji}`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Tests Link",
          emoji: true,
        },
        value: "Tests Link" + id,
        url: testLink,
        action_id: "button-action",
      },
    },
    ...(failedTests && failedTests.length > 0
      ? [
          ...((mentionUsersGroup && mentionUsersGroup.length > 0) ||
          (mentionUsers && mentionUsers.length > 0)
            ? [
                {
                  type: "section",
                  text: {
                    type: "plain_text",
                    text: "Some tests have failed.",
                  },
                },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `cc: ${
                      mentionUsersGroup
                        .map((id) => `<!subteam^${id}>`)
                        .join(" ") +
                      " " +
                      mentionUsers.map((id) => `<@${id}>`).join(" ")
                    }`,
                  },
                },
              ]
            : []),
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "plain_text",
              text: "Failed tests:",
              emoji: true,
            },
          },
          ...failedTests.map((test) => ({
            type: "section",
            text: {
              type: "mrkdwn",
              text: test.name,
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Link",
                emoji: true,
              },
              value: `click_me_${test.testId}`,
              url: test.resultUrl,
              action_id: "button-action",
            },
          })),
        ]
      : []),
  ];
}

module.exports = { createSlackMessage };
