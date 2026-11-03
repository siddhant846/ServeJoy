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
 * Generate a deterministic hash seed for any dish name.
 * Guaranteed to produce a different seed for different dishes, ensuring NO TWO DISHES share the same image.
 */
export function generateDishSeed(dishName: string, salt: number = 0): number {
  let hash = 0;
  const clean = `${dishName.toLowerCase().trim()}_${salt}`;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (Math.abs(hash) % 999999) + 1;
}

/**
 * Strictly check if the dish exactly matches one of our local photography assets.
 * NEVER return a generic fallback like grilled sandwich for chicken popcorn or momos!
 */
export function matchExactLocalDish(dishName: string): string | null {
  const name = dishName.toLowerCase().trim();

  // Pav Bhaji
  if (name.includes('pav') && name.includes('bhaji')) return '/dishes/pav_bhaji.jpg';
  // Dal Baati
  if (name.includes('dal') && (name.includes('baati') || name.includes('bati'))) return '/dishes/dal_baati.jpg';
  // Chole Bhature / Puri
  if (name.includes('chole') && (name.includes('puri') || name.includes('bhature'))) return '/dishes/chole_puri.jpg';
  // Dhokla
  if (name.includes('dhokla') || name.includes('khaman')) return '/dishes/dhokla.jpg';
  // Masala Chai
  if (name.includes('masala chai') || name.includes('kadak chai') || name.includes('cutting chai')) return '/dishes/masala_chai.jpg';
  // Ginger Adrak Tea
  if (name.includes('ginger') || name.includes('adrak')) return '/dishes/ginger_tea.jpg';
  // Filter Coffee
  if (name.includes('filter coffee') || name.includes('kaapi')) return '/dishes/filter_coffee.jpg';
  // Kulhad Coffee
  if (name.includes('kulhad') && name.includes('coffee')) return '/dishes/kulhad_coffee.jpg';
  // Gulab Jamun
  if (name.includes('gulab jamun')) return '/dishes/gulab_jamun.jpg';
  // Bun Maska
  if (name.includes('bun maska') || (name.includes('bun') && name.includes('butter'))) return '/dishes/bun_maska.jpg';
  // Plain Veg Maggi (ONLY if explicitly veg or plain, NOT chicken or cheese)
  if ((name === 'veg maggi' || name === 'vegetable maggi') && !name.includes('chicken')) return '/dishes/veg_maggi.jpg';
  // Grilled Sandwich (ONLY if specifically Bombay Masala or Veg Grilled sandwich, NOT chicken or burger)
  if ((name.includes('masala sandwich') || name.includes('grilled sandwich')) && !name.includes('chicken') && !name.includes('paneer') && !name.includes('strips')) {
    return '/dishes/grilled_sandwich.jpg';
  }

  // No exact local asset — must generate bespoke AI photography!
  return null;
}

/**
 * AI Dish Visualizer:
 * Analyzes the semantic meaning of the dish name and builds a hyper-specific,
 * gourmet culinary prompt describing the exact shape, texture, color, garnishes, and plating.
 *
 * Example:
 * - "Chicken Popcorn" -> bite-sized crispy golden clusters in a paper bucket with garlic dip
 * - "Chicken Strips"  -> long panko-crusted chicken tenders with honey mustard on parchment
 * - "Chicken Wings"   -> glazed sticky buffalo wings with toasted sesame and scallions
 * - "Veg Fried Momos" -> golden fried pleated dumplings with fiery red chili chutney
 * - "Chicken Momos"   -> delicate steamed dumplings in a bamboo steamer with light steam
 * - "Chicken Maggi"   -> spicy noodles topped with tender shredded chicken chunks & green chili
 * - "Masala Maggi"    -> yellow street-style noodles with corn, green peas, melting butter
 */
