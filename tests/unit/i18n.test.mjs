import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  DICTIONARIES,
  getTranslation,
  detectBrowserLocale,
  formatCurrencyForLocale,
  getHreflangAlternates,
} from '../../utils/shared/i18n.js';

describe('SkillBun Global Internationalization (i18n) Engine Suite', () => {
  it('defines 8 global supported locales with native metadata', () => {
    assert.strictEqual(SUPPORTED_LOCALES.length, 8);
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    assert.deepStrictEqual(codes, ['en', 'es', 'hi', 'fr', 'de', 'pt', 'ja', 'id']);
    assert.strictEqual(DEFAULT_LOCALE, 'en');

    SUPPORTED_LOCALES.forEach((loc) => {
      assert.ok(loc.code, 'Locale code must be defined');
      assert.ok(loc.label, 'Locale label must be defined');
      assert.ok(loc.nativeName, 'Locale nativeName must be defined');
      assert.ok(loc.dir === 'ltr' || loc.dir === 'rtl', 'Locale dir must be ltr or rtl');
    });
  });

  it('contains complete dictionary structures for all 8 supported languages', () => {
    const requiredSections = ['nav', 'hero', 'stats', 'sections', 'footer', 'common'];

    SUPPORTED_LOCALES.forEach((loc) => {
      const dict = DICTIONARIES[loc.code];
      assert.ok(dict, `Dictionary must exist for locale ${loc.code}`);

      requiredSections.forEach((section) => {
        assert.ok(dict[section], `Section "${section}" must exist in locale ${loc.code}`);
      });

      // Essential common keys
      assert.ok(dict.nav.roadmaps, `nav.roadmaps must exist in ${loc.code}`);
      assert.ok(dict.nav.quiz, `nav.quiz must exist in ${loc.code}`);
      assert.ok(dict.hero.ctaStartQuiz, `hero.ctaStartQuiz must exist in ${loc.code}`);
      assert.ok(dict.footer.brandBio, `footer.brandBio must exist in ${loc.code}`);
    });
  });

  it('retrieves nested translations accurately for English and translated locales', () => {
    const enRoadmaps = getTranslation('en', 'nav.roadmaps');
    assert.strictEqual(enRoadmaps, 'Roadmaps');

    const esRoadmaps = getTranslation('es', 'nav.roadmaps');
    assert.strictEqual(esRoadmaps, 'Rutas de Aprendizaje');

    const hiRoadmaps = getTranslation('hi', 'nav.roadmaps');
    assert.strictEqual(hiRoadmaps, 'करियर रोडमैप');

    const frRoadmaps = getTranslation('fr', 'nav.roadmaps');
    assert.strictEqual(frRoadmaps, 'Parcours Pro');

    const deRoadmaps = getTranslation('de', 'nav.roadmaps');
    assert.strictEqual(deRoadmaps, 'Lernpfade');

    const ptRoadmaps = getTranslation('pt', 'nav.roadmaps');
    assert.strictEqual(ptRoadmaps, 'Trilhas de Carreira');

    const jaRoadmaps = getTranslation('ja', 'nav.roadmaps');
    assert.strictEqual(jaRoadmaps, 'ロードマップ');

    const idRoadmaps = getTranslation('id', 'nav.roadmaps');
    assert.strictEqual(idRoadmaps, 'Roadmap Karir');
  });

  it('falls back safely to English when a key is missing in a target language', () => {
    // Non-existent key in subdictionary should fallback to English or fallback string
    const fallbackVal = getTranslation('es', 'non.existent.key', 'Default Fallback');
    assert.strictEqual(fallbackVal, 'Default Fallback');

    // If no fallback provided, returns keyPath
    const keyPathFallback = getTranslation('fr', 'missing.test.key');
    assert.strictEqual(keyPathFallback, 'missing.test.key');
  });

  it('detects browser and HTTP accept-language headers accurately', () => {
    assert.strictEqual(detectBrowserLocale('es-ES,es;q=0.9'), 'es');
    assert.strictEqual(detectBrowserLocale('hi-IN,hi;q=0.8'), 'hi');
    assert.strictEqual(detectBrowserLocale('fr-FR,fr;q=0.9'), 'fr');
    assert.strictEqual(detectBrowserLocale('de-DE,de;q=0.9'), 'de');
    assert.strictEqual(detectBrowserLocale('pt-BR,pt;q=0.9'), 'pt');
    assert.strictEqual(detectBrowserLocale('ja-JP,ja;q=0.9'), 'ja');
    assert.strictEqual(detectBrowserLocale('id-ID,id;q=0.9'), 'id');
    assert.strictEqual(detectBrowserLocale('zh-CN,zh;q=0.9'), 'en'); // Non-supported falls back to en
    assert.strictEqual(detectBrowserLocale(''), 'en');
  });

  it('formats currency with locale context safely', () => {
    const usd = formatCurrencyForLocale(120000, 'en-US', 'USD');
    assert.ok(usd.includes('120,000') || usd.includes('$120,000'));

    const eur = formatCurrencyForLocale(95000, 'de-DE', 'EUR');
    assert.ok(eur.includes('95.000') || eur.includes('€'));

    const inr = formatCurrencyForLocale(1500000, 'hi-IN', 'INR');
    assert.ok(inr.includes('15,00,000') || inr.includes('₹'));
  });

  it('generates complete hreflang alternate maps for global search engines', () => {
    const canonical = 'https://skillbun.tech/roadmap/ai_ml_engineer';
    const alternates = getHreflangAlternates(canonical);

    assert.ok(alternates['x-default']);
    assert.strictEqual(alternates['x-default'], canonical);

    SUPPORTED_LOCALES.forEach((loc) => {
      assert.strictEqual(alternates[loc.code], `${canonical}?lang=${loc.code}`);
    });
  });
});
