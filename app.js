/* eslint-disable no-undef */
// Soofty Drink Lab — App de base (FR)

const STORAGE_KEYS = {
  ingredients: 'sdl_ingredients_v1',
  recipe: 'sdl_recipe_v1',
};

/** @typedef {Object} Ingredient */
/** @typedef {Object} RecipeComponent */

/**
 * Utils
 */
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Default preset ingredients
 */
const DEFAULT_PRESETS = [
  {
    id: generateId(), name: 'Eau', category: 'base', color: '#6dd3fb',
    sugar_g_per_100ml: 0, calories_per_100ml: 0, caffeine_mg_per_100ml: 0, cost_eur_per_liter: 0.0,
  },
  {
    id: generateId(), name: 'Sirop sucre 50%', category: 'sucrant', color: '#ffe28a',
    sugar_g_per_100ml: 50, calories_per_100ml: 50 * 4, caffeine_mg_per_100ml: 0, cost_eur_per_liter: 1.2,
  },
  {
    id: generateId(), name: 'Acide citrique 10%', category: 'acide', color: '#b5f5a2',
    sugar_g_per_100ml: 0, calories_per_100ml: 0, caffeine_mg_per_100ml: 0, cost_eur_per_liter: 1.0,
  },
  {
    id: generateId(), name: 'Arôme cola (0%)', category: 'arôme', color: '#c9b8ff',
    sugar_g_per_100ml: 0, calories_per_100ml: 0, caffeine_mg_per_100ml: 0, cost_eur_per_liter: 5.0,
  },
  {
    id: generateId(), name: 'Solution caféine 200 mg/100ml', category: 'caféine', color: '#ffd0d6',
    sugar_g_per_100ml: 0, calories_per_100ml: 0, caffeine_mg_per_100ml: 200, cost_eur_per_liter: 8.0,
  },
];

/**
 * State
 */
let ingredients = [];
let recipe = []; // [{ id, ingredientId, volumeMl }]

/**
 * Storage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(ingredients));
  localStorage.setItem(STORAGE_KEYS.recipe, JSON.stringify(recipe));
}
function loadState() {
  try {
    const ing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients) || '[]');
    const rec = JSON.parse(localStorage.getItem(STORAGE_KEYS.recipe) || '[]');
    if (Array.isArray(ing)) ingredients = ing;
    if (Array.isArray(rec)) recipe = rec;
  } catch (_) {
    // ignore
  }
}

/**
 * Computations
 */
function computeStats() {
  const totalVolume = recipe.reduce((sum, comp) => sum + toNumber(comp.volumeMl, 0), 0);
  const totals = recipe.reduce(
    (acc, comp) => {
      const ing = ingredients.find(i => i.id === comp.ingredientId);
      if (!ing) return acc;
      const vol = toNumber(comp.volumeMl, 0);
      acc.sugar_g += (toNumber(ing.sugar_g_per_100ml, 0) / 100) * vol;
      const cal100 = toNumber(ing.calories_per_100ml, null);
      const cal = cal100 == null
        ? (toNumber(ing.sugar_g_per_100ml, 0) * 4 / 100) * vol
        : (cal100 / 100) * vol;
      acc.calories += cal;
      acc.caffeine_mg += (toNumber(ing.caffeine_mg_per_100ml, 0) / 100) * vol;
      acc.cost_eur += (toNumber(ing.cost_eur_per_liter, 0) / 1000) * vol;
      return acc;
    },
    { sugar_g: 0, calories: 0, caffeine_mg: 0, cost_eur: 0 },
  );

  const per100 = totalVolume > 0 ? {
    sugar_g: (totals.sugar_g / totalVolume) * 100,
    calories: (totals.calories / totalVolume) * 100,
    caffeine_mg: (totals.caffeine_mg / totalVolume) * 100,
    cost_eur: (totals.cost_eur / totalVolume) * 100,
  } : { sugar_g: 0, calories: 0, caffeine_mg: 0, cost_eur: 0 };

  return { totalVolume, totals, per100 };
}

/**
 * DOM helpers
 */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function formatNumber(n, digits = 1) {
  return Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n || 0);
}
function formatCurrency(n) {
  return Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);
}

