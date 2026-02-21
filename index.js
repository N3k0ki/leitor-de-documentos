const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = require("./server/services/uploadService");
const splitText = require("./server/services/textSplitter");

pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const dataBuffer = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: dataBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(" ") + "\n";
    }

    const chunks = splitText(fullText);

    console.log("Blocos:", chunks.length);

    res.json({
      totalBlocos: chunks.length,
      primeiroBlocoPreview: chunks[0]?.substring(0, 4000)
    });

  } catch (error) {
    console.error("ERRO REAL:", error);
    res.status(500).json({ error: "Erro ao processar PDF" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🚀");
});