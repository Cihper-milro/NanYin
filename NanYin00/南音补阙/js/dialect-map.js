// 方言文化地图模块 - 修复版本
const DialectMap = {
    map: null,
    markers: [],
    currentRegion: null,

    // 方言区域数据（说明文案与 js/audio-player.js 一致，词汇复用 AI 方言陪练模块）
    regions: [
        {
            name: "梅州话",
            coords: [24.3, 116.1],
            info: "客家话分支，梅州地区方言，保留古汉语特点。",
            phraseKey: "hakka"
        },
        {
            name: "疍家话",
            coords: [23.1, 113.3],
            info: "水上居民方言，主要分布在广东沿海地区。",
            phraseKey: ""
        },
        {
            name: "雷州话",
            coords: [20.9, 110.1],
            info: "雷州半岛方言，属于闽语分支。",
            phraseKey: "minnan"
        },
        {
            name: "韶关话",
            coords: [24.8, 113.6],
            info: "粤北韶关地区方言，具有独特的地方特色。",
            phraseKey: ""
        }
    ],

    // 初始化地图
    init: function() {
        console.log('开始初始化地图...');

        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            console.error('地图容器 #map-container 未找到');
            return;
        }

        // 检查地图是否已经初始化
        if (this.map) {
            console.log('地图已经初始化，跳过重复初始化');
            return;
        }

        // 确保地图容器有高度
        if (!mapContainer.style.height) {
            mapContainer.style.height = '500px';
        }

        this.initMap();
        this.addSimpleMarkers();

        console.log('方言地图初始化完成');
    },

    // 初始化 Leaflet 地图
    initMap: function() {
        try {
            // 检查地图容器是否已经被初始化
            if (document.querySelector('#map-container .leaflet-container')) {
                console.log('地图容器已经被初始化，跳过');
                return;
            }

            // 创建地图实例，中心为中国，缩放级别 5
            this.map = L.map('map-container').setView([35, 105], 5);

            // 添加高德地图底图（国内访问稳定）
            L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
                subdomains: ['1', '2', '3', '4'],
                attribution: '&copy; 高德地图'
            }).addTo(this.map);

            console.log('地图初始化成功');
        } catch (error) {
            console.error('地图初始化失败:', error);
            document.getElementById('map-container').innerHTML =
                '<div style="text-align: center; padding: 50px; color: #666;">' +
                '<h3>地图加载失败</h3><p>请检查网络连接或刷新页面</p></div>';
        }
    },

    // 添加方言区域标记
    addSimpleMarkers: function() {
        if (!this.map) {
            console.error('地图未初始化，无法添加标记');
            return;
        }

        const self = this;

        this.regions.forEach((region) => {
            // 创建简单的标记
            const marker = L.marker(region.coords).addTo(this.map);

            // 添加简单的弹出信息
            marker.bindPopup(`<b>${region.name}</b><br>点击查看详情`);

            // 点击标记时，在下方详情面板展示该方言的信息
            marker.on('click', function() {
                self.showRegionDetails(region);
            });

            // 保存标记引用
            this.markers.push(marker);
        });

        console.log('添加了', this.regions.length, '个方言标记');
    },

    // 展示方言详情
    showRegionDetails: function(region) {
        const details = document.getElementById('map-details');
        if (!details || !region) {
            return;
        }

        this.currentRegion = region;

        const nameElement = document.getElementById('region-name');
        const infoElement = document.getElementById('region-info');
        const phrasesElement = document.getElementById('region-phrases');

        if (nameElement) {
            nameElement.textContent = region.name;
        }
        if (infoElement) {
            infoElement.textContent = region.info;
        }
        if (phrasesElement) {
            const phrases = this.getRegionPhrases(region);
            if (phrases.length > 0) {
                phrasesElement.innerHTML =
                    '<h4 style="font-family: var(--font-title); margin-bottom: 12px;">常用说法</h4>' +
                    '<ul style="list-style: none;">' +
                    phrases.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('') +
                    '</ul>';
                phrasesElement.style.display = 'block';
            } else {
                phrasesElement.innerHTML = '';
                phrasesElement.style.display = 'none';
            }
        }

        details.style.display = 'block';
        Utils.scrollToElement('map-details', 100);
    },

    // 隐藏方言详情面板（供 Esc 快捷键等外部调用）
    hideRegionDetails: function() {
        const details = document.getElementById('map-details');
        if (details) {
            details.style.display = 'none';
        }
        this.currentRegion = null;
    },

    // 复用 AI 方言陪练模块中已有的词汇数据，避免两处维护
    getRegionPhrases: function(region) {
        if (!region.phraseKey || typeof DialectTrainer === 'undefined') {
            return [];
        }

        const data = DialectTrainer.dialectPhrases && DialectTrainer.dialectPhrases[region.phraseKey];
        if (!data) {
            return [];
        }

        return Object.keys(data).map(function(key) {
            return data[key];
        });
    }
};