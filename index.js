const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const videoUrl = process.argv[2];
const startTime = process.argv[3];
const endTime = process.argv[4];
const fileName = process.argv[5] || 'output.mp3';

if (!videoUrl || !startTime || !endTime) {
  console.log('Usage: node index.js <youtube_link> <start_time> <end_time> [output_file_name]');
  process.exit(1);
}

const videoStream = ytdl(videoUrl, { filter: 'audioonly' });

const [startMinutes, startSeconds] = startTime.split(':').map(Number);
const [endMinutes, endSeconds] = endTime.split(':').map(Number);

ffmpeg()
  .input(videoStream)
  .audioCodec('libmp3lame')
  .audioBitrate(320)
  .setStartTime(`${startMinutes}:${startSeconds}`)
  .setDuration(`${endMinutes - startMinutes}:${endSeconds - startSeconds}`)
  .on('end', () => {
    console.log('Conversion finished!');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .save(fileName);
