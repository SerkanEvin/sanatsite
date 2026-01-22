
import fetch from 'node-fetch';

async function checkImage(url) {
    try {
        const response = await fetch(url);
        console.log(`Checking ${url}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
    }
}

// Check one artist image and one artwork image
const artistUrl = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/profimages/artist_1.png';
const artworkUrl = 'https://llhnirkpoqtqruuxbmek.supabase.co/storage/v1/object/public/images/eternal_sunset.png';

console.log('--- Diagnostic Start ---');
checkImage(artistUrl)
    .then(() => checkImage(artworkUrl))
    .then(() => console.log('--- Diagnostic End ---'));
