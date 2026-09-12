# Luna 与 Base 专家团的 AutomationBench 复刻

## Recall

- 用户原始要求：“你现在正要做的是完善论文和benchmark的分支，需要你自己运营实验，把论文完善好，首先要做的复刻luna和base专家团的实验”。随后确认“原生 Luna 与 Luna + Base 对照”。
- 当前交付来源为 `codex/paper-preliminary-results`，起点 `443a614e`；论文和本次实验交付仅提交、推送此分支，不合并 main。开始时只有三个原有未跟踪路径，保留不动。
- 验收：同一不可变 AutomationBench 任务清单、同一精确 Luna 模型的两个执行条件；官方世界状态评分；逐任务身份、原始对话、工具事件、初末世界、评分复算、版本与实际资源消耗可追溯；据实更新唯一论文稿源并独立复核。运行完成不是通过，严格零分也是有效实验结果。
- 硬约束：真实流式模型调用；不伪造历史结果；每个有效配置×任务只执行一次；保留失败；不以重复取最高分；不运行 UI 自动化；不改动用户正在使用的进程。长实验定时唤醒检查。凭据不进入日志、规格或提交。隔离时同时投影凭据和模型目录，启动前分别核验连接、目录投影和实际请求模型。
- 已读：根 AGENTS.md；benchmark-debug-template 技能；论文计划最新 Recall、实验章、README、source-map；历史 AutomationBench audit；Inspect adapter 文档；当前扩展架构；历史批协调器、单例运行器、冻结 600 例清单、官方评分 bridge、评分复算器和 2026-08-27 运行记录；当前 Provider 连接与流式入口。
- 全仓及 Git 历史搜索：论文分支没有专用 AutomationBench 运行器；该运行器在 `origin/codex/automation-workbuddy-benchmark`，查询时为 `17bc3f63fc2ed0e2d4953e50811ee106882fd8fe`。它与论文分支相差 1261 个文件，不为复刻合并整个历史产品分支。现有 Inspect catalog 没有 AutomationBench 世界评分接入，不能用 task-completed 代替正式评分。
- 官方资料：[AutomationBench 固定源码](https://github.com/zapier/AutomationBench/tree/4a8e1061254004d9dac807054eed33fad7d1ff14)，1.0.6、public 600 例、六领域、api 工具、严格评分和公开/私有集合区别。
- 独立 agent 反馈：无。初轮实现与验证通过后委托未参与实现的只读审查，禁止改文件和再次委托。
- 恢复时先读此 Recall 和下方状态，不能只凭旧记录中的 100/600 或 212/600 等计数继续执行。

## 问题深度与影响分析

1. 可观察现象：论文只保留用户确认的 100 例、34% 及未配对的 8.07% 参考；Windows 初次读取未看到原始实验目录。以 WSL root 只读检查后发现旧原始证据和完整评分环境仍在。
2. 直接触发：旧目录是 root 权限边界；普通 WSL 用户的路径检查无法证明目录不存在。此前论文计划“旧目录不存在”的环境描述不再成立。
3. 数据根因：仓库历史记载与这台机器上的持久化快照时间不同。当前本地 r3 catalog 有 141 次尝试、102 个候选、95 个完成榜单条目（case 1–95），不能用远端记录中的更晚进度代替。候选包含 15 个源码提交，不是一次固定版本实验。
4. 旧路径未解决的原因：网站/论文摘要和 derived catalog（派生目录）没有替代原始世界、run manifest（执行清单）与官方评分的证明力。需要重新核验密封文件、任务契约和 scorer（评分器），不是把发现的数字直接抄入论文。
5. 定义/调用/契约：真实 Base 入口是 Mission → child Task → Session → Provider；官方 bridge 隔离真实工具和世界；历史原生参考的执行器及样本对应关系尚未知。当前 `Provider.operations` 提供真实流式连接测试，模型目录与连接状态是不同契约。
6. 已知历史缺陷：case 96 留下 scorer transient state（评分器瞬态状态）复算错误，case 97 留下 inactivity（无活动超时）错误。远端历史包含后续共享恢复、去重与观察器修复；本机 runner 仍为 `e8cdd1be`。不得直接启动旧 runner 或把这些问题降级为模型行为。新运行前必须核对修复及共享入口、正常/终态、重启、串并行和项目隔离证据。
7. 修改范围：先写复刻计划和证据审计工具/产物；仅在确认可复用运行器与当前契约后接入两个条件。历史原始证据只读，不覆盖；新结果使用新目录。产品公共接口、迁移与 UI 本阶段不修改。
8. 风险和未知：原生 Luna 历史参考身份未知；历史混合版本不能支持固定版本因果结论；本机 Provider 连接和新实验费用/授权来源尚未验证；Git partial-clone（部分克隆）有缺失对象及网络失败线索，任何交付阻塞必须修复或精确记录。

## 执行协议

1. 从 root 私有 WSL 路径恢复实验目录清点。以现有官方 replay 脚本复算每个可用历史候选，同时核对密封文件哈希、任务 manifest、实际模型和源码身份。产出非秘密逐例摘要；目录标签和原有 passed 字段不作为新验收。
2. 冻结一个双方共享的 100 例清单：优先历史 600 例清单前 100 个身份，按已有与评分无关的确定顺序，完整保留领域和契约哈希。该集合是已暴露的复刻集合，不称 held-out（未参与开发）测试。若正式启动前范围调整，先更新协议，不结果驱动地选例。
3. 原生 Luna 条件采用官方任务指令、三种 api 工具及单 agent 循环；Base 条件采用真实 Mission/Base。两者均记录精确模型、推理参数、提示映射、工具接口、资源限制和源码。工具/推理预算差异必须在结果解释中披露，整体系统比较不能被称为纯协作增益。
4. 完成无模型环境检查和官方世界评分链检查，再验证实际 Luna 流式连接。不能把缺少模型投影说成凭据失效，不能切换其他模型凑通过。
5. 每组先完成小批真实链路运行，证据通过后滚动扩展到既定清单。有效的当前配置条目复用；旧版本结果作为历史复核单独报告。若修改执行条件或修复缺陷，记录新配置身份并明确哪些结果可比。
6. 无活动超时依据最近真实流式/工具/世界/任务进展，采用已有 600 秒窗口，不用从启动开始的总时长判死。维持有界并发和每例证据身份；长任务用线程定时唤醒检查，不持续 tail 日志。
7. 冻结结果后输出严格通过数、部分得分、逐域结果、配对转移、实际 token/调用/耗时及基础设施失败账本。缺少预算或模型快照的字段明确未知，不按零填充，不估计未测的进化收益。
8. 更新论文单一实验章、对应摘要/限制/溯源和 PDF；逐页视觉复核；运行文档检查；独立只读审查并修复全部有效发现。范围清晰地提交，fetch/merge 上游并检查待推送集合后 push 当前论文分支。

## 本机来源与当前状态

- WSL distribution：`Ubuntu-24.04`，旧 runner `/var/lib/opencorvus-benchmark/opencorvus-runner`，干净起点 `e8cdd1be4d280399bbb953562000b430f4e59fe7`。
- 官方环境：`/var/lib/opencorvus-benchmark/evaluator-venv/bin/python`，Python 3.13.15；Bun 1.3.14。
- 旧证据：`/var/lib/opencorvus-benchmark/evidence-luna-mission-base-v20260822-r3`；另有 r1/r2、Advanced/Sol 与诊断目录，彼此不合并为一个实验。
- Windows 镜像结果：`D:/myhexin-local/opencorvus-benchmark-results`，含 75/600 历史归档。归档计数不代表当前原始目录计数。
- 初读目录显示 95 个完成条目、27 个 strict pass；此处只是待复核目录观察，尚非本次复算结果。前 100 个 case 中，候选缺少 96/97，完成条目缺少 96–100。
- 尚未启动任何新的模型实验，尚未复制或使用凭据。

## 验证与交付记录

待补：官方评分复算、环境/模型预检、两个真实运行条件、最终逐例结果、论文更新、独立审查与提交。

- 首次恢复工具验证发现调用方把精简 score event 当成 replay 的完整输入，遗漏 `result.benchmark` 中的初始世界哈希与逐断言结果。密封文件和任务身份检查均通过，错误发生在调用参数映射，尚不能归因于原始证据。停止本任务自己的只读复算进程；按既有 checker 契约从密封 result 映射完整字段，保留 score event 的独立交叉检查，再重跑。

### 原生条件接入决策

- 现有专用 runner 只有 Base/Advanced，没有原生单 agent 条件。官方 Python clients 的现有调用不能直接冒充本仓库要求的全程流式路径。
- 采用官方 AutomationBench 工具 schema、原始 prompt 和 50 response-step 的普通函数调用循环；只复用 OpenCorvus Provider 的登录传输，不使用其 Orchestrator、专家提示、自动修补工具调用或协作逻辑。论文将准确称为 native tool-calling baseline，不能声称它与未知的 8.07% runner 完全相同。
- 官方世界仍由现有 `BridgeState` 与原有 replay checker 管理；原生调用桥只做标准输入输出的 JSON 请求映射，模型仅可见三个官方工具。主机评分动作不进入模型工具表。以官方真实 simple 世界进行无模型正向检查，最终模型路径另行验收。
- 新组先使用原有清单前 100 个固定身份，共 200 个一次性执行 slot（配置与任务组合）；各臂相同明确 Luna 推理档位。原生 50 steps 与历史 Base 无总步骤上限的差异公开记录，总体比较不归因为协作本身。新运行前再把 exact runtime revision、档位、命令和实际授权写入记录。

### 离线验证结果

- `python -m unittest discover -s script/benchmark -p test_recover_automationbench.py`：2 个正向/明确错误契约测试通过。
- `recover-automationbench.py` 的完整第二轮：102/102 candidate 通过文件密封、run/task/model/profile 身份及官方 checker 复算；其中95个原榜单成员有27个严格通过。结果在 [新产物目录](../../artifacts/opencorvus-paper/experiments/luna-base-2026-09-12/README.md)，不能冒充旧100例或新固定版本对照。
- `check-native-automationbench-world.py`：真实官方 simple 世界初始化、三个工具定义、base64与api_search调用、严格0分及原 checker 复算均通过，模型调用0。
- `bun build script/benchmark/run-native-automationbench.ts --target bun --packages external`：构建通过，仅证明语法/打包，不证明模型路径。
- `bun run docs:check`：339 operations、25 groups，通过；`git diff --check`通过。
- 已请求未参与实现的 reviewer 只读审查；反馈待核验。本机 OpenAI OAuth（开放授权协议）凭据使用请求仍待用户回复；未复制/使用凭据、未调用模型。

### 首轮独立审查的运行入口修复

- reviewer 发现新原生 runner 的 watchdog（无活动看门狗）只中止模型，未中止等待世界 ready/tool/score 或 stdin drain 的主机操作；SDK 的 abort 事件也可能被当普通事件继续评分。根因是同一实验执行的模型与世界等待没有共享终止信号。影响原生的初始化、工具、评分、失败证据和子进程收敛；Base旧运行器没有引用新代码，此发现不证明其存在相同实现问题。
- 修复方案：所有等待绑定同一取消信号；收到 abort 明确生成未评分失败，主机只终止本次创建的子进程并等待其退出；成功必须以自然模型终止和原有官方 replay 通过为前提。补正向取消错误契约和真实世界检查。同步将源码版本、参数、启动失败与终态结果纳入同一个持久化生命周期，避免设置阶段异常丢失执行证据。
- 最终首审共4项：上述世界等待、中止评分、设置阶段失败记录，以及 SDK `finish-step.response.headers` 的潜在凭据暴露。已统一中止世界/模型读取与发送等待；评分前检查自然终态并强制官方 replay；保存 run-start/初始化失败终态、精确运行时版本和脚本哈希；用现有 Provider 响应头脱敏器处理传输 metadata（元数据），保留模型与工具消息。3个原生契约测试、2个Python密封测试、构建和文档检查通过；真实模型路径仍待授权与执行。
- 第二轮复审发现已中止信号下仍需接管底层 Promise 拒绝，以及子进程 `error` 不等于实际 `close`。已先接管 operation（操作）再决定中止结果，新增对应错误契约测试；只以 close 兑现清理等待，错误只触发统一取消；stdin错误和主机工具传输异常也进入统一取消。重新验证并再次只读复审。
- 第三轮独立只读审查通过：已报告的7项问题全部关闭，无新的未解决发现。reviewer复跑4个Bun、2个Python聚焦测试，并以自己创建的零模型子进程确认实际close、5秒终止收敛和EPIPE（管道断开）错误收敛；未读取凭据或执行模型。审查结论仅覆盖准备交付。
- 全仓 `bun typecheck` 通过（8个任务）；新原生runner另外用严格 TypeScript 检查通过：`bunx tsc --noEmit --moduleResolution bundler --module preserve --target esnext --types bun --typeRoots packages/opencorvus/node_modules/@types --skipLibCheck --allowImportingTsExtensions --strict script/benchmark/run-native-automationbench.ts script/benchmark/native-run-contract.ts`。
- 真实CLI缺配置检查生成带run ID的 `unscored_infrastructure_failure` / `native_setup_error:ENOENT` 结果，证明初始化失败账本路径；未用空配置或stub冒充模型成功。
- 当前待办：用户回复具体OpenAI凭据使用请求；固定Base运行时并完成共享修复和真实链路预检；统一双方推理配置、执行200个一次性slot、完整验收；据实际新结果更新论文正文/PDF。本轮不声称实验或论文完善已完成。
- 现有WSL runner在确认工作区干净、未使用其进程后，以 `git merge --ff-only --no-stat 17bc3f63fc2ed0e2d4953e50811ee106882fd8fe` 从e8cdd1be快进到既有远端benchmark冻结版本，完成后HEAD精确一致、status为空；未创建额外branch/worktree，也未启动旧supervisor。该步骤只固定待运行源码，不替代共享机制/模型预检。

### 推送检查器发现的既有索引故障

- 首次提交 `ed9c9844` 后，fetch/merge显示上游已是最新，待推送集合只有本任务这一提交。push的类型、路由、文档、租约owner检查通过，但 `check:architecture-index` 报告12个失效链接。
- 根因：论文分支保留了旧架构索引的12项条目，而对应文档已在当前源码删除；对比 `origin/v0.0.55beta` 的完整差异，索引恰好多出这12条。当前架构目录全量搜索也只在README找到这些目标。修改前该文件没有用户差异。
- 修复范围仅当前架构入口README的失效链接，保持现存全部文档可达；不重建旧文档、兼容索引、产品接口或公共契约。原checker实际验证每个现存文档有入口且全部链接指向真实文件，因此复跑它作为此删除的验收；同步记录/root索引并进行只读复审后提交。
- 索引修复独立只读复审通过，无未解决发现；reviewer确认只删除12条失效链接，修复后与当前beta索引完全一致，16个现存文档全部可达；独立复跑架构、文档和差异检查均通过。package topology（包拓扑）与release mutation topology（发布变更拓扑）检查也通过。
