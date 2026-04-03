// Feather Hub Admin – Simple HWID management
const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Get secret from query string (GET) or body (POST)
  let secret = event.queryStringParameters?.secret;
  if (event.httpMethod === "POST" && event.body) {
    try {
      const body = JSON.parse(event.body);
      secret = body.secret;
    } catch (e) {}
  }

  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  
  // Debug: log if secret is configured (won't show in browser)
  console.log("ADMIN_SECRET exists?", !!ADMIN_SECRET);
  console.log("Received secret:", secret);

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized - Invalid or missing secret" }),
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
         
