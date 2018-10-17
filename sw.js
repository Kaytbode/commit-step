importScripts('./js/appController.js');
importScripts('./js/idb.js');


const staticCacheName = 'commit-step-v1';

addEventListener('install', event=>{
    event.waitUntil(
        caches.open(staticCacheName).then(cache=>{
            return cache.addAll([
                '/',
                '/css/main.css',
                '/js/appController.js',
                '/js/events.js',
                '/js/idb.js',
                "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
                'https://fonts.googleapis.com/css?family=Roboto+Mono|Dosis',

            ]).then(()=> self.skipWaiting())
        })
    );
});

addEventListener('activate', event=>{
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.filter(cacheName=>{
                    return cacheName.startsWith('commit-step-')&&
                    cacheName !== staticCacheName;
                }).map(cacheName=> caches.delete(cacheName))
            );
        })
    );
    return self.clients.claim();
});

addEventListener('fetch', event=>{
    event.respondWith(
        caches.match(event.request, {ignoreSearch: true})
        .then(response=> {
                return response || fetch(event.request);
        })
    );
});

addEventListener('sync', event =>{
    if (event.tag == 'moveStep') {
        event.waitUntil(commitSteps());
        //inform the app about your posting to indexDB
        // using BroadcastChannel API
        const channel = new BroadcastChannel('sw-message');
        channel.postMessage({action:'posted to indexDB'});  
    } 
});

// Generate steps from github commits
const commitSteps =()=> {
    const dbPromise = AppController.initializeDB();

    dbPromise.then(async db => {
        let store = db.transaction('username').objectStore('username');
        const userName = await store.get('user');

        const step = await AppController.calcSteps(userName);
        // opens another transaction cos the async function 
        // causes the idb transaction to autoclose
        const tx = db.transaction('username', 'readwrite');
        store = tx.objectStore('username');

        const stepUp = await store.get('stepUp');
        const stepRight = await store.get('stepRight');
        //post the steps to take to indexDb
        store.put(stepUp - step, 'stepUp');
        store.put(stepRight + step, 'stepRight');
        store.put(step, 'step');

        return tx.complete;
    });
}

