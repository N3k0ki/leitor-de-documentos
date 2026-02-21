function splitText(text, maxLength = 4000) {
  const chunks = [];
  let current = "";

  const paragraphs = text.split("\n");

  for (let p of paragraphs) {
    if ((current + p).length <= maxLength) {
      current += p + " ";
    } else {
      chunks.push(current.trim());
      current = p + " ";
    }
  }

  if (current) {
    chunks.push(current.trim());
  }

  return chunks;
}

module.exports = splitText;