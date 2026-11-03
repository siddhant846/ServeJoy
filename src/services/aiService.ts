import Tesseract from 'tesseract.js';

export const DISH_IMAGE_MAP: Record<string, string> = {
  item_pav_bhaji: '/dishes/pav_bhaji.jpg',
  item_dal_baati: '/dishes/dal_baati.jpg',
  item_chole_puri: '/dishes/chole_puri.jpg',
  item_dhokla: '/dishes/dhokla.jpg',
  item_masala_chai: '/dishes/masala_chai.jpg',
  item_filter_coffee: '/dishes/filter_coffee.jpg',
  item_paneer_roll: '/dishes/paneer_roll.jpg',
  item_gulab_jamun: '/dishes/gulab_jamun.jpg',
  item_grilled_sandwich: '/dishes/grilled_sandwich.jpg',
  item_bun_maska: '/dishes/bun_maska.jpg',
  item_ginger_tea: '/dishes/ginger_tea.jpg',
  item_hot_coffee: '/dishes/hot_coffee.jpg',
  item_kulhad_coffee: '/dishes/kulhad_coffee.jpg',
  item_bubblegum_coffee: '/dishes/bubblegum_coffee.jpg',
  item_butterscotch_coffee: '/dishes/butterscotch_coffee.jpg',
  item_caramel_coffee: '/dishes/caramel_coffee.jpg',
  item_special_coffee: '/dishes/special_coffee.jpg',
  item_plain_maggi: '/dishes/plain_maggi.jpg',
  item_veg_maggi: '/dishes/veg_maggi.jpg',
  item_vanilla_shake: '/dishes/vanilla_shake.jpg',
};

/**
 * Match a dish name to a high-quality local photograph or curated food image
 */
export function matchLocalDishImage(dishName: string, category: string): string {
  const name = dishName.toLowerCase();

  if (name.includes('pav bhaji') || (name.includes('bhaji') && !name.includes('mirchi'))) {
    return '/dishes/pav_bhaji.jpg';
  }
  if (name.includes('dal bati') || name.includes('dal baati') || name.includes('baati')) {
    return '/dishes/dal_baati.jpg';
  }
  if (name.includes('chole') || name.includes('puri') || name.includes('bhature')) {
    return '/dishes/chole_puri.jpg';
  }
  if (name.includes('dhokla') || name.includes('khaman')) {
    return '/dishes/dhokla.jpg';
  }
  if (name.includes('masala chai') || name.includes('kadak chai') || name.includes('cutting chai')) {
    return '/dishes/masala_chai.jpg';
  }
  if (name.includes('ginger') || name.includes('adrak')) {
    return '/dishes/ginger_tea.jpg';
  }
  if (name.includes('chai') || name.includes('tea')) {
    return '/dishes/masala_chai.jpg';
  }
  if (name.includes('filter coffee') || name.includes('kaapi')) {
    return '/dishes/filter_coffee.jpg';
  }
  if (name.includes('kulhad')) {
    return '/dishes/kulhad_coffee.jpg';
  }
  if (name.includes('bubblegum')) {
    return '/dishes/bubblegum_coffee.jpg';
  }
  if (name.includes('butterscotch')) {
    return '/dishes/butterscotch_coffee.jpg';
  }
  if (name.includes('caramel')) {
    return '/dishes/caramel_coffee.jpg';
  }
  if (name.includes('cold coffee') || name.includes('frappe')) {
    return '/dishes/caramel_coffee.jpg';
  }
  if (name.includes('special') || name.includes('signature')) {
    return '/dishes/special_coffee.jpg';
  }
  if (name.includes('hot coffee') || name.includes('espresso') || name.includes('cappuccino') || name.includes('latte')) {
    return '/dishes/hot_coffee.jpg';
  }
  if (name.includes('paneer') || name.includes('kathi') || name.includes('roll') || name.includes('wrap')) {
    return '/dishes/paneer_roll.jpg';
  }
  if (name.includes('gulab jamun') || name.includes('sweet') || name.includes('rasgulla') || name.includes('jalebi')) {
    return '/dishes/gulab_jamun.jpg';
  }
  if (name.includes('sandwich') || name.includes('toast') || name.includes('panini') || name.includes('grilled')) {
    return '/dishes/grilled_sandwich.jpg';
  }
  if (name.includes('bun maska') || name.includes('maska') || name.includes('bun butter')) {
    return '/dishes/bun_maska.jpg';
  }
  if (name.includes('maggi') && (name.includes('veg') || name.includes('cheese') || name.includes('vegetable'))) {
    return '/dishes/veg_maggi.jpg';
  }
  if (name.includes('maggi') || name.includes('noodle')) {
    return '/dishes/plain_maggi.jpg';
  }
  if (name.includes('shake') || name.includes('smoothie') || name.includes('vanilla')) {
    return '/dishes/vanilla_shake.jpg';
  }

  // Curated category fallbacks
  if (category === 'Beverages') return '/dishes/masala_chai.jpg';
  if (category === 'Desserts') return '/dishes/gulab_jamun.jpg';
  if (category === 'Meals') return '/dishes/dal_baati.jpg';
  return '/dishes/grilled_sandwich.jpg';
}

