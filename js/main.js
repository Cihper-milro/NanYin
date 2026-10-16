// 主应用程序模块
const App = {
    // 初始化应用程序
    init: function() {
        this.initNavigation();
        this.initModules();
        this.bindGlobalEvents();
    },

    // 初始化导航
    initNavigation: function() {
        // 平滑滚动到锚点
        document.querySelectorAll('nav a, .btn[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    
                    if (targetId === '') {
                        // 首页链接
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        Utils.scrollToElement(targetId);
                    }
                    
                    // 更新活动导航项
                    document.querySelectorAll('nav a').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });

        // 滚动时更新活动导航项
        window.addEventListener('scroll', Utils.debounce(() => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    document.querySelectorAll('nav a').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100));
    },

    // 初始化各功能模块
    initModules: function() {
        // 方言地图改为懒初始化：Leaflet 有 144KB，且一初始化就会立刻请求十几张地图瓦片，
        // 放在首屏一起加载会明显拖慢开场画面，因此改到滚动到地图附近时再初始化（见 lazyInitMap）。
        this.lazyInitMap();
        
        // 初始化其他模块
        this.safeInit('DialectTrainer', DialectTrainer);
        this.safeInit('PoetryReciter', PoetryReciter);
        this.safeInit('StoryHouse', StoryHouse);
        this.safeInit('AudioPlayer', AudioPlayer);
        
        console.log('所有模块初始化完成');
    },

    // 方言地图懒初始化：滚动到地图附近（提前 400px）才开始加载
    lazyInitMap: function() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) {
            return;
        }

        if (!('IntersectionObserver' in window)) {
            this.ensureMapInit();
            return;
        }

        const self = this;
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    self.ensureMapInit();
                }
            });
        }, { rootMargin: '400px 0px' });

        observer.observe(mapContainer);
    },

    // 真正初始化地图，重复调用只生效一次
    ensureMapInit: function() {
        if (this.mapInitialized) {
            return;
        }
        this.mapInitialized = true;
        this.safeInit('DialectMap', DialectMap);
    },

    // 单个模块初始化失败时只记录日志，不影响其他模块
    safeInit: function(name, module) {
        try {
            module.init();
        } catch (error) {
            console.error(name + ' 初始化失败:', error);
        }
    },

    // 绑定全局事件
    bindGlobalEvents: function() {
        // 窗口大小变化时调整地图
        window.addEventListener('resize', Utils.debounce(() => {
            if (DialectMap.map) {
                setTimeout(() => {
                    DialectMap.map.invalidateSize();
                }, 200);
            }
        }, 250));

        // 页面加载完成后的初始化
        window.addEventListener('load', () => {
            Utils.showMessage('方言文化学习平台加载完成！', 'success');
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Alt+1 跳转到AI方言陪练
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                Utils.scrollToElement('dialect');
            }
            // Alt+2 跳转到方言地图
            else if (e.altKey && e.key === '2') {
                e.preventDefault();
                Utils.scrollToElement('map');
                // 地图已改为懒加载：这里补一次初始化，并等标记就绪后高亮第一个方言区域
                this.ensureMapInit();
                let mapTries = 0;
                const mapTimer = setInterval(() => {
                    if (DialectMap.markers && DialectMap.markers.length > 0) {
                        DialectMap.markers[0].openPopup();
                        clearInterval(mapTimer);
                    } else if (++mapTries > 20) {
                        clearInterval(mapTimer);
                    }
                }, 200);
            }
            // Esc 隐藏地图详情
            else if (e.key === 'Escape') {
                if (DialectMap.currentRegion) {
                    DialectMap.hideRegionDetails();
                }
            }
        });
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});