/**
 * Rendering — Ingredients
 */
function renderIngredients() {
  const list = $('#ingredients-list');
  list.innerHTML = '';

  ingredients.forEach(ing => {
    const tpl = document.importNode($('#tpl-ingredient-row').content, true);
    const row = tpl.querySelector('.ingredient-row');
    const elName = row.querySelector('[data-role="name"]');
    const elCategory = row.querySelector('[data-role="category"]');
    const elSugar = row.querySelector('[data-role="sugar"]');
    const elCalories = row.querySelector('[data-role="calories"]');
    const elCaffeine = row.querySelector('[data-role="caffeine"]');
    const elCost = row.querySelector('[data-role="cost"]');
    const elColor = row.querySelector('[data-role="color"]');
    const elColorInput = row.querySelector('[data-role="color-input"]');

    elName.value = ing.name;
    elCategory.value = ing.category;
    elSugar.value = toNumber(ing.sugar_g_per_100ml, 0);
    elCalories.value = toNumber(ing.calories_per_100ml, 0);
    elCaffeine.value = toNumber(ing.caffeine_mg_per_100ml, 0);
    elCost.value = toNumber(ing.cost_eur_per_liter, 0);
    elColor.style.background = ing.color || '#7ad1ff';
    elColorInput.value = ing.color || '#7ad1ff';

    elName.addEventListener('change', () => { ing.name = elName.value.trim(); saveState(); renderRecipe(); });
    elCategory.addEventListener('change', () => { ing.category = elCategory.value; saveState(); });
    elSugar.addEventListener('change', () => { ing.sugar_g_per_100ml = toNumber(elSugar.value, 0); saveState(); renderStats(); });
    elCalories.addEventListener('change', () => { ing.calories_per_100ml = toNumber(elCalories.value, 0); saveState(); renderStats(); });
    elCaffeine.addEventListener('change', () => { ing.caffeine_mg_per_100ml = toNumber(elCaffeine.value, 0); saveState(); renderStats(); });
    elCost.addEventListener('change', () => { ing.cost_eur_per_liter = toNumber(elCost.value, 0); saveState(); renderStats(); });
    elColorInput.addEventListener('change', () => { ing.color = elColorInput.value; elColor.style.background = ing.color; saveState(); });

    row.querySelector('[data-role="use"]').addEventListener('click', () => {
      addRecipeComponent(ing.id, 100);
    });
    row.querySelector('[data-role="delete"]').addEventListener('click', () => {
      if (!confirm(`Supprimer l'ingrédient « ${ing.name} » ?`)) return;
      // If used in recipe, remove components first
      recipe = recipe.filter(comp => comp.ingredientId !== ing.id);
      ingredients = ingredients.filter(i => i.id !== ing.id);
      saveState();
      renderIngredients();
      renderRecipe();
      renderStats();
    });

    list.appendChild(tpl);
  });
}

/**
 * Rendering — Recipe
 */
function renderRecipe() {
  const list = $('#recipe-list');
  list.innerHTML = '';

  const ingredientOptions = ingredients.map(ing => ({ id: ing.id, label: ing.name }));

  recipe.forEach(comp => {
    const tpl = document.importNode($('#tpl-recipe-row').content, true);
    const row = tpl.querySelector('.recipe-row');
    const select = row.querySelector('[data-role="ingredient"]');
    const inputVol = row.querySelector('[data-role="volume"]');

    // Fill options
    ingredientOptions.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.id;
      o.textContent = opt.label;
      select.appendChild(o);
    });

    select.value = comp.ingredientId;
    inputVol.value = toNumber(comp.volumeMl, 0);

    select.addEventListener('change', () => { comp.ingredientId = select.value; saveState(); renderStats(); });
    inputVol.addEventListener('change', () => { comp.volumeMl = clamp(toNumber(inputVol.value, 0), 0, 100000); saveState(); renderStats(); });

    row.querySelector('[data-role="remove"]').addEventListener('click', () => {
      recipe = recipe.filter(c => c.id !== comp.id);
      saveState();
      renderRecipe();
      renderStats();
    });

    list.appendChild(tpl);
  });
}

/**
 * Rendering — Stats
 */
