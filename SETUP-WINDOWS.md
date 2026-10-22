# Windows Setup — Clone Reels reference pipeline

This guide covers the three upgrade steps for the ranking reel generator:

1. **Reference input** — take a reference reel from a video URL and rebuild its beat structure.
2. **New visuals** — regenerate every character image from your own prompts.
3. **New AI voice** — voice the rewritten narration with a new voice preset.

> The starter does **not** do any of this on its own. Before this upgrade the
> project only had a hand-edited `src/data/ranking.ts`, static SVG art and
> Remotion-rendered MP4 output. The steps below are new.

---

## 1. Prerequisites

| Tool | Why | Install |
| --- | --- | --- |
| Node.js 20+ | runs the scripts and the studio | `winget install OpenJS.NodeJS.LTS` |
| FFmpeg **and** ffprobe | scene-cut detection, keyframes, audio | `winget install Gyan.FFmpeg` |
| An OpenAI API key | the rebuild, the visuals and the voice | <https://platform.openai.com/api-keys> |

Check the tools (ffmpeg and ffprobe must both resolve):

```powershell
node -v
ffmpeg -version
ffprobe -version
```

If `ffmpeg` is not found, close and reopen the terminal, or add the folder that
contains `ffmpeg.exe` to the system PATH.

## 2. Install the project

```powershell
cd D:\Clipped\2DAnimation
npm install
```

The install adds one dev dependency, `tsx`, which runs the TypeScript scripts
directly. Nothing else is added: the OpenAI calls use `fetch`, so there is no
SDK to install.

## 3. Add the API key

```powershell
Copy-Item .env.example .env
notepad .env
```

`.env`:

```dotenv
OPENAI_API_KEY=sk-your-key-here
```

The npm scripts load `.env` automatically (`--env-file-if-exists=.env`). If the
key lives in a system environment variable instead, that works too — the
scripts read `process.env.OPENAI_API_KEY`.

## 4. Rebuild a reel from a reference video URL

```powershell
npm run reference -- --url "https://example.com/reference-reel.mp4"
```

What it does:

1. Downloads the reference video into `scripts/.cache/reference.mp4`.
2. Runs `ffprobe` for the real duration, fps and resolution.
3. Runs ffmpeg's scene detector to find every hard cut, then splits the video
   into one beat per cut (or into `--count` even beats when the reference has
   no cuts).
4. Pulls a keyframe for every beat into `public/reels/reference/NN.jpg`.
5. Writes the beat structure to `public/reels/reference.json`.
6. With an API key set, sends the beat structure and the keyframes to the
   vision model and asks it to **rebuild** the ranking: new names, new
   categories, new captions, new narration, new character prompts and the same
   pacing. The result is written to `public/reels/blueprint.json`.

Useful flags:

```powershell
npm run reference -- --url "https://example.com/reel.mp4" --count 8 --title "Streetball Kings"
npm run reference -- --url "https://example.com/reel.mp4" --voice hype
```

The reference is only used as a **structure** reference. The characters, art,
names and wording are all new.

## 5. Generate the new visuals

```powershell
npm run visuals
```

Every entry's `visualPrompt` is rendered with the image model using the shared
art direction, and saved as `public/characters/<id>.png`; the blueprint is
updated with the new paths.

```powershell
npm run visuals -- --style "flat vector, neon rim light, bold outlines"
npm run visuals -- --dry     # print the prompts, generate nothing
```

Without an API key the script copies the bundled original SVG art as a
stand-in so the rest of the flow can still be rehearsed.

## 6. Generate the new AI voice

```powershell
npm run voice
```

Every narration line in the blueprint is spoken with the speech model using the
chosen voice preset's instruction, and saved as `public/audio/<id>.mp3`
(`intro`, one per entry, `outro`).

```powershell
npm run voice -- --voice cinematic   # cinematic | hype | documentary | storyteller
npm run voice -- --dry               # print the lines, generate nothing
```

The presets are defined in `src/reels/blueprint.ts` (`VOICE_PRESETS`): each one
carries the speech instruction, the voice slot and the speed.

## 7. Run the whole chain

```powershell
npm run reel:build -- --url "https://example.com/reference-reel.mp4"
```

## 8. Merge several videos from URLs into one ranking

Clone Reels can merge **several videos** into one countdown. Each rank takes a
clip with its own URL, trim range, on-screen length and manual title.

1. Open `http://localhost:3000/?section=reels`.
2. Expand a rank in **The Ranking**.
3. Press **Load a sample merge** to try it immediately — it merges three bundled clips from
   `public/samples/` into the top ranks with their own titles and lengths.