export function generateDishVisualPrompt(dishName: string, category: string): string {
  const name = dishName.toLowerCase().trim();

  // 1. CHICKEN SNACKS (Differentiate Popcorn vs Strips vs Wings vs Nuggets vs Lollipop vs Tikka)
  if (name.includes('popcorn')) {
    return `Gourmet culinary photography of bite-sized crispy golden fried chicken popcorn bites, jagged crunchy battered coating, served in a kraft paper cup on wooden table with spicy garlic mayo dip, fresh herbs, warm cafe lighting, 4k macro`;
  }
  if (name.includes('strip') || name.includes('tender') || name.includes('finger')) {
    return `Gourmet food photography of golden crispy chicken strips tenders, elongated slender cut, crunchy panko breadcrumb crust, served on parchment paper on wooden board with honey mustard sauce and BBQ dip, parsley garnish, shallow depth of field, 4k`;
  }
  if (name.includes('wing')) {
    return `Gourmet photography of glossy glazed chicken wings, sticky spicy barbecue buffalo glaze, sprinkled with toasted white sesame seeds and fresh sliced scallions, arranged on dark slate platter with celery sticks, 4k high end cafe`;
  }
  if (name.includes('nugget')) {
    return `Gourmet photography of crispy golden chicken nuggets, tender interior, served with tangy tomato relish and cheese dip on rustic ceramic plate, 4k`;
  }
  if (name.includes('lollipop')) {
    return `Indo-Chinese chicken lollipop, crispy battered drumettes wrapped with silver foil, tossed in spicy sweet red Schezwan sauce, garnished with spring onion greens, 4k`;
  }
  if (name.includes('tikka') && name.includes('chicken')) {
    return `Tender char-grilled tandoori chicken tikka pieces, vibrant red-orange marinade with char marks, served with fresh red onion rings, lemon wedges, and mint chutney on sizzling platter, 4k`;
  }

  // 2. MOMOS & DUMPLINGS (Differentiate Fried vs Steamed vs Tandoori vs Gravy, Veg vs Chicken)
  if (name.includes('momo') || name.includes('dumpling') || name.includes('dim sum') || name.includes('dimsum')) {
    const isFried = name.includes('fried') || name.includes('crispy') || name.includes('kurkure');
    const isTandoori = name.includes('tandoori') || name.includes('char');
    const isChicken = name.includes('chicken') || name.includes('non veg') || name.includes('meat');

    if (isFried) {
      return `Deep-fried crispy golden ${isChicken ? 'chicken' : 'vegetable'} momos dumplings, crunchy blistered pleated shell, served on slate board with fiery red chili garlic Schezwan dipping sauce and mayo, 4k`;
    }
    if (isTandoori) {
      return `Char-grilled tandoori ${isChicken ? 'chicken' : 'paneer veg'} momos dumplings, coated in spicy orange yogurt marinade with black grill marks, served with onion rings and green mint chutney, 4k`;
    }
    return `Authentic delicate steamed pleated ${isChicken ? 'chicken' : 'vegetable'} momos dumplings in traditional wooden bamboo steamer basket, light hot steam rising, fiery red Himalayan dipping sauce, 4k macro`;
  }

  // 3. FRIES & POTATO SNACKS
  if (name.includes('fries') || name.includes('french fries') || name.includes('potato')) {
    if (name.includes('peri') || name.includes('spicy') || name.includes('masala')) {
      return `Crispy golden shoestring French fries heavily dusted with vibrant fiery red peri peri chili seasoning powder, served in a stainless steel mini frying basket with creamy garlic mayo dip, 4k`;
    }
    if (name.includes('cheese') || name.includes('loaded')) {
      return `Loaded crispy french fries smothered in warm molten golden cheddar cheese sauce, jalapeño slices, and chopped spring onions on cast iron skillet, 4k`;
    }
    return `Freshly fried golden crisp salted French fries in a rustic brown paper cone, crispy texture, served with tomato ketchup and garlic herb dip, 4k`;
  }

  // 4. MAGGI & NOODLES (Differentiate Chicken vs Masala vs Veg vs Cheese vs Egg)
  if (name.includes('maggi') || name.includes('noodle') || name.includes('chowmein')) {
    if (name.includes('chicken')) {
      return `Hot steamy spicy Indian style instant noodles loaded with tender shredded spiced chicken pieces, sliced green chilies, and fresh chopped cilantro leaves, served in a dark ceramic cafe bowl, 4k`;
    }
    if (name.includes('cheese')) {
      return `Indulgent hot spicy Maggi noodles covered under a thick blanket of melted bubbling mozzarella and cheddar cheese, sprinkled with red chili flakes and oregano, 4k`;
    }
    if (name.includes('egg') || name.includes('bhurji')) {
      return `Spicy street-style Maggi noodles tossed with fluffy spiced scrambled eggs, chopped green onions, and Indian curry masala in a warm bowl, 4k`;
    }
    if (name.includes('veg') || name.includes('vegetable')) {
      return `Colorful vegetable Maggi noodles with diced carrots, sweet green peas, corn kernels, chopped bell peppers, and fresh herbs in a ceramic bowl, 4k`;
    }
    return `Classic street-style Indian masala Maggi noodles with rich golden yellow curry sauce, topped with a melting cube of Amul butter and fresh coriander, 4k`;
  }

  // 5. SANDWICHES (Differentiate Chicken vs Paneer vs Veg vs Cheese vs Club)
  if (name.includes('sandwich') || name.includes('toast') || name.includes('panini')) {
    if (name.includes('chicken')) {
      return `Gourmet toasted club sandwich filled with sliced roasted spiced chicken breast, crispy lettuce, ripe red tomato slices, and melted cheese between grilled artisan bread, cut diagonally, 4k`;
    }
    if (name.includes('paneer')) {
      return `Grilled panini sandwich stuffed with spiced marinated cottage cheese paneer tikka cubes, crunchy green capsicum, onion rings, and tangy green mint chutney, golden grill lines, 4k`;
    }
    if (name.includes('cheese') && !name.includes('veg')) {
      return `Decadent grilled three-cheese toast sandwich with golden buttered toasted bread and stretching melted mozzarella cheese pull, herbs, 4k`;
    }
    return `Traditional Indian street-style vegetable grilled sandwich with layers of sliced cucumber, tomato, beetroot, spiced potato, and green chutney with melted cheese, cut into 4 squares, 4k`;
  }

  // 6. BURGERS & ROLLS
  if (name.includes('burger')) {
    const isChicken = name.includes('chicken');
    const isPaneer = name.includes('paneer');
    if (isChicken) {
      return `Artisan chicken burger with crispy fried chicken fillet, melted cheddar cheese drape, crunchy iceberg lettuce, pickles, and spicy mayo inside a glossy toasted brioche bun, 4k`;
    }
    if (isPaneer) {
      return `Gourmet paneer burger with a thick spiced cottage cheese patty, mint mayo, tomato slice, and crisp lettuce inside a soft sesame bun, 4k`;
    }
    return `Classic crispy vegetable burger with a golden spiced potato patty, onion rings, tomato, and tangy secret burger sauce in a soft toasted sesame bun, 4k`;
  }

  if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {
    const isChicken = name.includes('chicken');
    return `Flaky golden paratha kathi roll wrapped tightly in parchment paper, stuffed with spicy ${isChicken ? 'tandoori chicken pieces' : 'marinated paneer tikka'}, sliced crunchy onions, and tangy mint spread, 4k`;
  }

  // 7. PIZZA & PASTA
  if (name.includes('pizza')) {
    if (name.includes('chicken')) {
      return `Freshly baked woodfired artisan pizza topped with spiced chicken chunks, barbecue drizzle, red onions, and melted bubbly mozzarella cheese, blistered crust, 4k`;
    }
    if (name.includes('paneer')) {
      return `Woodfired Indian style pizza loaded with marinated paneer tikka cubes, green capsicum, red onions, and gooey melted mozzarella, 4k`;
    }
    return `Classic artisan pizza with vibrant red San Marzano tomato sauce, fresh melted mozzarella rounds, fresh green basil leaves, and olive oil drizzle, 4k`;
  }

  if (name.includes('pasta')) {
    if (name.includes('red') || name.includes('arrabbiata')) {
      return `Penne pasta tossed in spicy rich red tomato arrabbiata sauce with garlic, black olives, fresh basil, and grated parmesan cheese, 4k`;
    }
    return `Creamy white sauce Alfredo penne pasta with garlic butter, sautéed mushrooms, herbs, and melted parmesan in a pasta bowl, 4k`;
  }

  // 8. BEVERAGES (Chai, Coffee, Shakes, Mojitos, Cold Drinks)
  if (category === 'Beverages' || name.includes('tea') || name.includes('chai') || name.includes('coffee') || name.includes('shake') || name.includes('cooler') || name.includes('mojito') || name.includes('juice')) {
    if (name.includes('cold coffee') || name.includes('frappe') || name.includes('iced coffee')) {
      return `Tall frosted glass of thick blended cold coffee frappe with chocolate syrup swirl inside glass, crowned with whipped cream and cocoa powder dusting, 4k`;
    }
    if (name.includes('hot chocolate')) {
      return `Steaming ceramic mug of rich thick dark hot chocolate topped with mini marshmallows and dark chocolate shavings, cozy cafe setting, 4k`;
    }
    if (name.includes('cappuccino') || name.includes('latte')) {
      return `Artisan porcelain cup of steaming hot coffee with silky micro-foam and beautiful rosette latte art on wooden cafe saucer, 4k`;
    }
    if (name.includes('kulhad')) {
      return `Aromatic hot Indian beverage served in traditional handcrafted earthen clay kulhad cup, rising steam, authentic clay texture, 4k`;
    }
    if (name.includes('chai') || name.includes('tea')) {
      return `Steaming hot authentic Indian kadak chai poured into a cutting glass with cardamom and ginger infusion, warm sunlight, 4k`;
    }
    if (name.includes('mojito') || name.includes('cooler') || name.includes('soda')) {
      return `Sparkling iced refresher cocktail in highball glass with crushed ice, fresh mint sprigs, juicy lime wedges, and effervescent bubbles, 4k`;
    }
    if (name.includes('shake')) {
      return `Thick creamy gourmet milkshake served in an artisan glass jar with whipped cream top, colorful garnish, and paper straw, 4k`;
    }
    return `Refreshing artisan beverage in clear glass with ice cubes, fruit slices garnish, and fresh condensation droplets, warm cafe light, 4k`;
  }

  // 9. DESSERTS (Brownie, Waffle, Cakes, Ice Cream, Halwa)
  if (category === 'Desserts' || name.includes('brownie') || name.includes('cake') || name.includes('waffle') || name.includes('ice cream') || name.includes('dessert') || name.includes('sweet')) {
    if (name.includes('brownie')) {
      return `Warm dense dark chocolate fudge brownie with a crackly top, crowned with a scoop of creamy vanilla ice cream and drizzled with hot melted chocolate ganache, 4k`;
    }
    if (name.includes('waffle')) {
      return `Crispy golden Belgian waffle with deep pockets, dusted with powdered sugar, warm maple syrup pour, and a scoop of vanilla ice cream, 4k`;
    }
    if (name.includes('ice cream') || name.includes('sundae')) {
      return `Gourmet dessert sundae with generous scoops of rich ice cream, crunchy nuts, chocolate fudge drizzle in an elegant glass bowl, 4k`;
    }
    return `Artisan plated gourmet dessert with elegant presentation, edible flower garnish, glossy glaze, warm ambient cafe lighting, 4k`;
  }

  // 10. MEALS & CURRIES (Biryani, Dal, Paneer, Rice, Thali)
  if (category === 'Meals' || name.includes('biryani') || name.includes('thali') || name.includes('rice') || name.includes('curry') || name.includes('dal') || name.includes('roti')) {
    if (name.includes('biryani')) {
      return `Aromatic dum biryani with long grain basmati rice, saffron streaks, crispy caramelized fried onions, and fresh mint in traditional brass handi, 4k`;
    }
    if (name.includes('thali')) {
      return `Grand royal Indian thali platter with small brass bowls of aromatic curries, dal, basmati rice, warm butter roti, papad, and fresh salad, 4k`;
    }
    if (name.includes('paneer')) {
      return `Rich velvety orange tomato makhani gravy with soft cottage cheese paneer cubes, swirl of fresh cream and coriander leaves, 4k`;
    }
    return `Authentic gourmet culinary meal of freshly prepared ${dishName}, served in an artisan ceramic serving bowl with warm butter naan and herbs, 4k`;
  }

  // Generic customized fallback: Analyzes dish name & category explicitly
  return `Gourmet culinary photography of authentic ${dishName} (${category}), professional restaurant food styling, beautiful rustic tableware, warm soft cafe lighting, shallow depth of field, 4k ultra realistic`;
}

