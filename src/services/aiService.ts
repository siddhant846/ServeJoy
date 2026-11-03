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
  item_chicken_popcorn: '/dishes/chicken_popcorn.jpg',
  item_chicken_strips: '/dishes/chicken_strips.jpg',
  item_chicken_wings: '/dishes/chicken_wings.jpg',
  item_veg_fried_momos: '/dishes/veg_fried_momos.jpg',
  item_chicken_momos: '/dishes/chicken_momos.jpg',
  item_peri_peri_fries: '/dishes/peri_peri_fries.jpg',
  item_veg_burger: '/dishes/veg_burger.jpg',
  item_veg_cheese_burger: '/dishes/veg_cheese_burger.jpg',
  item_chicken_sandwich: '/dishes/chicken_sandwich.jpg',
  item_chicken_maggi: '/dishes/chicken_maggi.jpg',
  item_peri_peri_chicken: '/dishes/peri_peri_chicken.jpg',
};

/**
 * Match a dish name to its dedicated high-resolution, luxurious dark-themed cafe photograph.
 * Completely local, zero latency, zero rate-limits, and perfectly matched to ServeJoy's dark aesthetic!
 */
export function matchLocalDishImage(dishName: string, category: string, _salt: number = 0): string {
  const name = dishName.toLowerCase().trim();

  // 1. CHICKEN APPETIZERS & FINGER FOODS
  if (name.includes('popcorn')) return '/dishes/chicken_popcorn.jpg';
  if (name.includes('strip') || name.includes('tender') || name.includes('finger')) return '/dishes/chicken_strips.jpg';
  if (name.includes('wing')) return '/dishes/chicken_wings.jpg';
  if (name.includes('peri') && name.includes('chicken')) return '/dishes/peri_peri_chicken.jpg';

  // 2. MOMOS & DUMPLINGS
  if (name.includes('momo') || name.includes('dumpling') || name.includes('dim sum') || name.includes('dimsum')) {
    if (name.includes('fried') || name.includes('crispy') || name.includes('kurkure')) {
      return '/dishes/veg_fried_momos.jpg';
    }
    return '/dishes/chicken_momos.jpg';
  }

  // 3. FRIES
  if (name.includes('peri') && name.includes('fries')) return '/dishes/peri_peri_fries.jpg';
  if (name.includes('fries') || name.includes('french fries')) return '/dishes/peri_peri_fries.jpg';

  // 4. BURGERS
  if (name.includes('burger')) {
    if (name.includes('cheese')) return '/dishes/veg_cheese_burger.jpg';
    return '/dishes/veg_burger.jpg';
  }

  // 5. MAGGI & NOODLES
  if (name.includes('maggi') || name.includes('noodle') || name.includes('chowmein')) {
    if (name.includes('chicken')) return '/dishes/chicken_maggi.jpg';
    if (name.includes('veg') || name.includes('vegetable')) return '/dishes/veg_maggi.jpg';
    return '/dishes/plain_maggi.jpg';
  }

  // 6. SANDWICHES
  if (name.includes('sandwich') || name.includes('toast') || name.includes('panini')) {
    if (name.includes('chicken')) return '/dishes/chicken_sandwich.jpg';
    if (name.includes('paneer')) return '/dishes/paneer_roll.jpg';
    return '/dishes/grilled_sandwich.jpg';
  }

  // 7. ROLLS
  if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {
    return '/dishes/paneer_roll.jpg';
  }

  // 8. TRADITIONAL INDIAN SPECIALTIES
  if (name.includes('pav') && name.includes('bhaji')) return '/dishes/pav_bhaji.jpg';
  if (name.includes('dal') && (name.includes('baati') || name.includes('bati'))) return '/dishes/dal_baati.jpg';
  if (name.includes('chole') && (name.includes('puri') || name.includes('bhature'))) return '/dishes/chole_puri.jpg';
  if (name.includes('dhokla') || name.includes('khaman')) return '/dishes/dhokla.jpg';
  if (name.includes('bun maska') || (name.includes('bun') && name.includes('butter'))) return '/dishes/bun_maska.jpg';
  if (name.includes('gulab jamun')) return '/dishes/gulab_jamun.jpg';

  // 9. BEVERAGES
  if (category === 'Beverages' || name.includes('tea') || name.includes('chai') || name.includes('coffee') || name.includes('shake') || name.includes('latte')) {
    if (name.includes('ginger') || name.includes('adrak')) return '/dishes/ginger_tea.jpg';
    if (name.includes('chai') || name.includes('tea')) return '/dishes/masala_chai.jpg';
    if (name.includes('filter coffee') || name.includes('kaapi')) return '/dishes/filter_coffee.jpg';
    if (name.includes('kulhad')) return '/dishes/kulhad_coffee.jpg';
    if (name.includes('bubblegum')) return '/dishes/bubblegum_coffee.jpg';
    if (name.includes('butterscotch')) return '/dishes/butterscotch_coffee.jpg';
    if (name.includes('caramel') || name.includes('cold coffee') || name.includes('frappe')) return '/dishes/caramel_coffee.jpg';
    if (name.includes('special') || name.includes('signature')) return '/dishes/special_coffee.jpg';
    if (name.includes('shake') || name.includes('smoothie')) return '/dishes/vanilla_shake.jpg';
    return '/dishes/hot_coffee.jpg';
  }

  // 10. DESSERTS
  if (category === 'Desserts' || name.includes('sweet') || name.includes('dessert') || name.includes('halwa')) {
    return '/dishes/gulab_jamun.jpg';
  }

  // 11. MEALS
  if (category === 'Meals' || name.includes('thali') || name.includes('curry') || name.includes('biryani') || name.includes('rice')) {
    return '/dishes/dal_baati.jpg';
  }

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
    name: 'Crispy Chicken Popcorn',
    category: 'Snacks',
    price: 150,
    cost: 60,
    description: 'Bite-sized crunchy golden chicken popcorn clusters served with spicy garlic mayo dip.',
    emoji: '🍗',
    imageUrl: '/dishes/chicken_popcorn.jpg',
    selected: true,
  },
  {
    name: 'Golden Chicken Strips',
    category: 'Snacks',
    price: 180,
    cost: 70,
    description: 'Tender chicken tenders with a crunchy panko breadcrumb crust served with honey mustard sauce.',
    emoji: '🍗',
    imageUrl: '/dishes/chicken_strips.jpg',
    selected: true,
  },
  {
    name: 'Glazed BBQ Chicken Wings',
    category: 'Snacks',
    price: 190,
    cost: 75,
    description: 'Succulent chicken wings tossed in sticky smoky barbecue glaze, sprinkled with sesame seeds.',
    emoji: '🍗',
    imageUrl: '/dishes/chicken_wings.jpg',
    selected: true,
  },
  {
    name: 'Veg. Fried Momos',
    category: 'Snacks',
    price: 120,
    cost: 45,
    description: 'Crispy golden fried pleated vegetable dumplings served with fiery red Sichuan chili chutney.',
    emoji: '🥟',
    imageUrl: '/dishes/veg_fried_momos.jpg',
    selected: true,
  },
  {
    name: 'Steamed Chicken Momos',
    category: 'Snacks',
    price: 140,
    cost: 55,
    description: 'Delicate steamed juicy chicken dumplings served in an authentic bamboo basket with spicy dip.',
    emoji: '🥟',
    imageUrl: '/dishes/chicken_momos.jpg',
    selected: true,
  },
  {
    name: 'Crispy Peri Peri Fries',
    category: 'Snacks',
    price: 110,
    cost: 40,
    description: 'Golden shoestring fries tossed in fiery red peri peri chili seasoning with creamy garlic dip.',
    emoji: '🍟',
    imageUrl: '/dishes/peri_peri_fries.jpg',
    selected: true,
  },
  {
    name: 'Gourmet Veggie Cheese Burger',
    category: 'Snacks',
    price: 130,
    cost: 50,
    description: 'Spiced vegetable patty with melted golden cheddar cheese, lettuce, and secret sauce in a brioche bun.',
    emoji: '🍔',
    imageUrl: '/dishes/veg_cheese_burger.jpg',
    selected: true,
  },
  {
    name: 'Spicy Chicken Maggi Noodles',
    category: 'Snacks',
    price: 95,
    cost: 35,
    description: 'Steaming hot Indian masala noodles loaded with tender shredded spiced chicken pieces and coriander.',
    emoji: '🍜',
    imageUrl: '/dishes/chicken_maggi.jpg',
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
 * Preprocesses an image via canvas for OCR
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
 * Helper to split a line that contains multiple items and prices (e.g. 2 columns printed side-by-side)
 * Example: "Peri Peri Fries 60 Chicken Popcorn 70" -> ["Peri Peri Fries 60", "Chicken Popcorn 70"]
 */
export function splitMultiItemLine(line: string): string[] {
  const regex = /(?:rs\.?|inr|₹|\/|\s|^)+(\d{2,4})(?:\/-|\/)?(?=\s+[a-zA-Z]|$)/gi;
  const matches = [...line.matchAll(regex)];

  if (matches.length <= 1) {
    return [line];
  }

  const segments: string[] = [];
  let lastIndex = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const matchEnd = (match.index || 0) + match[0].length;
    const chunk = line.substring(lastIndex, matchEnd).trim();
    if (chunk) {
      segments.push(chunk);
    }
    lastIndex = matchEnd;
  }

  if (lastIndex < line.length) {
    const remaining = line.substring(lastIndex).trim();
    if (remaining.length > 2) {
      segments.push(remaining);
    }
  }

  return segments.length > 0 ? segments : [line];
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
- name: string (exact dish name as printed on menu, clean, do NOT merge two items)
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

  throw new Error(
    'Could not detect readable dish names or prices from this photo. Please make sure the photo is clear, well-lit, and in focus, or paste your menu text directly under the "Paste Menu Text" tab.'
  );
}

