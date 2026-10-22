/**
 * Injects or updates EBML Duration and DefaultDuration (FPS) elements in WebM files.
 *
 * MediaRecorder in Chromium creates WebM files without duration metadata in the Info segment
 * and without DefaultDuration in the TrackEntry segment.
 * This causes video players (Windows Media Player, QuickTime, VLC, Telegram, mobile gallery)
 * to interpret the file as having Duration: N/A and default framerate of 1000fps,
 * causing playback to flash by in ~1 second or display "0:01" total duration.
 *
 * This function injects:
 * 1. Exact Duration (ms) in the Info element (0x15 0x49 0xA9 0x66 -> 0x44 0x89)
 * 2. Exact DefaultDuration (ns per frame for the requested output fps) in the Video TrackEntry (0xAE -> 0x23 0xE3 0x83)
 * with precise EBML VINT length calculations.
 */

function readVint(bytes: Uint8Array, offset: number): { length: number; value: number } {
  if (offset >= bytes.length) return { length: 0, value: 0 };
  const b = bytes[offset];
  let mask = 0x80;
  let len = 1;
  while ((b & mask) === 0 && len <= 8) {
    mask >>= 1;
    len++;
  }
  if (len > 8) return { length: 0, value: 0 };
  let val = b & (mask - 1);
  for (let i = 1; i < len; i++) {
    val = val * 256 + bytes[offset + i];
  }
  return { length: len, value: val };
}

