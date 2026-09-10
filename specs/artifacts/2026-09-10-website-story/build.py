"""Original narrated product workflow. No screenshots, model runs or invented logs.

Python 3.12, Pillow 11.3.0, edge-tts 7.2.7, ffmpeg/ffprobe on PATH.
Existing narration is reused; --synthesize explicitly requests missing public speech.
Fonts are caller-provided; defaults use Windows Microsoft YaHei and Segoe UI.
"""
import argparse
import asyncio
import hashlib
import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
W, H, FPS = 1920, 1080, 24
PAPER, INK, MUTED, ACCENT = '#f7f5ef', '#182c35', '#586b72', '#d75435'


def probe(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(path)]))


def wrap(draw, text, font, width):
    # Preserve words in English and allow natural character wrapping in Chinese.
    units = text.split(' ') if ' ' in text else list(text)
    sep = ' ' if ' ' in text else ''
    lines, line = [], ''
    for unit in units:
        candidate = line + (sep if line else '') + unit
        if draw.textlength(candidate, font=font) > width and line:
            lines.append(line)
            line = unit
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def scene_image(scene, locale, label, index, font_path, bold_path):
    dark = index in (0, 2, 4, 6, 7)
    bg, fg, quiet = ('#102b31', '#f7f5ef', '#a2b9b7') if dark else (PAPER, INK, MUTED)
    img = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(img)
    fonts = {(size, bold): ImageFont.truetype(str(bold_path if bold else font_path), size)
             for size in (22, 26, 28, 30, 32, 36, 38, 44, 54, 66, 74, 88, 160) for bold in (False, True)}
    font = lambda size, bold=False: fonts[size, bold]
    # Editorial grid on the illustration half; never resembles the application UI.
    grid = '#1b383f' if dark else '#e8e9df'
    for x in range(990, 1920, 90):
        d.line((x, 145, x, 860), fill=grid)
    for y in range(145, 861, 90):
        d.line((970, y, 1920, y), fill=grid)
    d.text((90, 57), 'OpenCorvus', font=font(38, True), fill=fg)
    d.text((1830, 73), label, anchor='ra', font=font(22), fill=quiet)
    d.text((94, 230), scene['tag'], font=font(26, True), fill='#e77b58' if dark else ACCENT)
    title_size = 74 if locale == 'zh-CN' else 66
    titles = []
    for paragraph in scene['title'].split('\n'):
        titles.extend(wrap(d, paragraph, font(title_size, True), 860))
    if len(titles) > 4:
        raise ValueError('Title exceeds art-direction area')
    for n, line in enumerate(titles):
        d.text((88, 310+n*96), line, font=font(title_size, True), fill=fg)
    accent_lines = wrap(d, scene['accent'], font(30), 810)
    for n, line in enumerate(accent_lines):
        d.text((94, 748+n*43), line, font=font(30), fill=quiet)
    d.line((90, 882, 1830, 882), fill=grid, width=2)
    captions = wrap(d, scene['voice'], font(28), 1680)
    if len(captions) > 3:
        raise ValueError('Narration caption exceeds three lines')
    for n, line in enumerate(captions):
        d.text((960, 924+n*41), line, anchor='ma', font=font(28), fill=fg)
    return img, (font, fg, quiet, dark)