function renderStats() {
  const { totalVolume, totals, per100 } = computeStats();
  const stats = $('#stats');
  stats.innerHTML = '';

  const items = [
    { label: 'Volume total', value: `${formatNumber(totalVolume, 0)} ml` },
    { label: 'Sucre (pour 100 ml)', value: `${formatNumber(per100.sugar_g, 1)} g` },
    { label: 'Sucre total', value: `${formatNumber(totals.sugar_g, 1)} g` },
    { label: 'Calories (pour 100 ml)', value: `${formatNumber(per100.calories, 0)} kcal` },
    { label: 'Calories totales', value: `${formatNumber(totals.calories, 0)} kcal` },
    { label: 'Caféine (pour 100 ml)', value: `${formatNumber(per100.caffeine_mg, 1)} mg` },
    { label: 'Caféine totale', value: `${formatNumber(totals.caffeine_mg, 1)} mg` },
    { label: 'Coût (pour 100 ml)', value: `${formatCurrency(per100.cost_eur)}` },
    { label: 'Coût total', value: `${formatCurrency(totals.cost_eur)}` },
  ];

  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'stat';
    el.innerHTML = `<div class="label">${it.label}</div><div class="value">${it.value}</div>`;
    stats.appendChild(el);
  });
}

/**
 * Actions
 */
function addIngredient(initial = {}) {
  const ing = {
    id: generateId(),
    name: initial.name || 'Nouvel ingrédient',
    category: initial.category || 'autre',
    sugar_g_per_100ml: toNumber(initial.sugar_g_per_100ml, 0),
    calories_per_100ml: toNumber(initial.calories_per_100ml, 0),
    caffeine_mg_per_100ml: toNumber(initial.caffeine_mg_per_100ml, 0),
    cost_eur_per_liter: toNumber(initial.cost_eur_per_liter, 0),
    color: initial.color || '#7ad1ff',
  };
  ingredients.unshift(ing);
  saveState();
  renderIngredients();
}
function addRecipeComponent(ingredientId, volumeMl) {
  const comp = { id: generateId(), ingredientId, volumeMl: toNumber(volumeMl, 0) };
  recipe.push(comp);
  saveState();
  renderRecipe();
  renderStats();
}

function loadPresets() {
  // Merge presets without duplicating by name
  const names = new Set(ingredients.map(i => i.name.toLowerCase()));
  const toAdd = DEFAULT_PRESETS.filter(p => !names.has(p.name.toLowerCase()))
    .map(p => ({ ...p, id: generateId() }));
  ingredients = [...toAdd, ...ingredients];
  saveState();
  renderIngredients();
}

function resetRecipe() {
  if (!confirm('Réinitialiser la recette ?')) return;
  recipe = [];
  saveState();
  renderRecipe();
  renderStats();
}

function exportAll() {
  const data = { ingredients, recipe, exportedAt: new Date().toISOString(), app: 'Soofty Drink Lab v1' };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'soofty-drink-lab.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data.ingredients)) ingredients = data.ingredients;
      if (Array.isArray(data.recipe)) recipe = data.recipe;
      saveState();
      renderIngredients();
      renderRecipe();
      renderStats();
    } catch (e) {
      alert('Fichier invalide.');
    }
  };
  reader.readAsText(file);
}

/**
 * Init
 */
function init() {
  loadState();
  if (ingredients.length === 0) {
    // Start with a minimal set for convenience
    ingredients = DEFAULT_PRESETS.map(p => ({ ...p, id: generateId() }));
    saveState();
  }

  $('#btn-add-ingredient').addEventListener('click', () => addIngredient());
  $('#btn-load-presets').addEventListener('click', () => loadPresets());
  $('#btn-add-component').addEventListener('click', () => {
    if (ingredients.length === 0) addIngredient();
    const firstId = ingredients[0]?.id;
    addRecipeComponent(firstId, 100);
  });
  $('#btn-new').addEventListener('click', () => resetRecipe());
  $('#btn-export').addEventListener('click', () => exportAll());
  $('#file-import').addEventListener('change', (e) => importFromFile(e.target.files?.[0]));

  renderIngredients();
  renderRecipe();
  renderStats();
}

window.addEventListener('DOMContentLoaded', init);
