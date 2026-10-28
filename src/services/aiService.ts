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
};

export function matchLocalDishImage(dishName: string, category: string): string {
  const name = dishName.toLowerCase();

  if (name.includes('pav bhaji') || name.includes('bhaji')) return '/dishes/pav_bhaji.jpg';
  if (name.includes('dal bati') || name.includes('dal baati') || name.includes('baati')) return '/dishes/dal_baati.jpg';
  if (name.includes('chole') || name.includes('puri') || name.includes('bhature')) return '/dishes/chole_puri.jpg';
  if (name.includes('dhokla') || name.includes('khaman')) return '/dishes/dhokla.jpg';
  if (name.includes('masala chai') || name.includes('kadak') || name.includes('cutting')) return '/dishes/masala_chai.jpg';
  if (name.includes('ginger') || name.includes('adrak')) return '/dishes/ginger_tea.jpg';
  if (name.includes('filter coffee') || name.includes('kaapi')) return '/dishes/filter_coffee.jpg';
  if (name.includes('kulhad')) return '/dishes/kulhad_coffee.jpg';
  if (name.includes('bubblegum')) return '/dishes/bubblegum_coffee.jpg';
  if (name.includes('butterscotch')) return '/dishes/butterscotch_coffee.jpg';
  if (name.includes('caramel')) return '/dishes/caramel_coffee.jpg';
  if (name.includes('special') || name.includes('signature')) return '/dishes/special_coffee.jpg';
  if (name.includes('hot coffee') || name.includes('espresso') || name.includes('cappuccino')) return '/dishes/hot_coffee.jpg';
  if (name.includes('paneer') || name.includes('kathi') || name.includes('roll')) return '/dishes/paneer_roll.jpg';
  if (name.includes('gulab jamun') || name.includes('sweet') || name.includes('dessert')) return '/dishes/gulab_jamun.jpg';
  if (name.includes('sandwich') || name.includes('toast') || name.includes('panini')) return '/dishes/grilled_sandwich.jpg';
  if (name.includes('bun maska') || name.includes('maska')) return '/dishes/bun_maska.jpg';
  if (name.includes('maggi') && (name.includes('veg') || name.includes('vegetable'))) return '/dishes/veg_maggi.jpg';
  if (name.includes('maggi')) return '/dishes/plain_maggi.jpg';
  if (name.includes('shake') || name.includes('vanilla')) return '/dishes/vanilla_shake.jpg';

  // Fallback to Pollinations AI dynamic generation
  const prompt = encodeURIComponent(`Gourmet culinary photography of authentic ${dishName} ${category}, restaurant plating, warm soft cafe lighting, 4k`);
  return `https://image.pollinations.ai/prompt/${prompt}`;
}

export async function generateDishDescriptionWithGemini(dishName: string, category: string, apiKey?: string): Promise<string> {
  const key = apiKey || localStorage.getItem('servejoy_gemini_api_key') || '';
  if (!key) {
    return `Delectable freshly prepared authentic ${dishName}, seasoned with house special herbs and served hot.`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.trim()}`;
    const prompt = `Write a mouth-watering, sensory 1-2 sentence cafe menu description for "${dishName}" (Category: ${category}). Highlight authentic taste, texture, and fresh ingredients. Do not include markdown or quotes.`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }
  } catch (e) {
    console.warn('Gemini API call error:', e);
  }

  return `Delectable freshly prepared authentic ${dishName}, seasoned with house special herbs and served hot.`;
}

