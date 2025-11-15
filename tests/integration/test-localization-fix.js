// Quick test to verify the localization fix
const { translations } = require('./src/lib/simple-translations.ts');

console.log('Testing translations structure:');
console.log('English translations:', Object.keys(translations.en).length, 'keys');
console.log('Arabic translations:', Object.keys(translations.ar).length, 'keys');

console.log('\nTesting specific key:');
console.log('EN access_previous_results:', translations.en.access_previous_results);
console.log('AR access_previous_results:', translations.ar.access_previous_results);

console.log('\nTesting language structure:');
console.log('translations.en exists:', !!translations.en);
console.log('translations.ar exists:', !!translations.ar);