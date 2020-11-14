'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "fbbe8bf7a3c583a439e5857bdf886ae4",
"assets/assets/fonts/SourceSansPro-Black.ttf": "164d28eee9bd2658488d8bdefdb7b5b6",
"assets/assets/fonts/SourceSansPro-Bold.ttf": "7e0ee8c45d872446649aacd3ce96e1f7",
"assets/assets/fonts/SourceSansPro-Italic.ttf": "f2268e7070f6d13a832ff5e0b2643d37",
"assets/assets/fonts/SourceSansPro-Regular.ttf": "3f482321becfaa40fcb19825fa717859",
"assets/assets/images/account-48.png": "446de804f61b2abe22a456716ecf32f6",
"assets/assets/images/account-96.png": "f4bbbb57090c1ba7862d0f77974e2893",
"assets/assets/images/account-grey-48.png": "8baab3d69e5f6b7970e0c467bd2d237f",
"assets/assets/images/help-48.png": "0bf3d33d7417d911c02ab76741e4ef16",
"assets/assets/images/historic-ship-48.png": "90c5f0ce50b77eaca31a42c1736b3d1d",
"assets/assets/images/historic-ship-96.png": "4d2fec4b52d0334ded171f950161d753",
"assets/assets/images/historic-ship-grey-48.png": "1a72fa906aa2ed756382ee70c69e94f0",
"assets/assets/images/import-48.png": "79f80053443c65f52715634e182a9413",
"assets/assets/images/information-48.png": "91f327e5200f4b64fcddbadd6b55d55e",
"assets/assets/images/maintenance-48.png": "58100549f0c8e1250179d504a64abe0b",
"assets/assets/images/pdf-48.png": "102bdfa73809b35f98198bac12238ec7",
"assets/assets/images/sailing-ship-48.png": "7f92e530dbfe6e4f525227894b888ea9",
"assets/assets/images/services-48.png": "aadc9a4c9febce6011796ed327e7978f",
"assets/assets/images/ship-wheel-48.png": "c583ecbcc0e8baa2b7370dfc42f41d31",
"assets/assets/images/ship-wheel-96.png": "8620310f0c2720029c09bc1c7cf12c65",
"assets/assets/images/statistics-48.png": "12c70371137fe1f9556b8c00b501b3be",
"assets/assets/images/statistics-96.png": "be3e07fa25e05e1d52f86e28d959c9ab",
"assets/assets/images/statistics-grey-48.png": "fed4324de546a49199f72e0b902b2872",
"assets/assets/images/user-48.png": "908105ac1b0cddbb0809e9021194272a",
"assets/assets/images/user-96.png": "fbb1ed463c54d8456629215bd57e298f",
"assets/assets/images/user-grey-48.png": "49bc84e04fb4297f8b429f8f1f6612e7",
"assets/assets/pdfs/help.pdf": "dca0b0099b0c02a79398f5ec7b36110f",
"assets/FontManifest.json": "8157b0d559944cb149df31121d0ecbfb",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "462074c245658d641c98d3dedc43c2f3",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "ad7738b6156258c58a562202f12dd7ea",
"/": "ad7738b6156258c58a562202f12dd7ea",
"main.dart.js": "7549a09c2735f8ff33d04f7ec355d2af",
"manifest.json": "06b85c75a1abf7260cddd247d4874eb4",
"version.json": "1d08ab3b81db0d56391425baa04ed3a6"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
