import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const outputFile = path.join(rootDir, "ai-context.txt");

// Игнорируем ненужные папки (node_modules, гит и сборку Vite)
const ignoreDirs = ["node_modules", ".git", "dist"];

// Игнорируем локи, скрытые файлы и сам файл контекста
const ignoreFiles = [".DS_Store", "package-lock.json", "ai-context.txt"];

// Расширенный список медиа и шрифтов (чтобы не читать бинарники)
const ignoreExts = [
  // Изображения
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  // Шрифты
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  // Медиа и прочее
  ".mp4",
  ".mp3",
  ".wav",
  ".zip",
  ".tar",
  ".gz",
  ".pdf",
  ".map",
];

// Функция для отрисовки дерева файлов
function generateTree(dir, prefix = "") {
  let result = "";
  const items = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (item) =>
        !ignoreDirs.includes(item.name) && !ignoreFiles.includes(item.name),
    )
    .sort((a, b) => {
      // Сначала папки, потом файлы
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    result += `${prefix}${pointer}${item.name}\n`;

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += generateTree(path.join(dir, item.name), newPrefix);
    }
  });
  return result;
}

// Функция для чтения содержимого
function generateContent(dir) {
  let result = "";
  const items = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((item) => !ignoreDirs.includes(item.name));

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      result += generateContent(fullPath);
    } else {
      if (ignoreFiles.includes(item.name)) continue;

      const ext = path.extname(item.name).toLowerCase();
      if (ignoreExts.includes(ext)) continue;

      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

      try {
        const content = fs.readFileSync(fullPath, "utf8");
        result += `\n--- START OF FILE: ./${relativePath} ---\n`;
        result += content;
        result += `\n--- END OF FILE: ./${relativePath} ---\n`;
      } catch (err) {
        console.warn(`Не удалось прочитать файл: ${relativePath}`);
      }
    }
  }
  return result;
}

// Запуск сборки
try {
  console.log("Собираем контекст для проекта...");

  let output = "PROJECT STRUCTURE:\n\n./\n";
  output += generateTree(rootDir);
  output += "\n==================================================\n";
  output += "FILE CONTENTS:\n";
  output += "==================================================\n";
  output += generateContent(rootDir);

  fs.writeFileSync(outputFile, output);
  console.log(`Готово! Файл контекста сохранен как: ${outputFile}`);
} catch (err) {
  console.error("Произошла ошибка при сборке:", err);
}
