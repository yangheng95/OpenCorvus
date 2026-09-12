# Benchmark 前的运行时可靠性验收

## Recall

- 用户要求：“又出现了无效执行，bench前确保解决了锁有问题”。按停止带着已知问题继续benchmark处理，锁问题需要证据确认，不能凭无效状态命名根因。暂停一切新批次/重跑/扩跑，先修复并验收全部当前已知运行问题。
- 承接[纠偏记录](2026-09-12-outcome-first-runtime-correction.md)。论文分支HEAD为0fb9406c，当前WSL冻结runner为3f9cb474，outcome-first batch6f1e14ec首5例已全部开始，4/5仍在运行；不修改活动runner源码、不动用户进程。第6例及以后本来就未准入，本次进一步禁止新配置模型benchmark。
- 已知失败：case3 run336d4240在600秒无“公开观测”变化后无效；case1虽完成评分却采用direct绑定且没有独立Tester，不满足本轮实验条件，不能用于声称两角色配置有效。case2有真实Tester。前述通过率与调用优化结论继续待验。
- 验收：确定性复现并验证同一流式进展在运行时和benchmark观察器中的一致性；验证有workflow声明的包使用真实节点绑定、直接包正常direct；覆盖Task/Mission/Session轮次、关闭/失败/取消、重试/重启、并发与项目隔离；官方验收必须核对实际实验条件，独立只读审查全部有效发现关闭。锁/Provider错误不能凭最终timeout归类。未完成项明确保留，不启动新模型benchmark来替代前置验证。
- 已读：两份先前Recall、benchmark技能、失败观测/消息/原始事件/Provider请求与结局/运行日志/关系快照、当前和冻结Session processor、LLM activity、stream activity、workflow-binding、dispatch工具、benchmarkActivitySignature。独立agent反馈：无；首轮实现验证后委托。

## 问题分析与实施边界

1. 失败的直接触发是run-automationbench的benchmarkActivitySignature在600秒未变，最后Provider请求act_g0VUzlK5c仍未结束，随后由Server.stop统一外部中止。失败前Session活动时间1789204532786距采样约250ms、pause_depth=0、无待交互、HTTP读投影持续成功；不存在已证明的SQLite死锁。19个Provider请求最后一个只在清理时aborted。请求前两次Tool description里出现长段畸形生成文本，但它不是根因结论。
2. 观察器签名只计公开消息text长度、状态、Tool时间和trace事件，不计正在形成但未成为公开完整Tool的输入流。Runtime的语义活动监视器与观察器采用不同进展口径，存在活跃流被误杀的确定性风险；需要复现明确判定，而不是直接放宽600秒或把进程/lease心跳当业务进展。未知：该请求的完整原始流未被现密封采样保留，不能倒推每个字节的内容或模型病理生成原因。
3. 第二项明确契约漏洞：selectedWorkflowBinding(workflowID=null)对有非空workflow的包仍返回direct，dispatch工具暴露direct，case1实际以direct派发Developer并workflow_id=null结束。此前包投影测试只确认声明图，没有核对实际绑定能绕过声明。更深影响：workflowProjectionFromProjectedAgents还拿一个虚构direct binding比较包revision；修复公共选择器时必须同步用已有package revision身份比较，避免影响全部workflow调用方。
4. 修复思路：以现有语义进展owner给benchmark提供精确会话归属、可检验的进展信息，保留完全无进展时的原600秒超时及终态静止审计；不拿observer轮询/租约续期当进展。绑定层与工具schema仅接受实际manifest允许的subject，模型仍自由选择合法图、节点和调度，Host不自动选择/推进业务流程。评分资格核对真实workflow与必要参与者；业务零分不变，条件违规与评分有效性分开。
5. 全仓调用审计及测试需覆盖公开schema、绑定构造、包revision比较、Task完成、恢复事实/晚到输入、直接包及有图包、生产和冻结运行器。根因未完成验证前不修改相关实现。新准入保持暂停，已有4/5运行仅保留本轮原始证据，不作为新配置批准。

## 独立审查后的方案修正

