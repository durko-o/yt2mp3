const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = 3000;

app.use(cors());

app.get('/download', async (req, res) => {
  try {
    const { videoUrl, startTime, endTime } = req.query;
    const videoID = ytdl.getURLVideoID(videoUrl);

    const videoInfo = await ytdl.getInfo(videoID);
    const streamURL = ytdl(videoID, { format: 'mp4' });

    const ffmpegProcess = ffmpeg(streamURL)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .audioCodec('libmp3lame')
      .on('end', () => {
        console.log('Conversion finished');
      })
      .on('error', (err) => {
        console.error('Error:', err);
      })
      .pipe(res, { end: true });

    req.on('close', () => {
      ffmpegProcess.kill();
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
