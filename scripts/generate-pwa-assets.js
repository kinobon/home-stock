#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * PWA アイコンとスプラッシュスクリーンを生成するスクリプト
 * 使用方法: node scripts/generate-pwa-assets.js
 *
 * 必要なパッケージ: sharp
 * インストール: npm install --save-dev sharp
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const sourceIcon = path.join(publicDir, "icon.png");

// アイコンサイズ
const iconSizes = [
  { size: 180, name: "apple-touch-icon-180x180.png" },
  { size: 167, name: "apple-touch-icon-167x167.png" },
  { size: 152, name: "apple-touch-icon-152x152.png" },
  { size: 192, name: "pwa-192x192.png" },
  { size: 512, name: "pwa-512x512.png" },
];

// スプラッシュスクリーンサイズ (幅 x 高さ)
const splashSizes = [
  { width: 430, height: 932, name: "splash-430x932.png" }, // iPhone 14 Pro Max, 15 Pro Max
  { width: 393, height: 852, name: "splash-393x852.png" }, // iPhone 14 Pro, 15 Pro
  { width: 390, height: 844, name: "splash-390x844.png" }, // iPhone 14, 15
  { width: 428, height: 926, name: "splash-428x926.png" }, // iPhone 13 Pro Max
  { width: 375, height: 812, name: "splash-375x812.png" }, // iPhone 13 mini, X
  { width: 414, height: 896, name: "splash-414x896.png" }, // iPhone 11 Pro Max
  { width: 1024, height: 1366, name: "splash-1024x1366.png" }, // iPad Pro 12.9"
  { width: 834, height: 1194, name: "splash-834x1194.png" }, // iPad Pro 11"
  { width: 834, height: 1112, name: "splash-834x1112.png" }, // iPad Pro 10.5"
  { width: 810, height: 1080, name: "splash-810x1080.png" }, // iPad 10.2"
  { width: 768, height: 1024, name: "splash-768x1024.png" }, // iPad mini
];

async function generateIcons() {
  console.log("🎨 Generating app icons...");

  for (const { size, name } of iconSizes) {
    const outputPath = path.join(publicDir, name);
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }
}

async function generateSplashScreens() {
  console.log("\n🖼️  Generating splash screens...");

  // アイコンを読み込む
  const iconBuffer = await sharp(sourceIcon).resize(180, 180, { fit: "contain" }).png().toBuffer();

  for (const { width, height, name } of splashSizes) {
    const outputPath = path.join(publicDir, name);

    // 背景色（白）のキャンバスを作成
    const canvas = sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    // アイコンを中央に配置
    const iconSize = Math.min(width, height) * 0.3; // 画面の30%のサイズ
    const resizedIcon = await sharp(iconBuffer)
      .resize(Math.floor(iconSize), Math.floor(iconSize), { fit: "contain" })
      .png()
      .toBuffer();

    await canvas
      .composite([
        {
          input: resizedIcon,
          top: Math.floor((height - iconSize) / 2),
          left: Math.floor((width - iconSize) / 2),
        },
      ])
      .png()
      .toFile(outputPath);

    console.log(`  ✓ Generated ${name} (${width}x${height})`);
  }
}

async function main() {
  try {
    console.log("🚀 Starting PWA asset generation...\n");

    // ソースアイコンの存在確認
    try {
      await fs.access(sourceIcon);
    } catch (error) {
      console.error(`❌ Source icon not found: ${sourceIcon}`);
      console.error("   Please place an icon.png file in the public directory.");
      process.exit(1);
    }

    await generateIcons();
    await generateSplashScreens();

    console.log("\n✅ All PWA assets generated successfully!");
    console.log(`   Output directory: ${publicDir}`);
  } catch (error) {
    console.error("\n❌ Error generating PWA assets:", error);
    process.exit(1);
  }
}

main();
