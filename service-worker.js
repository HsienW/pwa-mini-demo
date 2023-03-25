console.log('======== cache script loaded ========')
var cacheStorageKey = 'pwa-mini-02'

var cacheList = [
    '/',
    'index.html',
    'main.css',
    'icon.png',
]

// 處理靜態緩存
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheStorageKey)
            .then((cache) => cache.addAll(cacheList)) // 掛入注册完成安裝Service Worker時，抓取資源寫入緩存
            .then(() => self.skipWaiting()) // call skipWaiting 新的 Service Worker 腳本能立即啟動和生效
    )
})

// 處理動態緩存
// 真實的項目當中，可以根據資源的類型，網站的特點，可以專門設計複雜的策略。fetch事件當中甚至可以手動生成Response返回給頁面
self.addEventListener('fetch', (event) => { // 網頁抓取資源的過程中，在 Service Worker 可以捕獲到 fetch 事件
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response != null) {
                    return response
                }
                return fetch(event.request.url)
            })
    )
})

// 更新靜態資源
// 緩存的資源隨著版本的更新會過期，所以會根據緩存的字串名稱（變數為 cacheStorageKey，值用了'pwa-mini-01'）清除舊緩存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all(
            caches.keys()
                .then((cacheNames) => {
                    return cacheNames.map((name) => {
                        if (name !== cacheStorageKey) {
                            return caches.delete(name)
                        }
                    })
                })
        ).then(() => {
            // call self.clients.claim() 取得頁面的控制權，這樣之後打開頁面都會使用版本更新的緩存。
            // 舊的Service Worker腳本不再控制著頁面之後會被停止
            return self.clients.claim()
        })
    )
})
