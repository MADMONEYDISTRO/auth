// Feather Hub Admin – Manage HWID whitelist
// Actions: list, add, remove

const { getStore } = require("@netlify/blobs");

const ADMIN_SECRET = process.env.ADMIN_SECRET;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const secret = event.queryStringParameters?.secret;
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const action = event.queryStringParameters?.action;
  const hwid = event.queryStringParameters?.hwid;

  try {
    const store = getStore("hwid-whitelist");
    let whitelist = (await store.get("list", { type: "json" })) || [];

    switch (action) {
      case "list":
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ whitelist }),
        };

      case "add":
        if (!hwid) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing hwid parameter" }),
          };
        }
        if (!whitelist.includes(hwid)) {
          whitelist.push(hwid);
          await store.set("list", JSON.stringify(whitelist));
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: "HWID added" }),
        };

      case "remove":
        if (!hwid) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing hwid parameter" }),
          };
        }
        whitelist = whitelist.filter((id) => id !== hwid);
        await store.set("list", JSON.stringify(whitelist));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: "HWID removed" }),
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid action. Use list, add, or remove" }),
        };
    }
  } catch (error) {
    console.error("Admin error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