def animate(img, scene, style, index, t, duration):
    font, fg, quiet, dark = style
    d = ImageDraw.Draw(img)
    mint, orange = '#addec9', '#ed805e'
    progress = min(1, t/3)
    ease = 1-(1-progress)**3
    pairs = scene['cards']

    def text(x, y, value, size=30, color=None, bold=False):
        d.text((x, y), value, font=font(size, bold), fill=color or fg)

    def paper(x, y, title, body, n, width=590, height=170, color='#f7f5ef'):
        d.rounded_rectangle((x+10, y+12, x+width+10, y+height+12), radius=12, fill='#092127' if dark else '#dce1d7')
        d.rounded_rectangle((x, y, x+width, y+height), radius=12, fill=color)
        d.line((x+24, y+27, x+24, y+height-25), fill=ACCENT, width=5)
        text(x+47, y+22, title, 36, INK, True)
        for k, line in enumerate(wrap(d, body, font(26), width-100)):
            text(x+47, y+85+k*34, line, 26, MUTED)
        text(x+width-65, y+25, str(n), 26, ACCENT)

    def arrow(a, b, color=mint, width=5):
        d.line((*a, *b), fill=color, width=width)
        angle = math.atan2(b[1]-a[1], b[0]-a[0])
        pts = [b, (b[0]-20*math.cos(angle-.5), b[1]-20*math.sin(angle-.5)),
               (b[0]-20*math.cos(angle+.5), b[1]-20*math.sin(angle+.5))]
        d.polygon(pts, fill=color)

    if index == 0:
        # Separate work streams slide into view with distinct stagger and floating depth.
        for j, (title, body) in enumerate(pairs):
            reveal = min(1, max(0, (t-j*.45)/1.3))
            offset = round(360*(1-reveal)**3)
            x = 1060+(35 if j == 1 else 0)+offset
            y = 245+j*192+round(6*math.sin(t*1.2+j))
            paper(x, y, title, body, j+1)
        text(1070, 166, '01  /  02  /  03', 26, orange, True)
    elif index == 1:
        # A single brief: inputs become an explicitly bounded outcome.
        d.ellipse((1150, 178, 1730, 758), outline='#d5ddd2', width=2)
        d.rounded_rectangle((1050, 235, 1780, 791), radius=22, fill=INK)
        text(1090, 273, 'GOAL' if 'Example' in scene['accent'] else '交付目标', 44, mint, True)
        for j, (title, body) in enumerate(pairs):
            y = 369+j*128
            d.ellipse((1092, y+9, 1110, y+27), fill=orange)
            text(1140, y, title, 32, '#f7f5ef', True)
            text(1140, y+48, body, 26, '#b6c8c5')
        d.line((1051, 790, 1051+int(728*ease), 790), fill=ACCENT, width=7)
    elif index == 2:
        # One continuous path. The moving pulse symbolizes handoff, not a live task state.
        d.line((1100, 265, 1100, 733), fill='#45615e', width=4)
        pulse_y = 265+int(((t*.13) % 1)*468)
        d.ellipse((1089, pulse_y-11, 1111, pulse_y+11), fill=orange)
        for j, (title, body) in enumerate(pairs):
            y = 245+j*225
            d.ellipse((1076, y, 1124, y+48), fill=mint)
            text(1170, y-8, title, 44, fg, True)
            text(1170, y+64, body, 28, quiet)
        text(1068, 159, 'MISSION', 26, orange, True)
    elif index == 3:
        # Descending artifact handoffs; the orange baton moves between stages.
        for j, (title, body) in enumerate(pairs):
            x, y = 1015+j*60, 208+j*209
            paper(x, y, title, body, j+1, width=595, height=151)
            if j < 2:
                arrow((x+60, y+163), (x+60, y+197), ACCENT)
        pos = (t*.3) % 2
        y = 279+209*pos
        d.ellipse((1740, y, 1764, y+24), fill=ACCENT)
    elif index == 4:
        # A feedback ring drives three affected deliverables, not a fake chat message.
        d.arc((1070, 212, 1740, 802), 205, 550, fill='#45615e', width=4)
        phase = t*.7
        px, py = 1405+335*math.cos(phase), 507+295*math.sin(phase)
        d.ellipse((px-11, py-11, px+11, py+11), fill=orange)
        for j, (title, body) in enumerate(pairs):
            paper(1158, 252+j*170, title, body, j+1, width=510, height=142,
                  color=mint if int(t/2)%3 == j else PAPER)
    elif index == 5:
        # Open delivery folio with three clearly distinct artifact tabs.
        d.rounded_rectangle((1053, 231, 1785, 792), radius=18, fill='#dbe4d6')
        d.rounded_rectangle((1053, 210, 1340, 280), radius=13, fill='#dbe4d6')
        for j, (title, body) in enumerate(pairs):
            paper(1090, 294+j*145, title, body, j+1, width=642, height=130)
        text(1100, 158, 'DELIVERY' if pairs[0][0]=='Run it' else '交付物', 26, ACCENT, True)
    elif index == 6:
        # A human-centered orbit: two-way control around a workbench.
        cx, cy, radius = 1415, 510, 247
        d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius), outline='#45615e', width=3)
        phase = t*.3
        px, py = cx+radius*math.cos(phase), cy+radius*math.sin(phase)
        d.ellipse((px-9,py-9,px+9,py+9), fill=orange)
        d.ellipse((cx-154,cy-154,cx+154,cy+154), fill=mint)
        text(cx-123, cy-34, 'OpenCorvus', 36, INK, True)
        text(1110, 168, pairs[0][0], 54, fg, True)
        text(1110, 235, pairs[0][1], 28, quiet)
        text(1500, 742, pairs[2][0], 44, fg, True)
        text(1400, 800, pairs[2][1], 28, quiet)
    else:
        # Closing typographic monument and a single route forward.
        text(1040, 200, 'GO', 160, mint, True)
        arrow((1060, 454), (1750, 454), orange, 8)
        for j, (title, body) in enumerate(pairs):
            y = 520+j*100
            text(1056, y, f'0{j+1}', 30, orange, True)
            text(1140, y-4, title, 36, fg, True)
            text(1140, y+43, body, 26, quiet)
    d.rectangle((90, 880, 90+int(1740*t/duration), 883), fill=orange if dark else ACCENT)


