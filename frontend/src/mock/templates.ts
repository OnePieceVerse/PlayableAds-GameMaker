import { TemplateDetail } from "@/types";

const categories = ["益智", "动作", "休闲", "节日", "抽奖"] as const;

function img(seed: string, w = 640, h = 360) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const MOCK_TEMPLATES: TemplateDetail[] = [
  {
    templateId: "puzzle_001",
    templateName: "拼图挑战",
    description: "简洁的拼图小游戏模板，适合品牌露出。",
    thumbnailUrl: img("puzzle_001"),
    category: "益智",
    analytics: { editCount: 0, previewCount: 123, exportCount: 45 },
    assets: [
      {
        assetId: "bg",
        assetKey: "background",
        assetName: "背景图",
        assetType: "image",
        allowedFormats: ["jpg", "png"],
        maxFileSizeKb: 5 * 1024,
        requiredWidth: 750,
        requiredHeight: 1334,
        allowResize: false,
        placeholderUrl: img("placeholder_bg", 750, 1334),
        isRequired: true,
        displayOrder: 1,
      },
      {
        assetId: "logo",
        assetKey: "brand_logo",
        assetName: "品牌Logo",
        assetType: "image",
        allowedFormats: ["png", "jpg"],
        maxFileSizeKb: 2 * 1024,
        requiredWidth: 400,
        requiredHeight: 200,
        allowResize: true,
        placeholderUrl: img("placeholder_logo", 400, 200),
        isRequired: false,
        displayOrder: 2,
      },
      {
        assetId: "music",
        assetKey: "bgm",
        assetName: "背景音乐",
        assetType: "audio",
        allowedFormats: ["mp3"],
        maxFileSizeKb: 5 * 1024,
        placeholderUrl: "",
        isRequired: false,
        displayOrder: 3,
      },
    ],
  },
  {
    templateId: "memory_001",
    templateName: "记忆翻牌",
    description: "轻量级记忆翻牌游戏，玩法简单。",
    thumbnailUrl: img("memory_001"),
    category: "益智",
    analytics: { editCount: 0, previewCount: 88, exportCount: 21 },
    assets: [
      {
        assetId: "bg",
        assetKey: "background",
        assetName: "背景图",
        assetType: "image",
        allowedFormats: ["jpg", "png"],
        maxFileSizeKb: 5 * 1024,
        requiredWidth: 750,
        requiredHeight: 1334,
        allowResize: false,
        placeholderUrl: img("placeholder_bg2", 750, 1334),
        isRequired: true,
        displayOrder: 1,
      },
    ],
  },
  ...Array.from({ length: 6 }).map((_, i) => {
    const id = `promo_${i + 1}`;
    return {
      templateId: id,
      templateName: `促销互动 ${i + 1}`,
      description: "用于活动促销的互动模板。",
      thumbnailUrl: img(id),
      category: categories[(i % categories.length) as number],
      analytics: { editCount: Math.floor(Math.random() * 100), previewCount: Math.floor(Math.random() * 200), exportCount: Math.floor(Math.random() * 60) },
      assets: [
        {
          assetId: "bg",
          assetKey: "background",
          assetName: "背景图",
          assetType: "image",
          allowedFormats: ["jpg", "png"],
          maxFileSizeKb: 5 * 1024,
          requiredWidth: 750,
          requiredHeight: 1334,
          allowResize: true,
          placeholderUrl: img(`ph_${id}`, 750, 1334),
          isRequired: true,
          displayOrder: 1,
        },
      ],
    } satisfies TemplateDetail;
  }),
].flat();

export function getTemplateList() {
  return MOCK_TEMPLATES.map(({ assets, ...rest }) => rest);
}

export function getTemplateById(id: string) {
  return MOCK_TEMPLATES.find((t) => t.templateId === id) || null;
}

export const CATEGORIES = Array.from(new Set(MOCK_TEMPLATES.map((t) => t.category)));


