const { createCanvas, loadImage } = require('canvas');
const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const fetch = require('node-fetch')
const font = 'Inter';

(async () => {
  let input;
  try {
    input = {
      repo: process.argv
        .find((v) => v.startsWith('--repo='))
        .replace('--repo=', ''),
    };
  } catch (error) {
    console.error(error);
    console.error(
      '\nAn error occured while reading input\nUsage: npm start -- --repo=<full repo name>\nExample: npm start -- --repo=Solar-Tweaks/SocialPreviewMaker\n\nMake sure to escape spaces correctly!'
    );
    process.exit(1);
  }


  const info = (await (await fetch("https://api.github.com/repos/"+input.repo)).json())
  // That's what GitHub recommends
  const width = 1280,
    height = 640;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // BACKGROUND
  const background = await loadImage(join(__dirname, 'background.png'));
  context.drawImage(background, 0, 0, width, height);

  // SOLARTWEAKS LOGO
  const logo = await loadImage(join(__dirname, 'solartweaks.svg'));
  context.drawImage(logo, (width * 70) / 100, height / 2 - 270 / 2, 270, 270);

  // TITLE
  const title = info.full_name.split("/");
  context.fillStyle = '#ffffff';
  context.font = `bold 38pt ${font}`;
  const firstWith = context.measureText(title[0]).width;
  context.fillText(title[0], 100, 205);
  context.font = `normal 38pt ${font}`;
  context.fillText(`/${title[1]}`, 100 + firstWith, 205);

  // DESCRIPTION;
  context.font = `extralight 21pt ${font}`;
  context.fillText(formatDesc(info.description), 100, 240);

  // TAGS
  let row = 0,
    filledTags = 0;
  const tagWith = 170,
    tagHeight = 40;
  for (const tag of info.topics) {
    const _canvas = createCanvas(tagWith + 2, tagHeight + 2);
    const _context = _canvas.getContext('2d');
    _context.fillStyle = '#ffffff';
    roundRect(_context, 1, 1, tagWith, tagHeight, 10);
    const x = 100 + filledTags * (tagWith + 24);
    const y = 340 + row * (tagHeight + 18);

    const fontSize = '17';
    _context.fillStyle = '#ff0000';
    _context.font = `${fontSize}pt 'Panton Black italic Caps'`;
    _context.globalCompositeOperation = 'xor';
    _context.textAlign = 'center';
    _context.fillText(
      tag.toUpperCase(),
      _canvas.width / 2,
      _canvas.height / 2 + fontSize / 2,
      tagWith
    );

    context.drawImage(
      await loadImage(_canvas.toBuffer('image/png')),
      x,
      y,
      tagWith + 2,
      tagHeight + 2
    );

    filledTags++;

    if (filledTags === 3) {
      filledTags = 0;
      row++;
    }
  }

  const buf = canvas.toBuffer('image/png');
  const outputPath = join(process.cwd(), 'output.png');
  writeFile(outputPath, buf);
  console.log(`File saved under ${outputPath}`);
})();

function roundRect(context, x, y, w, h, radius) {
  context.fillRect(x + 2, y + 2, w - 4, h - 4);
  context.fillRect(x + 1, y + 4, 1, h - 8);
  context.fillRect(x + 4, y + 1, w - 8, 1);
  context.fillRect(x + w - 2, y + 4, 1, h - 8);
  context.fillRect(x + 4, y + h - 2, w - 8, 1);
  const r = x + w;
  const b = y + h;
  context.beginPath();
  context.strokeStyle = 'white';
  context.lineWidth = '2';
  context.moveTo(x + radius, y);
  context.lineTo(r - radius, y);
  context.quadraticCurveTo(r, y, r, y + radius);
  context.lineTo(r, y + h - radius);
  context.quadraticCurveTo(r, b, r - radius, b);
  context.lineTo(x + radius, b);
  context.quadraticCurveTo(x, b, x, b - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.stroke();
}

function formatDesc(desc) {
  // I KNOW THIS IS DUMB STOP
  let newStr = ""
  let i = 0
  desc.split(" ").forEach((a) => {
    i++
    newStr += " "+a
    if(i > 6) {
      newStr += "\n"
      i = 0
    }
  })
  return newStr
}