4. In the **Video clip** box, paste the clip URL. The trimmer under the fields previews the
   clip straight from that URL: scrub it, then press **Set start** and **Set end** to drop the
   in and out points, and set the length it plays for. **Play in reel** jumps the main preview
   to where that clip plays in the countdown.
   - **Trim start / Trim end** — the manual in and out range of the source (also settable
     from the trimmer's playhead).
   - **Clip length on screen** — how many seconds the clip plays.
   - **Title card text** — the title that plays on the card before the clip.
5. Repeat for the other ranks. The ranks are numbered automatically from the
   number of merged videos (#10 down to #1) and the rank column is drawn down
   the middle left of the frame.
6. **Title card seconds** controls how long each card plays before its clip, and
   **Ranking style / category** sets the style shown in the header.

The clips are drawn straight from the video element into the canvas, so the
preview and the export show the real footage.

**The look** follows the reference ranking reels: a centred two-line headline at
the top ("Ranking" in white plus the ranking style in the accent colour, then
the title in cyan), the clip drawn full width and letterboxed on a black frame,
and a rank column down the left. The numbers run from #1 at the top down to the
lowest rank at the bottom, and a rank is **revealed** once the countdown reaches
it: its number turns from grey to the accent colour and its title appears next
to it. Everything is set with a heavy black outline so it reads over any clip.

**Three ways to supply a clip:**

1. **A direct media URL** on any host that sends `Access-Control-Allow-Origin`.
2. **A local file** — press **Choose a file** next to the URL field and pick the
   video from your disk. The dev server checks it with `ffprobe`, re-encodes it
   when the browser cannot decode the codec (HEVC becomes H.264) and stores it
   in `public/source-videos/`, so it previews, trims **and** exports with the
   real footage.
3. **A file you already put in the project** — drop it in `public/samples/` and
   reference `/samples/your-clip.mp4`.

**Page links (YouTube, TikTok, X, Vimeo…) cannot be merged.** The reel draws the
clip onto the canvas and the export captures that canvas, and a video page will
not hand over its pixels. Download the clip and use **Choose a file**, or host a
direct `.mp4` link that allows cross-origin reads.

**Two different failures, two different fixes:**

1. **"This URL could not be played"** — the URL is not a media file. Use a direct
   link to the video (`…/clip.mp4`, `…/clip.webm`) or a signed media URL, not a
   YouTube/TikTok/X page link.
2. **"The host does not allow cross-origin reads"** — the video loaded, but the
   browser will not hand its pixels to a canvas unless the server sends
   `Access-Control-Allow-Origin`. The clip still previews in the browser and
   the export falls back to a placeholder frame for it. Download the file into
   `public/samples/` (or any CORS-enabled host) to get the real footage into
   the exported video. Same-origin clips always work.

**"That file is not a video"** — the file you picked is not a video file. It is
usually a web page that was saved with an `.mp4` name, or a download that never
finished (the size in the message gives it away). Download the video file
itself and pick it again.

## 9. Download from the editor

The **Video Downloader** panel in Clone Reels takes a source URL and downloads it
into the next free rank:

- A relative or same-origin file (`/samples/clip-1.mp4`) is fetched by the
  browser.
- Any other URL (a direct MP4 on a CORS-enabled host, or a YouTube / TikTok
  page) is downloaded by the local dev server through `/__reel-download`, which
  runs the same downloader Node-side with yt-dlp, saves it into
  `public/source-videos/` and hands the public path back.

The clip then appears in the merge table with a range you can trim, and it plays
in the preview and exports with the real footage. The endpoint only exists in the
dev server.

Every clip you download is also saved to your **Downloads** folder with its
original name, and the **File** column in the merge table saves it again at any
time.

**Choosing a local file** goes through `/__reel-upload` instead: the dev server
probes the file with `ffprobe`, refuses it when it is not a real video, and
re-encodes a codec the browser cannot decode (HEVC becomes H.264). The clip
then lives in `public/source-videos/` and behaves like any other clip.

## 10. Open the studio and use the rebuild

```powershell
npm run dev
```

- `http://localhost:3000/?section=reels` opens **Clone Reels** directly.
- The **Reference Rebuild** panel shows the captured beats and the thumbnails.
- **Load generated blueprint** pulls `public/reels/blueprint.json` into the
  editor.
- **Rewrite narration in this voice** re-frames every line offline in the
  chosen voice, so the copy and the voice always match.
- **Export** renders the reel with the studio's recorder (WebM/VP9 + Opus, or
  MP4 in Safari) and mixes in the generated voice clips when they exist.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ffmpeg is not recognized` | install FFmpeg, then reopen the terminal |
| `OPENAI_API_KEY is not set` | create `.env` from `.env.example` and add the key |
| `401` from the API | the key is wrong or expired |
| `429` from the API | the account is out of quota — the image step is the expensive one |
| The reference has no cuts | pass `--count 8` to split it evenly instead |
| The download fails | the host must allow direct downloads; download the file and pass a local path instead: `npm run reference -- --url "C:\video\reel.mp4"` |
| The blueprint is not picked up | it must be at `public/reels/blueprint.json` |
| "This URL could not be played" | it must be a **direct video file** (`…/clip.mp4`), not a page link — open the page, copy the file address and paste that |
| "That file is not a video" | the file you picked is a web page saved with an `.mp4` name, or a download that never finished. Pick the real video file |
| "That file has no video track in it" | the file is an audio file or a still image — pick a video |
| A downloaded clip will not play | a `#` in the file name breaks the public path. The studio now replaces `#`, `?` and `%` with `_` when it writes the file |
| "Page links like this cannot be merged" | YouTube and other page links cannot be captured. Download the clip and press **Choose a file**, or host a direct `.mp4` with CORS headers |
| "The host does not allow cross-origin reads" | the clip plays but the browser will not let it be drawn onto the canvas, so the export uses a placeholder frame for it. Download the file into `public/samples/` (or use a host that sends `Access-Control-Allow-Origin`) to get the real footage in the export |
| A merged clip stays black | the video host blocks cross-origin reads; use a same-origin file or a host with CORS headers |
| The clip and the audio drift | the reel runs in real time; keep the tab in the foreground during the export |
| "Refusing to download from a local or private address" | the URL points at localhost or a LAN address. Add `--allow-private` (or `allowPrivateHosts: true`) when that is what you meant |
| A console error with no visible reaction | the dev server logs every failing reel request with its status, so the browser error can be traced. Restart the server and watch its output |
| The page behaves like the old version | the dev server restarted and the tab kept the previous bundle. A yellow banner appears with a **Reload** button — press it, or hard-refresh with `Ctrl+Shift+R` |
