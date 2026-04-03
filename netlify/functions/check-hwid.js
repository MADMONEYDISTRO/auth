// Feather Hub HWID Verification – Public endpoint
// GET ?hwid=XXX

const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ valid: false, message: "Method not allowed" }),
    };
  }

  const hwid = event.queryStringParameters?.hwid;
  if (!hwid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ valid: false, message: "Missing hwid parameter" }),
    };
  }

  try {
    const store = getStore("hwid-whitelist");
    const whitelist = (await store.get("list", { type: "json" })) || [];
    const isValid = whitelist.includes(hwid);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: isValid }),
    };
  } catch (error) {
    console.error("Error checking HWID:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ valid: false, message: "Internal server error" }),
    };
  }
};
