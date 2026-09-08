# A first result you can check / 可核对的首次交付

[English](#english) · [中文](#中文)

## English

Parcel Notes is a tiny project for trying OpenCorvus with fixed, public inputs.
It adds three parcel weights and prints their total. The first task is to explain
the code with source references; a follow-up changes one weight and updates the
result. You can check both without trusting the model's description of its work.

This is an onboarding exercise, not a benchmark or a report of a successful model
run. Running the sample itself needs Node.js 22 or newer on your command path and
uses no external packages. Running an OpenCorvus task additionally needs the
[runtime and model setup](https://opencorvus.com/start/quickstart/).
Model availability, time and cost depend on your provider and configuration.

### 1. Copy the project

From the root of a downloaded or cloned OpenCorvus source checkout, copy only
`examples/parcel-notes` into a disposable directory. Open that copied directory
as the project, so the task has three input files rather than the entire OpenCorvus
repository. The guide you are reading stays outside the copied project.

PowerShell:

```powershell
$trial = Join-Path ([IO.Path]::GetTempPath()) ("parcel-notes-" + [guid]::NewGuid().ToString("N"))
Copy-Item -LiteralPath examples/parcel-notes -Destination $trial -Recurse
Set-Location -LiteralPath $trial
node src/index.js
node --test test/output.test.js
```

Bash:

```bash
trial="$(mktemp -d)/parcel-notes"
cp -R examples/parcel-notes "$trial"
cd "$trial"
node src/index.js
node --test test/output.test.js
```

The first command prints `750 g`; the second reports one passing test. No
dependency installation is needed. If `node` is unavailable, resolve that local
prerequisite before asking the model to run the project.

### 2. Ask for a source-backed overview

Use the copied directory with the [quickstart](https://opencorvus.com/start/quickstart/).
Choose a configured model and send this request as a Code task in the workbench,
or as the quickstart's Task `request` with `productPillar` set to `code`:

> Inspect this project and create docs/first-result.md. Explain what the program
> does, its entry point, its inputs and units, and the start and test commands.
> Cite exact source paths for each claim. Run the program and its existing test
> and record the observed output, or explain precisely what prevented execution.
> Keep application source, package.json and tests unchanged. Distinguish observed
> results from assumptions.

Review the actual file and source:

| Check                    | Evidence you can inspect                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Entry point and commands | `package.json`: `start` runs `node src/index.js`; `test` runs `node --test test/output.test.js`.             |
| Inputs and calculation   | `src/index.js`: 125, 250 and 375 grams, summed with `reduce`.                                                |
| Observed behavior        | Run `node src/index.js` yourself: `750 g`.                                                                   |
| Test contract            | `test/output.test.js` executes the program and expects `750 g`.                                              |
| Deliverable              | `docs/first-result.md` exists, cites those paths and accurately describes execution evidence or its blocker. |

A Task's completed status does not establish these checks. If the model could not
execute a command, record that as incomplete execution even if its explanation is
otherwise correct. The sample has no defined external-input validation contract;
an overview should not invent one.

### 3. Continue the same task

After accepting the overview, send this follow-up in the same Task, using the
workbench conversation or the quickstart's continuation request:

> Change the third parcel weight from 375 to 425 grams. Update the existing output
> test to the new expected total, run the program and test, and update
> docs/first-result.md with the new observed result. Keep the other two weights
> unchanged. Show which files changed and report any execution blocker.

Now the expected total is `800 g`. Inspect `src/index.js`, `test/output.test.js`
and `docs/first-result.md`, then run the two commands again. This checks whether
the follow-up produced a consistent change across code, test and explanation.
The original source checkout should still print `750 g`.

### Optional feedback

If you want to share the result, use the existing [support channels](../SUPPORT.md).
Include only information you are comfortable making public:

- OpenCorvus version and operating system.
- Provider/model identifier; do not include keys or login codes.
- First task: accepted, needs correction, or blocked; which check decided it.
- Follow-up: accepted, needs correction, blocked, or not attempted.
- Elapsed time and provider-reported cost, if measured; otherwise “unknown”.
- A short reproduction or redacted error if blocked.

There is no tracking in this sample. Sharing feedback is optional, and a locally
passing sample is not evidence of community adoption or general model quality.

## 中文

Parcel Notes 是一个输入固定、内容公开的小项目，用于体验 OpenCorvus。它把三个包裹
的重量相加并输出总重。首次任务要求解释代码并引用来源，后续任务修改一个重量，
同步更新代码、测试和说明。你可以亲自核对结果。

这是首次使用练习，不是基准测试，也不是模型已成功完成任务的报告。样例本身需要
命令行可调用的 Node.js 22 或更新版本，没有外部依赖。执行 OpenCorvus 任务还需要
[安装运行时并配置模型](https://opencorvus.com/zh-cn/start/quickstart/)。模型是否可用、
耗时和费用取决于你的 Provider 与配置。

### 1. 复制项目

在下载或克隆的 OpenCorvus 源码根目录，执行上方的 PowerShell 或 Bash 命令，
只把 `examples/parcel-notes` 复制到一个临时目录。以该副本作为 OpenCorvus 项目，
输入只有三个文件；本指南留在副本之外。

`node src/index.js` 应输出 `750 g`；`node --test test/output.test.js` 应报告一项测试通过。
无需安装项目依赖。如果 `node` 命令不可用，先解决本地运行前提。

### 2. 请求有来源的项目说明

按[快速开始](https://opencorvus.com/zh-cn/start/quickstart/)使用复制出的项目目录。
选择已配置的模型，在工作台创建 Code 任务并发送下面的请求；也可将其作为快速开始中
Task 的 `request`，将 `productPillar` 设为 `code`：

> 检查这个项目并创建 docs/first-result.md。说明程序用途、入口、输入和单位，以及启动
> 与测试命令。每项事实都引用准确的源码路径。运行程序和现有测试，记录观察到的输出；
> 如果无法执行，明确说明阻塞原因。保持应用源码、package.json 和测试不变。区分观察
> 到的结果与推测。

逐项查看实际文件：

| 核对项     | 可检查的证据                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 入口和命令 | `package.json` 的 `start` 为 `node src/index.js`，`test` 为 `node --test test/output.test.js`。 |
| 输入与计算 | `src/index.js` 将 125、250、375 克通过 `reduce` 相加。                                          |
| 实际行为   | 自己运行 `node src/index.js`，得到 `750 g`。                                                    |
| 测试契约   | `test/output.test.js` 执行程序，期望输出 `750 g`。                                              |
| 交付物     | `docs/first-result.md` 存在，准确引用以上路径，并如实说明执行证据或阻塞。                       |

Task 显示完成不等于以上核对已通过。如果模型没有执行命令，即使说明正确，也应记录
为执行验收未完成。样例没有定义外部输入校验契约，说明中不应编造这项能力。

### 3. 在同一任务中继续

接受首次说明后，在同一 Task 的对话中发送以下请求，或使用快速开始里的继续任务接口：

> 把第三个包裹的重量从 375 改成 425 克。更新现有输出测试的预期总重，运行程序和测试，
> 并在 docs/first-result.md 中更新观察到的结果。保持另外两个重量不变。说明修改了哪些
> 文件，并报告任何执行阻塞。

新的预期总重是 `800 g`。检查 `src/index.js`、`test/output.test.js` 和
`docs/first-result.md`，再运行前面的两条命令。这一步核对代码、测试和说明是否同步更新。
原始源码目录中的样例仍应输出 `750 g`。

### 自愿反馈

如愿意反馈，请使用现有[支持渠道](../SUPPORT.md)，只提供适合公开的信息：

- OpenCorvus 版本和操作系统。
- Provider／模型标识；不要提供密钥或登录验证码。
- 首次任务：接受、需修改或阻塞；具体是哪项核对决定了结果。
- 后续任务：接受、需修改、阻塞或未尝试。
- 如有测量，提供耗时及 Provider 报告的费用；否则写“未知”。
- 遇到阻塞时，提供简短复现步骤或脱敏错误。

样例没有行为追踪，反馈完全自愿。本地样例通过不能证明社区采用情况或模型的整体质量。
