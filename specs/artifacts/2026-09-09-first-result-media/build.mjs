import { readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import path from "node:path"

const sharpPath = process.argv[2]
if (!sharpPath || !path.isAbsolute(sharpPath)) throw new Error("Usage: node build.mjs <absolute path to Sharp module>")
const sharp = createRequire(import.meta.url)(sharpPath)
const output = path.dirname(fileURLToPath(import.meta.url))
const logo = await readFile(new URL("../../../packages/web/public/favicon.svg", import.meta.url))
const logoData = `data:image/svg+xml;base64,${logo.toString("base64")}`

const languages = {
  en: {
    badge: "FIRST RESULT",
    title: "A first result you can check.",
    subtitle: "A tiny source project. Two requests. Outputs you can inspect.",
    first: "01  EXPLAIN THE SOURCE",
    next: "02  CHANGE ONE INPUT",
    expected: "EXPECTED OUTPUT",
    verify: "03  VERIFY CODE, TEST AND EXPLANATION",
    footer: "Parcel Notes sample · Source c6b429b8e · Requires a configured model for agent tasks",
    label:
      "OpenCorvus first-result exercise: explain a 750 g total, change one weight, then verify the expected 800 g total.",
  },
  zh: {
    badge: "首次体验",
    title: "让第一份交付经得起核对",
    subtitle: "一个小项目，两轮请求，结果可以亲自检查。",
    first: "01  解释源码",
    next: "02  修改一个输入",
    expected: "预期输出",
    verify: "03  核对代码、测试与说明是否一致",
    footer: "Parcel Notes 样例 · 源码 c6b429b8e · 执行 Agent 任务需要配置可用模型",
    label: "OpenCorvus 首次任务练习：解释总重 750 克的源码，修改一个重量，再核对预期总重 800 克。",
  },
}

for (const [language, text] of Object.entries(languages)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${text.label}">
  <title>${text.label}</title>
  <rect width="1600" height="900" fill="#f4f7fb"/>
  <g font-family="Segoe UI, Microsoft YaHei, sans-serif">
    <image href="${logoData}" x="70" y="46" width="86" height="86"/>
    <text x="170" y="106" font-size="44" font-weight="700" fill="#163a8c">OpenCorvus</text>
    <rect x="1250" y="67" width="276" height="48" rx="24" fill="#e4edff"/>
    <text x="1388" y="99" text-anchor="middle" font-size="21" font-weight="600" fill="#163a8c">${text.badge}</text>
    <text x="76" y="242" font-size="68" font-weight="700" fill="#14243d">${text.title}</text>
    <text x="78" y="300" font-size="28" fill="#4c5f7a">${text.subtitle}</text>
    <rect x="76" y="365" width="704" height="327" rx="24" fill="#ffffff" stroke="#d7e1ee" stroke-width="2"/>
    <rect x="804" y="365" width="720" height="327" rx="24" fill="#163a8c"/>
    <text x="112" y="419" font-size="23" font-weight="600" fill="#4c5f7a">${text.first}</text>
    <text x="840" y="419" font-size="23" font-weight="600" fill="#d0e0ff">${text.next}</text>
    <text x="112" y="490" font-size="40" fill="#263c5b">125 + 250 + 375</text>
    <text x="840" y="490" font-size="40" fill="#ffffff">125 + 250 + <tspan font-weight="700" fill="#9fdfff">425</tspan></text>
    <text x="112" y="552" font-size="19" font-weight="600" fill="#5c6e86">${text.expected}</text>
    <text x="840" y="552" font-size="19" font-weight="600" fill="#d0e0ff">${text.expected}</text>
    <text x="108" y="646" font-size="88" font-weight="700" fill="#163a8c">750<tspan dx="12" font-size="40" font-weight="400">g</tspan></text>
    <text x="836" y="646" font-size="88" font-weight="700" fill="#ffffff">800<tspan dx="12" font-size="40" font-weight="400">g</tspan></text>
    <text x="78" y="762" font-size="28" font-weight="600" fill="#163a8c">${text.verify}</text>
    <line x1="76" y1="805" x2="1524" y2="805" stroke="#d7e1ee" stroke-width="2"/>
    <text x="78" y="849" font-size="21" fill="#4c5f7a">${text.footer}</text>
  </g>
</svg>`
  await writeFile(path.join(output, `first-result-${language}.svg`), svg)
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(output, `first-result-${language}.png`))
}
