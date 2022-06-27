const { createCanvas, loadImage } = require('canvas');
const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');

(async () => {
  let input;
  try {
    input = {
      title: process.argv
        .find((v) => v.startsWith('--title='))
        .replace('--title=', ''),
      description: process.argv
        .find((v) => v.startsWith('--description='))
        .replace('--description=', '')
        .replaceAll('\\\\n', '\n'),
      tags: process.argv
        .find((v) => v.startsWith('--tags='))
        .replace('--tags=', '')
        .split(','),
    };
  } catch (error) {
    console.error(error);
    console.error(
      '\nAn error occured while reading input\nUsage: npm start -- --title=<YOUR TITLE> --description=<YOUR DESCRIPTION> --tags=<COMMA SEPARATED TAGS>\nExample: npm start --title=Solar-Tweaks/SocialPreviewMaker "--description=Simple app to create GitHub\\nsocial preview images" --tags=canvas,social\n\nMake sure to escape spaces correctly!'
    );
    process.exit(1);
  }

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
  const title = input.title.split('/');
  context.fillStyle = '#ffffff';
  context.font = 'bold 30pt Roboto';
  const firstWith = context.measureText(title[0]).width;
  context.fillText(title[0], 100, 170);
  context.font = 'normal 30pt Roboto';
  context.fillText(`/${title[1]}`, 100 + firstWith, 170);

  // DESCRIPTION
  context.font = 'light 15pt Roboto';
  context.fillText(input.description, 100, 210);

  // TAGS
  let row = 0,
    filledTags = 0;
  const tagWith = 170,
    tagHeight = 40;
  for (const tag of input.tags) {
    const _canvas = createCanvas(tagWith + 2, tagHeight + 2);
    const _context = _canvas.getContext('2d');
    _context.fillStyle = '#ffffff';
    roundRect(_context, 1, 1, tagWith, tagHeight, 10);
    const x = 100 + filledTags * (tagWith + 12);
    const y = 340 + row * (tagHeight + 17);

    const fontSize = '18';
    _context.fillStyle = '#ff0000';
    _context.font = `italic bold ${18}pt Roboto`;
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
