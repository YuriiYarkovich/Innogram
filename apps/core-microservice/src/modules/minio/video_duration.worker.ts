import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

if (!parentPort) throw new Error('This script must be run as a worker');

async function getVideoDuration(buffer: Buffer): Promise<number> {
  const tempPath = `/tmp/${uuidv4()}.mp4`;
  fs.writeFileSync(tempPath, buffer);

  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(tempPath, (err, metadata) => {
      fs.unlinkSync(tempPath);
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
}

getVideoDuration(workerData.buffer)
  .then((duration) => parentPort!.postMessage({ duration }))
  .catch((err) => parentPort!.postMessage({ error: err.message }));
