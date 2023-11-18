const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const moment = require('moment');

const videoUrl = process.argv[2];
const startTime = process.argv[3];
const endTime = process.argv[4];
const fileName = process.argv[5] || 'output.mp3';

if (!videoUrl || !startTime || !endTime) {
  console.log('Usage: node index.js <youtube_link> <start_time> <end_time> [output_file_name]');
  process.exit(1);
}

const videoStream = ytdl(videoUrl, { filter: 'audioonly' });

const startMoment = moment(startTime, 'mm:ss');
const endMoment = moment(endTime, 'mm:ss');
const duration = moment.duration(endMoment.diff(startMoment));

ffmpeg()
  .input(videoStream)
  .audioCodec('libmp3lame')
  .audioBitrate(320)
  .setStartTime(startMoment.format('HH:mm:ss'))
  .setDuration(duration.asSeconds())
  .audioFilter('afade=t=in:ss=0:d=1.5')
  .audioFilter('afade=t=out:st=' + (duration.asSeconds() - 1.5) + ':d=1.5')
  .on('end', () => {
    console.log('Conversion finished!');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .save(fileName);
