# Website product story — from goal to delivery

Current bilingual website promotional masters replace the 251-second Mission V5R story. This is an original illustrated workflow, visibly labeled throughout, not app footage or a completed model task. The bulk-import example is a proposed product workflow; it is not an Actual Budget result or customer endorsement.

The story follows a bounded product change through requirements, implementation, review, substantive feedback and inspectable delivery. It explains product-defined mechanisms without claiming exclusive capabilities, autonomous success, measured savings or comparative performance. Actual runtime results depend on a configured available model, a running host and user acceptance. The separate real flagship case remains pending.

## Sources and editing

- [Editable bilingual script](story.json): screen copy and exact spoken/burned-in narration.
- [Renderer](build.py): original 1920×1080 motion graphics, 24 frames/second, H.264/AAC, faststart, localized posters. No stock art, fabricated app UI, reconstructed messages or music.
- `narration/`: retained synthesized speech inputs in scene order. Voices: Microsoft Xiaoxiao and Jenny through [edge-tts](https://github.com/rany2/edge-tts). Only the public script was sent; no credentials or paid model requests.
- Per-locale render manifests record actual durations, scene starts, sizes and SHA-256 hashes.
- [Chinese contact sheet](zh-CN-contact.jpg) and [English contact sheet](en-US-contact.jpg): eight frames extracted from the final physical videos, three seconds into each scene.
- Product basis: current [long-horizon documentation](../../../packages/web/src/content/docs/zh-cn/concepts/long-horizon.mdx) and [squad composition documentation](../../../packages/web/src/content/docs/zh-cn/concepts/squad-composition.mdx). These document mechanisms, not case-specific performance.
- Scope, marketing rationale and verification: [founder operations](../../records/2026-09/2026-09-08-founder-operations.md).

## Rebuild

Use Python 3.12 with Pillow 11.3.0 and ffmpeg/ffprobe on PATH. Supply local CJK regular and bold font paths on non-Windows hosts. Microsoft YaHei font files are not redistributed. Retained narration makes rendering offline; install edge-tts 7.2.7 and add `--synthesize` only to request missing narration from the external service.

```powershell
python specs/artifacts/2026-09-10-website-story/build.py --output packages/web/public/media --work /absolute/scratch/video
```

If editing spoken text, replace its corresponding retained narration explicitly before synthesizing; the renderer reuses existing audio. Re-render both masters after shared layout changes. Inspect every scene, check narration and playback, update the website provenance hashes and duration copy. Font and ffmpeg versions can change binary hashes; the manifests identify the actual published bytes.

Verification status is recorded in the founder ledger; render completion alone is not website playback or deployment acceptance.
