import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import type { ParsedComponent } from "../parser/react-parser.js";

interface ExtractedVariantData {
  name: string;
  propValues: Record<string, string>;
  frame: {
    width: number;
    height: number;
    fills: { r: number; g: number; b: number; a: number }[];
    padding: { top: number; right: number; bottom: number; left: number };
    gap: number;
    cornerRadius: number;
    display: string;
    flexDirection: string;
    alignItems: string;
    justifyContent: string;
    typography: {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
    };
  };
}

export interface FigmaJsonOutput {
  name: string;
  type: string;
  variants: ExtractedVariantData[];
}

export async function extractFigmaData(
  component: ParsedComponent
): Promise<FigmaJsonOutput> {
  // Generate the React entry code dynamically
  const entryCode = `
    import React from "react";
    import { createRoot } from "react-dom/client";
    import { ${component.name} } from "${component.filePath.replace(/\\/g, "/")}";

    const variants = ${JSON.stringify(component.variants)};

    function App() {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
          {variants.map((v, i) => (
            <div key={i} data-variant-name={v.name} style={{ display: 'inline-block' }}>
              <${component.name} {...v.propValues} />
            </div>
          ))}
        </div>
      );
    }

    const root = createRoot(document.getElementById("root"));
    root.render(<App />);
  `;

  const tempEntryPath = path.resolve(process.cwd(), ".figma-temp-entry.tsx");
  fs.writeFileSync(tempEntryPath, entryCode);

  // Start Vite server
  const server = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { port: 0 }, // random port
    plugins: [
      react(),
      {
        name: "virtual-html",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/" || req.url === "/index.html") {
              res.setHeader("Content-Type", "text/html");
              res.end(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script type="module">
                      import RefreshRuntime from "/@react-refresh"
                      RefreshRuntime.injectIntoGlobalHook(window)
                      window.$RefreshReg$ = () => {}
                      window.$RefreshSig$ = () => (type) => type
                      window.__vite_plugin_react_preamble_installed__ = true
                    </script>
                  </head>
                  <body>
                    <div id="root"></div>
                    <script type="module" src="/.figma-temp-entry.tsx"></script>
                  </body>
                </html>
              `);
            } else {
              next();
            }
          });
        }
      },
    ],
  });

  await server.listen();
  const port = server.config.server.port;
  const url = `http://localhost:${port}`;

  console.log(`[Renderer] Server started at ${url}`);

  // Launch Playwright with Linux Chromium and disable GPU to prevent WSL crashes
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer'
    ]
  });

  const page = await browser.newPage();
  
  page.on("console", (msg) => console.log("[Browser Console]", msg.text()));
  page.on("pageerror", (err) => console.error("[Browser Error]", err.message));

  await page.goto(url, { waitUntil: "networkidle" });

  // Wait for the variants to mount
  await page.waitForSelector("[data-variant-name]", { timeout: 10000 });

  // Extract computed styles
  const extractedVariants = await page.evaluate(() => {
    const parseRgba = (rgbaStr: string) => {
      const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!match) return { r: 0, g: 0, b: 0, a: 1 };
      return {
        r: parseInt(match[1]) / 255,
        g: parseInt(match[2]) / 255,
        b: parseInt(match[3]) / 255,
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    };

    const elements = document.querySelectorAll("[data-variant-name]");
    const results: any[] = [];

    elements.forEach((container) => {
      const name = container.getAttribute("data-variant-name");
      const target = container.firstElementChild; // The actual component
      if (!target) return;

      const style = window.getComputedStyle(target);
      const rect = target.getBoundingClientRect();

      // Only push solid colors for now (avoid transparent)
      const fills = [];
      const bgColor = parseRgba(style.backgroundColor);
      if (bgColor.a > 0) fills.push(bgColor);

      results.push({
        name,
        frame: {
          width: rect.width,
          height: rect.height,
          fills,
          padding: {
            top: parseFloat(style.paddingTop),
            right: parseFloat(style.paddingRight),
            bottom: parseFloat(style.paddingBottom),
            left: parseFloat(style.paddingLeft),
          },
          gap: parseFloat(style.gap) || 0,
          cornerRadius: parseFloat(style.borderTopLeftRadius) || 0,
          display: style.display,
          flexDirection: style.flexDirection,
          alignItems: style.alignItems,
          justifyContent: style.justifyContent,
          typography: {
            fontFamily: style.fontFamily,
            fontSize: parseFloat(style.fontSize),
            fontWeight: parseInt(style.fontWeight),
          },
        },
      });
    });

    return results;
  });

  await browser.close();
  await server.close();

  // Clean up temp file
  if (fs.existsSync(tempEntryPath)) {
    fs.unlinkSync(tempEntryPath);
  }

  // Merge the prop values from the AST with the visual data from Playwright
  const enrichedVariants: ExtractedVariantData[] = component.variants.map((astVar) => {
    const visualData = extractedVariants.find((v) => v.name === astVar.name);
    return {
      name: astVar.name,
      propValues: astVar.propValues,
      frame: visualData ? visualData.frame : {
        width: 100, height: 40, fills: [], padding: { top: 0, right: 0, bottom: 0, left: 0 },
        gap: 0, cornerRadius: 0, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center",
        typography: { fontFamily: "Inter", fontSize: 14, fontWeight: 400 }
      }
    };
  });

  return {
    name: component.name,
    type: enrichedVariants.length > 1 ? "COMPONENT_SET" : "COMPONENT",
    variants: enrichedVariants,
  };
}