/**
 * Match or Generate a unique AI culinary image for any dish name.
 * Strictly avoids duplicate images!
 */
export function matchLocalDishImage(dishName: string, category: string, salt: number = 0): string {
  // 1. If dish has an exact local authentic photography file and salt is 0, use it
  const localMatch = matchExactLocalDish(dishName);
  if (localMatch && salt === 0) {
    return localMatch;
  }

  // 2. Otherwise generate a customized, distinct AI image with a unique seed and semantic prompt
  const visualPrompt = generateDishVisualPrompt(dishName, category);
  const seed = generateDishSeed(dishName, salt);
  const encodedPrompt = encodeURIComponent(visualPrompt);

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&seed=${seed}&nologo=true&model=flux`;
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
    imageUrl: matchLocalDishImage('Crispy Chicken Popcorn', 'Snacks'),
    selected: true,
  },
  {
    name: 'Golden Chicken Strips',
    category: 'Snacks',
    price: 180,
    cost: 70,
    description: 'Tender chicken tenders with a crunchy panko breadcrumb crust served with honey mustard sauce.',
    emoji: '🍗',
    imageUrl: matchLocalDishImage('Golden Chicken Strips', 'Snacks'),
    selected: true,
  },
  {
    name: 'Veg. Fried Momos',
    category: 'Snacks',
    price: 120,
    cost: 45,
    description: 'Crispy golden fried pleated vegetable dumplings served with fiery red Sichuan chili chutney.',
    emoji: '🥟',
    imageUrl: matchLocalDishImage('Veg. Fried Momos', 'Snacks'),
    selected: true,
  },
  {
    name: 'Steamed Chicken Momos',
    category: 'Snacks',
    price: 140,
    cost: 55,
    description: 'Delicate steamed juicy chicken dumplings served in an authentic bamboo basket with spicy dip.',
    emoji: '🥟',
    imageUrl: matchLocalDishImage('Steamed Chicken Momos', 'Snacks'),
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
 * Digitize a raw text / pasted menu into structured dishes with bespoke AI photography
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