export interface ParsedMenuItem {
  name: string;
  category: string;
  price: number;
  cost?: number;
  description: string;
  emoji: string;
  imageUrl?: string;
  selected?: boolean;
}

export const SAMPLE_DIGITIZED_MENU: ParsedMenuItem[] = [
  {
    name: 'Bombay Masala Grilled Sandwich',
    category: 'Snacks',
    price: 140,
    cost: 50,
    description: 'Crisp buttery grilled bread packed with spiced potato filling, mint chutney, beetroot, and melted cheese.',
    emoji: '🥪',
    imageUrl: '/dishes/grilled_sandwich.jpg',
    selected: true,
  },
  {
    name: 'Irani Bun Maska & Chai',
    category: 'Snacks',
    price: 90,
    cost: 30,
    description: 'Warm soft fluffy sweet bun slathered with dollops of salted Amul butter, paired with kadak hot tea.',
    emoji: '🍞',
    imageUrl: '/dishes/bun_maska.jpg',
    selected: true,
  },
  {
    name: 'Paneer Tikka Kathi Roll',
    category: 'Snacks',
    price: 160,
    cost: 65,
    description: 'Char-grilled cottage cheese cubes tossed with capsicum, onion rings & spicy mint spread in a flaky paratha.',
    emoji: '🌯',
    imageUrl: '/dishes/paneer_roll.jpg',
    selected: true,
  },
  {
    name: 'Cheese Butter Maggi',
    category: 'Snacks',
    price: 95,
    cost: 35,
    description: 'Street-style Maggi noodles cooked with finely chopped veggies, secret magic masala, and grated cheddar cheese.',
    emoji: '🍜',
    imageUrl: '/dishes/plain_maggi.jpg',
    selected: true,
  },
  {
    name: 'Kulhad Ginger Adrak Chai',
    category: 'Beverages',
    price: 40,
    cost: 10,
    description: 'Clay-pot brewed strong ginger tea infused with freshly pounded adrak and green cardamom.',
    emoji: '☕',
    imageUrl: '/dishes/ginger_tea.jpg',
    selected: true,
  },
  {
    name: 'Signature Caramel Frappe',
    category: 'Beverages',
    price: 180,
    cost: 60,
    description: 'Blended rich espresso with chilled whole milk, ice cream, whipped cream & golden caramel drizzle.',
    emoji: '🧋',
    imageUrl: '/dishes/caramel_coffee.jpg',
    selected: true,
  },
  {
    name: 'Hot Gulab Jamun [2 pcs]',
    category: 'Desserts',
    price: 80,
    cost: 25,
    description: 'Melt-in-mouth soft golden khoya dumplings soaked in saffron and rose scented warm sugar syrup.',
    emoji: '🍮',
    imageUrl: '/dishes/gulab_jamun.jpg',
    selected: true,
  },
];

/**
 * Preprocesses an image via canvas:
 * 1. Rescales high-res mobile photos to max 1800px (prevents OOM on phones, 5x faster OCR)
 * 2. Applies mild contrast stretching to make printed menu text crisp
 */