function writeVint(val: number, fixedLen?: number): Uint8Array {
  if (fixedLen === 1 || (!fixedLen && val < 127)) {
    return new Uint8Array([0x80 | val]);
  } else if (fixedLen === 2 || (!fixedLen && val < 16383)) {
    return new Uint8Array([0x40 | ((val >> 8) & 0x3f), val & 0xff]);
  } else if (fixedLen === 3 || (!fixedLen && val < 2097151)) {
    return new Uint8Array([
      0x20 | ((val >> 16) & 0x1f),
      (val >> 8) & 0xff,
      val & 0xff,
    ]);
  } else {
    return new Uint8Array([
      0x10 | ((val >> 24) & 0x0f),
      (val >> 16) & 0xff,
      (val >> 8) & 0xff,
      val & 0xff,
    ]);
  }
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const ab = new ArrayBuffer(totalLength);
  const result = new Uint8Array(ab);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export async function fixWebmDuration(
  blob: Blob,
  durationMs: number,
  fps: number = 24
): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(buffer);

  // 1. Locate Info element: 0x15 0x49 0xA9 0x66
  let infoIdx = -1;
  for (let i = 0; i < Math.min(bytes.length - 4, 4096); i++) {
    if (
      bytes[i] === 0x15 &&
      bytes[i + 1] === 0x49 &&
      bytes[i + 2] === 0xa9 &&
      bytes[i + 3] === 0x66
    ) {
      infoIdx = i;
      break;
    }
  }

  if (infoIdx !== -1) {
    const infoVint = readVint(bytes, infoIdx + 4);
    const infoSize = infoVint.value;
    const infoPayloadStart = infoIdx + 4 + infoVint.length;
    const infoPayloadEnd = infoPayloadStart + infoSize;

    // Check if Duration (0x44 0x89) exists
    let hasDur = false;
    for (let i = infoPayloadStart; i < Math.min(bytes.length - 6, infoPayloadEnd); i++) {
      if (bytes[i] === 0x44 && bytes[i + 1] === 0x89) {
        hasDur = true;
        const sizeByte = bytes[i + 2];
        if (sizeByte === 0x84) {
          const view = new DataView(bytes.buffer, bytes.byteOffset + i + 3, 4);
          view.setFloat32(0, durationMs, false);
        } else if (sizeByte === 0x88) {
          const view = new DataView(bytes.buffer, bytes.byteOffset + i + 3, 8);
          view.setFloat64(0, durationMs, false);
        }
        break;
      }
    }

    if (!hasDur) {
      // 0x44 0x89 0x84 [4-byte float32]
      const durElem = new Uint8Array(7);
      durElem[0] = 0x44;
      durElem[1] = 0x89;
      durElem[2] = 0x84;
      const view = new DataView(durElem.buffer, 3, 4);
      view.setFloat32(0, durationMs, false);

      const newInfoSize = infoSize + durElem.length;
      const newInfoVintBuf = writeVint(newInfoSize);

      bytes = concatUint8Arrays([
        bytes.subarray(0, infoIdx + 4),
        newInfoVintBuf,
        durElem,
        bytes.subarray(infoPayloadStart),
      ]);
    }
  }

  // 2. Locate Tracks element: 0x16 0x54 0xAE 0x6B
  let tracksIdx = -1;
  for (let i = 0; i < Math.min(bytes.length - 4, 8192); i++) {
    if (
      bytes[i] === 0x16 &&
      bytes[i + 1] === 0x54 &&
      bytes[i + 2] === 0xae &&
      bytes[i + 3] === 0x6b
    ) {
      tracksIdx = i;
      break;
    }
  }

  if (tracksIdx !== -1) {
    const tracksVint = readVint(bytes, tracksIdx + 4);
    const tracksPayloadStart = tracksIdx + 4 + tracksVint.length;
    const tracksPayloadEnd = tracksPayloadStart + tracksVint.value;

    // Look for first Video TrackEntry (0xAE with TrackType = 1: 0x83 0x81 0x01)
    let videoTrackEntryIdx = -1;
    let curr = tracksPayloadStart;

    while (curr < tracksPayloadEnd) {
      if (bytes[curr] === 0xae) {
        const entryVint = readVint(bytes, curr + 1);
        const entryPayloadStart = curr + 1 + entryVint.length;
        const entryPayloadEnd = entryPayloadStart + entryVint.value;

        // Check if this TrackEntry has TrackType = 1 (0x83 0x81 0x01)
        let isVideo = false;
        for (let j = entryPayloadStart; j < entryPayloadEnd - 2; j++) {
          if (bytes[j] === 0x83 && bytes[j + 1] === 0x81 && bytes[j + 2] === 0x01) {
            isVideo = true;
            break;
          }
        }

        if (isVideo) {
          videoTrackEntryIdx = curr;
          break;
        }
        curr = entryPayloadEnd;
      } else {
        curr++;
      }
    }

    if (videoTrackEntryIdx !== -1) {
      const entryVint = readVint(bytes, videoTrackEntryIdx + 1);
      const entryPayloadStart = videoTrackEntryIdx + 1 + entryVint.length;
      const entryPayloadEnd = entryPayloadStart + entryVint.value;

      // Check if DefaultDuration (0x23 0xE3 0x83) is already present
      let hasDefDur = false;
      for (let i = entryPayloadStart; i < entryPayloadEnd - 4; i++) {
        if (
          bytes[i] === 0x23 &&
          bytes[i + 1] === 0xe3 &&
          bytes[i + 2] === 0x83
        ) {
          hasDefDur = true;
          break;
        }
      }

      if (!hasDefDur) {
        // DefaultDuration: 0x23 0xE3 0x83 0x84 [4-byte uint for ns per frame]
        const nsPerFrame = Math.round(1000000000 / fps);
        const defDurElem = new Uint8Array(8);
        defDurElem[0] = 0x23;
        defDurElem[1] = 0xe3;
        defDurElem[2] = 0x83;
        defDurElem[3] = 0x84;
        const view = new DataView(defDurElem.buffer, 4, 4);
        view.setUint32(0, nsPerFrame, false);

        const newEntrySize = entryVint.value + defDurElem.length;
        const newEntryVintBuf = writeVint(newEntrySize);
        const entryVintDiff = newEntryVintBuf.length - entryVint.length;

        const newTracksSize = tracksVint.value + defDurElem.length + entryVintDiff;
        const newTracksVintBuf = writeVint(newTracksSize);

        bytes = concatUint8Arrays([
          bytes.subarray(0, tracksIdx + 4),
          newTracksVintBuf,
          bytes.subarray(tracksPayloadStart, videoTrackEntryIdx + 1),
          newEntryVintBuf,
          bytes.subarray(entryPayloadStart, entryPayloadEnd),
          defDurElem,
          bytes.subarray(entryPayloadEnd),
        ]);
      }
    }
  }

  return new Blob([bytes as unknown as BlobPart], { type: blob.type || 'video/webm' });
}