- 全5例已自然结束，active leases为空；新模型实验仍暂停。独立审查指出整包禁止direct会封死平台universal-build及既有direct Task恢复，该方案已完整撤回。direct本身是合法公共契约；本轮两角色实验条件与原始官方评分必须分别核对，不能靠host禁止合法调用改变系统。
- 冻结processor既有测试出现1次失败，原样独立及组合复跑均通过。代码对比确认text流归属处理与主仓一致，没有证据可称新的生产流归属bug。测试却让错误流在600ms自行结束，事件循环延迟可能使测试在idle回调前自然成功；改为持续到真实abort，依靠30秒测试上限暴露故障，保留2次attempt及恢复答案的正向契约。
- 冻结测试进一步接入真实SessionProcessor→SessionStatus.getActivity→benchmark签名：合法pending Tool input片段必须推进deadline，随后无归属片段必须由真实idle机制重试。此为零模型运行时集成检查，不能声称外部Provider端到端或官方checker已通过。
- 尚未完成：原始异常流内容不可追溯；实际两角色条件的独立核对与新运行真实Provider验收；所有已知问题关闭之前继续暂停新benchmark。不得以单次绿色测试或延长超时宣布整体就绪。

## 已验证交付与未完成项

- 观察器修复冻结提交 `470d129dc2bf8baddf30367e764280fe41eabe7b`；相对3f9完整补丁及SHA-256见[receipt](../../artifacts/opencorvus-paper/experiments/luna-base-2026-09-12/stream-progress-observer-receipt.json)。未启动新模型请求。
- 独立复核无未解决的本次修复问题。冻结processor与observer集成6项/14断言通过，包含真实pending input进展、idle重试恢复、同Session持久化新input轮次及不同Session隔离。主仓跨进程租约、终态恢复、processor12项/44断言通过。冻结benchmark TypeScript类型检查通过，docs:check通过。
- 保持原600秒阈值、终态静止审计、公共direct及既有Task绑定契约。没有证据将原始无效执行归因于锁死；原Provider完整流缺失限制了该次事件的追溯。
- **新benchmark准入仍暂停**。本次没有完成全部真实实验条件验收，也没有外部Provider端到端通过证据；第1例没有独立Tester的问题仍待通过实验要求、真实参与者与官方原始评分的独立核对解决。原始历史数据不改写。不得将本次局部修复表述为全部问题已解决或100例实验已就绪。

## 11:00 工作流选择语义修正方案

Recall补充：第5例82abc8df与第1例一样，原始dispatch.workflow_subject=direct，只有Developer消息并以workflow_id=null完成；第2/4例使用execution-verification并出现Tester，case4还有真实修复后复验。继续暂停新模型benchmark。

已读主仓Base selector、Orchestrator system、公共Orchestrator core、版本生成器、包投影与catalog测试；全仓查找execution-verification调用与版本约束。Base system中“bind execution-verification”紧接“dispatch base-developer directly”，与工具的direct subject词义冲突；selector虽然要求绑定图，但旧包提示在派发动作处留下歧义。此是可验证提示缺陷，不足以证明两例模型选择的唯一成因。共享绑定层已证明direct是合法平台能力，不能再次修改该公共契约。

实施仅澄清Base的现有声明：Developer作为execution-verification首节点，明确workflow_subject的graph/node身份；Tester是独立的第二节点而非Developer自检。保持普通图、角色、工具、模型、评分、超时与恢复事实不变。按唯一版本生成器更新Base版本和payload，现有包投影/catelog正向测试更新版本。冻结runner投影同一包源码并归档精确增量。独立只读review后提交；零模型投影验收不等于模型遵守率，仍不启动benchmark。独立反馈在实施前为无（前次绑定方案已由review否决并撤回）。


实现验证：主仓包投影/catelog20项142断言通过，冻结同组20项134断言通过。Base为2026.09.12.3；版本生成器的旧baseline落后于此前已发布的6包版本，本轮刷新其既有source事实并显式将Base从.2升到.3，其他包source不变。payload生成无差异（内嵌包由其source加载）。冻结manifest使用原schema，只投影版本；初次拷贝主仓新schema的本轮错误已撤回，最终diff确认唯一manifest变化为版本。冻结catalog旧.08版本、旧3节点、旧selector标题断言已修正。docs:check通过。

[Base节点表述补丁](../../artifacts/opencorvus-paper/experiments/luna-base-2026-09-12/base-workflow-subject-clarification.patch)记录相对470d的4文件完整增量。没有新模型运行；此为声明歧义修正和零模型加载验收，不是两角色真实遵守率或官方评分实效验收。新benchmark继续暂停。

独立只读复核通过：主仓20/142、冻结20/134独立复跑；6条版本摘要复算匹配；冻结补丁逐字节一致，无未解决的本次改动发现。冻结提交84a0919412616bbd76213ee1715a7e8b8a54f5ac，父470d129d；补丁5783bytes，SHA-256 790b1a62b5cc6ffaa011349bf9166b981c56564c0a5a10a392dbb4dc9888d8e0。模型遵守及实效仍未验证。