export async function preprocessImageForOcr(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 1800;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // Mild contrast adjustment for sharper text
          const adjusted = (gray - 128) * 1.2 + 128;
          const finalVal = Math.min(255, Math.max(0, adjusted));
          d[i] = finalVal;
          d[i + 1] = finalVal;
          d[i + 2] = finalVal;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Digitize a menu photo using Google Gemini 1.5 Flash Vision AI or Real Client-Side Tesseract OCR
 */
export async function digitizeMenuFromPhoto(
  imageBase64: string,
  apiKey?: string,
  onProgress?: (pct: number) => void
): Promise<ParsedMenuItem[]> {
  const key = apiKey || localStorage.getItem('servejoy_gemini_api_key') || '';

  // 1. If user provided a Gemini API Key, try Gemini 1.5 Flash Vision first
  if (key && imageBase64) {
    try {
      if (onProgress) onProgress(20);
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.trim()}`;
      const prompt = `You are an expert restaurant menu digitizer.
Extract every food and beverage item from this menu photo into a strictly valid JSON array.
Each object must have:
- name: string (exact dish name as printed on menu)
- category: string ("Beverages", "Snacks", "Meals", "Desserts", "Combos")
- price: number (numerical rupee price, e.g. 120)
- description: string (appetizing 1-sentence description)
- emoji: string (fitting emoji)

Respond ONLY with valid JSON array:
[{"name": "...", "category": "...", "price": 120, "description": "...", "emoji": "🍲"}]`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        if (onProgress) onProgress(80);
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as ParsedMenuItem[];
          if (parsed && parsed.length > 0) {
            if (onProgress) onProgress(100);
            return parsed.map((item) => ({
              ...item,
              cost: item.cost || Math.round((item.price || 100) * 0.4),
              imageUrl: matchLocalDishImage(item.name, item.category),
              selected: true,
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Gemini Vision API error, falling back to local OCR engine:', err);
    }
  }

  // 2. Real High-Accuracy Client-Side Optical Character Recognition (Tesseract.js)
  // Extracts the EXACT text from the user's uploaded menu card!
  try {
    if (onProgress) onProgress(15);
    const optimizedImage = await preprocessImageForOcr(imageBase64);

    if (onProgress) onProgress(30);
    const ocrResult = await Tesseract.recognize(optimizedImage, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof m.progress === 'number' && onProgress) {
          onProgress(30 + Math.round(m.progress * 60));
        }
      },
    });

    const ocrText = ocrResult?.data?.text || '';
    if (onProgress) onProgress(95);

    const extracted = digitizeMenuFromText(ocrText);
    if (extracted.length > 0) {
      if (onProgress) onProgress(100);
      return extracted;
    }
  } catch (ocrErr) {
    console.warn('Tesseract OCR error:', ocrErr);
  }

  // Never return fake sample items on user upload!
  throw new Error(
    'Could not detect readable dish names or prices from this photo. Please make sure the photo is clear, well-lit, and in focus, or paste your menu text directly under the "Paste Menu Text" tab.'
  );
}

/**
 * Digitize a raw text / pasted menu into structured dishes with AI photography
 */
export function digitizeMenuFromText(rawText: string): ParsedMenuItem[] {
  if (!rawText || !rawText.trim()) return [];

  const rawLines = rawText.split(/\r?\n/);
  const items: ParsedMenuItem[] = [];

  let currentCategory = 'Snacks';
  let currentEmoji = '🍲';

  // Words that indicate non-dish headers or noise
  const IGNORE_PATTERNS = [
    /^(menu|welcome|restaurant|cafe|hotel|table|order|bill|kot|gst|tax|cgst|sgst|fssai|phone|tel|mobile|call|address|timing|timings|closed|open|date|time|rate|price|qty|item|s\.?no|sr\.?no|total|subtotal|grand total|cash|card|upi|scan|pay|thank you|visit again|all items|pure veg|non veg)\b/i,
  ];

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line || line.length < 2) continue;

    // Check if line is noise
    if (IGNORE_PATTERNS.some((pat) => pat.test(line))) continue;

    // Check if line represents a Category Section
    const catUpper = line.toUpperCase();
    if (
      catUpper.includes('BEVERAGE') ||
      catUpper.includes('TEA') ||
      catUpper.includes('CHAI') ||
      catUpper.includes('COFFEE') ||
      catUpper.includes('DRINK') ||
      catUpper.includes('JUICE') ||
      catUpper.includes('SHAKE') ||
      catUpper.includes('COOLER')
    ) {
      currentCategory = 'Beverages';
      currentEmoji = '☕';
      if (!/\d{2,4}/.test(line)) continue;
    } else if (
      catUpper.includes('SNACK') ||
      catUpper.includes('CHAAT') ||
      catUpper.includes('SANDWICH') ||
      catUpper.includes('BURGER') ||
      catUpper.includes('ROLL') ||
      catUpper.includes('MAGGI') ||
      catUpper.includes('STARTER') ||
      catUpper.includes('CHINESE') ||
      catUpper.includes('BREAD') ||
      catUpper.includes('MOMO')
    ) {
      currentCategory = 'Snacks';
      currentEmoji = '🍲';
      if (!/\d{2,4}/.test(line)) continue;
    } else if (
      catUpper.includes('MAIN') ||
      catUpper.includes('CURRY') ||
      catUpper.includes('MEAL') ||
      catUpper.includes('RICE') ||
      catUpper.includes('DAL') ||
      catUpper.includes('PANEER') ||
      catUpper.includes('ROTI') ||
      catUpper.includes('BIRYANI') ||
      catUpper.includes('THALI') ||
      catUpper.includes('COMBO')
    ) {
      currentCategory = 'Meals';
      currentEmoji = '🍛';
      if (!/\d{2,4}/.test(line)) continue;
    } else if (
      catUpper.includes('DESSERT') ||
      catUpper.includes('SWEET') ||
      catUpper.includes('ICE CREAM') ||
      catUpper.includes('CAKE') ||
      catUpper.includes('PASTRY')
    ) {
      currentCategory = 'Desserts';
      currentEmoji = '🍮';
      if (!/\d{2,4}/.test(line)) continue;
    }

    // Attempt to extract Price from line
    // Find all numbers with 2-4 digits, prioritizing the rightmost valid price candidate
    const allNumbers = [...line.matchAll(/\b(\d{2,4})\b/g)];
    let price: number | null = null;
    let priceMatchStr = '';

    if (allNumbers.length > 0) {
      for (let n = allNumbers.length - 1; n >= 0; n--) {
        const val = parseInt(allNumbers[n][1], 10);
        // Exclude years (e.g. 2024, 2025, 2026) and values outside standard menu price range
        if (val >= 10 && val <= 5000 && val !== 2024 && val !== 2025 && val !== 2026) {
          price = val;
          priceMatchStr = allNumbers[n][0];
          break;
        }
      }
    }

    // Support multi-line layout (Dish name on line i, Price on line i+1)
    if (!price && i + 1 < rawLines.length) {
      const nextLine = rawLines[i + 1].trim();
      const nextNumMatch = nextLine.match(/^(?:rs\.?|₹|\/|\s)*(\d{2,4})(?:\/-|\/)?\s*$/i);
      if (nextNumMatch) {
        const val = parseInt(nextNumMatch[1], 10);
        if (val >= 10 && val <= 5000 && val !== 2024 && val !== 2025 && val !== 2026) {
          price = val;
          i++; // Consume the next price line
        }
      }
    }

    if (!price) continue;

    // Clean dish name
    let name = line;
    if (priceMatchStr) {
      const lastIdx = name.lastIndexOf(priceMatchStr);
      if (lastIdx !== -1) {
        name = name.substring(0, lastIdx);
      }
    }

    name = name
      .replace(/(?:rs\.?|inr|₹|\/)+/gi, '')
      .replace(/^[\d\.\)\-\*•\s\:\#]+/, '') // strip leading serial numbers "01.", "1)", etc.
      .replace(/[\s\.\·\•\-\_\/\\\:\=\+\~\*\|]+$/g, '') // strip trailing noise symbols
      .trim();

    // Check if name is valid
    if (!name || name.length < 2 || !/[a-zA-Z]/.test(name)) continue;

    // Detect category per dish if specific keywords appear in dish name
    let dishCategory = currentCategory;
    let dishEmoji = currentEmoji;
    const lowerName = name.toLowerCase();

    if (
      lowerName.includes('chai') ||
      lowerName.includes('tea') ||
      lowerName.includes('coffee') ||
      lowerName.includes('latte') ||
      lowerName.includes('frappe') ||
      lowerName.includes('shake') ||
      lowerName.includes('juice') ||
      lowerName.includes('soda') ||
      lowerName.includes('mojito') ||
      lowerName.includes('kaapi')
    ) {
      dishCategory = 'Beverages';
      dishEmoji = '☕';
    } else if (
      lowerName.includes('jamun') ||
      lowerName.includes('sweet') ||
      lowerName.includes('halwa') ||
      lowerName.includes('ice cream') ||
      lowerName.includes('kulfi') ||
      lowerName.includes('cake') ||
      lowerName.includes('brownie') ||
      lowerName.includes('dessert')
    ) {
      dishCategory = 'Desserts';
      dishEmoji = '🍮';
    } else if (
      lowerName.includes('thali') ||
      lowerName.includes('dal') ||
      lowerName.includes('paneer') ||
      lowerName.includes('rice') ||
      lowerName.includes('biryani') ||
      lowerName.includes('curry') ||
      lowerName.includes('roti') ||
      lowerName.includes('naan')
    ) {
      dishCategory = 'Meals';
      dishEmoji = '🍛';
    }

    items.push({
      name,
      category: dishCategory,
      price,
      cost: Math.round(price * 0.4),
      description: `Chef's special freshly prepared authentic ${name}, served hot and fresh.`,
      emoji: dishEmoji,
      imageUrl: matchLocalDishImage(name, dishCategory),
      selected: true,
    });
  }

  return items;
}