/**
 * Digitize a raw text / pasted menu into structured dishes with bespoke photography
 */
export function digitizeMenuFromText(rawText: string): ParsedMenuItem[] {
  if (!rawText || !rawText.trim()) return [];

  // Expand multi-column lines into distinct lines
  const initialLines = rawText.split(/\r?\n/);
  const rawLines: string[] = [];

  for (const line of initialLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const split = splitMultiItemLine(trimmed);
    rawLines.push(...split);
  }

  const items: ParsedMenuItem[] = [];
  let currentCategory = 'Snacks';
  let currentEmoji = '🍲';

  // Header and noise patterns to ignore
  const IGNORE_PATTERNS = [
    /^(menu|welcome|restaurant|cafe|hotel|table|order|bill|kot|gst|tax|cgst|sgst|fssai|phone|tel|mobile|call|address|timing|timings|closed|open|date|time|rate|price|qty|item|s\.?no|sr\.?no|total|subtotal|grand total|cash|card|upi|scan|pay|thank you|visit again|all items|pure veg|non veg)\b/i,
  ];

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line || line.length < 2) continue;

    if (IGNORE_PATTERNS.some((pat) => pat.test(line))) continue;

    // Detect Category Sections
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

    // Extract price (prioritizing rightmost number within valid range)
    const allNumbers = [...line.matchAll(/\b(\d{2,4})\b/g)];
    let price: number | null = null;
    let priceMatchStr = '';

    if (allNumbers.length > 0) {
      for (let n = allNumbers.length - 1; n >= 0; n--) {
        const val = parseInt(allNumbers[n][1], 10);
        if (val >= 10 && val <= 5000 && val !== 2024 && val !== 2025 && val !== 2026) {
          price = val;
          priceMatchStr = allNumbers[n][0];
          break;
        }
      }
    }

    // Multi-line support: Check next line for price if current has none
    if (!price && i + 1 < rawLines.length) {
      const nextLine = rawLines[i + 1].trim();
      const nextNumMatch = nextLine.match(/^(?:rs\.?|₹|\/|\s)*(\d{2,4})(?:\/-|\/)?\s*$/i);
      if (nextNumMatch) {
        const val = parseInt(nextNumMatch[1], 10);
        if (val >= 10 && val <= 5000 && val !== 2024 && val !== 2025 && val !== 2026) {
          price = val;
          i++;
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
      .replace(/^[\d\.\)\-\*•\s\:\#]+/, '') // strip leading serial numbers
      .replace(/[\s\.\·\•\-\_\/\\\:\=\+\~\*\|]+$/g, '') // strip trailing noise
      .trim();

    if (!name || name.length < 2 || !/[a-zA-Z]/.test(name)) continue;

    // Detect Category per item based on dish name
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
      lowerName.includes('waffle') ||
      lowerName.includes('dessert')
    ) {
      dishCategory = 'Desserts';
      dishEmoji = '🍮';
    } else if (
      lowerName.includes('thali') ||
      lowerName.includes('dal') ||
      lowerName.includes('paneer butter') ||
      lowerName.includes('rice') ||
      lowerName.includes('biryani') ||
      lowerName.includes('curry') ||
      lowerName.includes('roti') ||
      lowerName.includes('naan')
    ) {
      dishCategory = 'Meals';
      dishEmoji = '🍛';
    } else if (
      lowerName.includes('popcorn') ||
      lowerName.includes('strip') ||
      lowerName.includes('wing') ||
      lowerName.includes('fries') ||
      lowerName.includes('momo') ||
      lowerName.includes('maggi') ||
      lowerName.includes('sandwich') ||
      lowerName.includes('burger')
    ) {
      dishCategory = 'Snacks';
      dishEmoji = lowerName.includes('chicken') ? '🍗' : '🍲';
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
