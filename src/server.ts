import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const mcp = new McpServer({ name: "comparison-app", version: "0.1.0" });

const HTML_URI = "ui://widget/hello.html";
const HELLO_HTML = `
  <div style="padding:16px;font-family:system-ui;line-height:1.4">
    <h2 style="margin:0 0 8px">Hello from your ChatGPT App 👋</h2>
    <p>This is a minimal inline widget. Next, you’ll replace me with your comparison UI.</p>
  </div>
`.trim();

mcp.registerResource("hello-widget", HTML_URI, {}, async () => ({
  contents: [{
    uri: HTML_URI,
    mimeType: "text/html+skybridge",
    text: HELLO_HTML,
    _meta: { "openai/widgetPrefersBorder": true }
  }]
}));

mcp.registerTool(
  "show_hello",
  {
    title: "Show Hello Widget",
    _meta: {
      "openai/outputTemplate": HTML_URI,
      "openai/toolInvocation/invoking": "Showing hello widget…",
      "openai/toolInvocation/invoked": "Hello widget shown."
    },
    inputSchema: { message: z.string().optional() }
  },
  async (input) => {
    const text = input?.message ?? "Welcome!";
    return {
      content: [{ type: "text", text }],
      structuredContent: { message: text }
    };
  }
);

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  try {
    const result = await mcp.handleRequest(req.body);
    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
// RIGHT
app.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}/mcp`);
});