async def synthesize(text, voice, path):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate='+6%').save(str(path))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--work', type=Path, required=True)
    p.add_argument('--locale', choices=['zh-CN', 'en-US'])
    p.add_argument('--font', type=Path, default=Path('C:/Windows/Fonts/msyh.ttc'))
    p.add_argument('--bold-font', type=Path, default=Path('C:/Windows/Fonts/msyhbd.ttc'))
    p.add_argument('--synthesize', action='store_true')
    args = p.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    args.work.mkdir(parents=True, exist_ok=True)
    story = json.loads((ROOT/'story.json').read_text(encoding='utf-8'))
    for locale, data in story.items():
        if args.locale and locale != args.locale:
            continue
        audio_dir = ROOT/'narration'/locale
        audio_dir.mkdir(parents=True, exist_ok=True)
        clips, timings, start = [], [], 0
        stem = f'opencorvus-delivery-v1-{locale}'
        for index, scene in enumerate(data['scenes']):
            audio = audio_dir/f'{index+1:02}.mp3'
            if not audio.exists():
                if not args.synthesize:
                    raise RuntimeError(f'Missing narration: {audio}; use --synthesize')
                asyncio.run(synthesize(scene['voice'], data['voice'], audio))
            duration = math.ceil((probe(audio)+1.0)*FPS)/FPS
            base, style = scene_image(scene, locale, data['label'], index, args.font, args.bold_font)
            clip = args.work/f'{locale}-{index:02}.mp4'
            command = ['ffmpeg','-hide_banner','-loglevel','error','-y',
                '-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}',
                '-framerate',str(FPS),'-i','pipe:0','-i',str(audio),
                '-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p',
                '-c:a','aac','-b:a','128k','-ar','48000','-ac','2',
                '-af','apad','-t',str(duration),'-movflags','+faststart',str(clip)]
            process = subprocess.Popen(command, stdin=subprocess.PIPE)
            for frame in range(round(duration*FPS)):
                t = frame/FPS
                img = base.copy()
                animate(img, scene, style, index, t, duration)
                process.stdin.write(img.tobytes())
                if frame == min(48, round(duration*FPS)-1):
                    img.save(args.work/f'{locale}-{index:02}.jpg', quality=94)
                    if index == 0:
                        img.save(args.output/f'{stem}-poster.jpg', quality=94)
            process.stdin.close()
            if process.wait() != 0:
                raise RuntimeError(f'ffmpeg failed: {clip}')
            clips.append(clip)
            timings.append({'scene':index+1,'start':round(start,3),'duration':duration})
            start += duration
            print(f'{locale} scene {index+1}/8: {duration:.2f}s', flush=True)
        playlist = args.work/f'{locale}-concat.txt'
        playlist.write_text(''.join(f"file '{clip.as_posix()}'\n" for clip in clips), encoding='utf-8')
        output = args.output/f'{stem}.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0',
            '-i',str(playlist),'-c','copy','-movflags','+faststart',str(output)], check=True)
        (ROOT/f'{locale}-render.json').write_text(json.dumps({
            'durationSeconds':probe(output),'scenes':timings,
            'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
            'bytes':output.stat().st_size,'voice':data['voice']}, indent=2)+'\n', encoding='utf-8')


if __name__ == '__main__':
    main()
