/**
 * 俄罗斯方块 - 音效管理模块
 * 处理游戏音效的加载、播放和控制
 */

window.AudioManager = (() => {
    'use strict';

    // 音效配置
    const SOUND_CONFIG = {
        enabled: true,
        volume: 0.7,
        sounds: {
            MOVE: { url: '', volume: 0.3 },
            ROTATE: { url: '', volume: 0.4 },
            DROP: { url: '', volume: 0.5 },
            CLEAR_SINGLE: { url: '', volume: 0.6 },
            CLEAR_DOUBLE: { url: '', volume: 0.7 },
            CLEAR_TRIPLE: { url: '', volume: 0.8 },
            CLEAR_TETRIS: { url: '', volume: 0.9 },
            LEVEL_UP: { url: '', volume: 0.8 },
            GAME_OVER: { url: '', volume: 0.8 },
            HOLD: { url: '', volume: 0.4 }
        }
    };

    // 音频上下文
    let audioContext = null;
    let masterGain = null;
    const soundBuffers = new Map();

    // ==================== 音效生成器 ====================
    // 由于我们没有实际的音效文件，使用Web Audio API生成基础音效
    class SoundGenerator {
        static createBeep(frequency, duration, type = 'sine') {
            if (!audioContext) return null;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(masterGain);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // 音量包络
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);

            return { oscillator, gainNode };
        }
    }

    // ==================== 音效定义 ====================
    const GENERATED_SOUNDS = {
        MOVE: () => SoundGenerator.createBeep(200, 0.05, 'square'),
        ROTATE: () => SoundGenerator.createBeep(300, 0.08, 'sine'),
        DROP: () => SoundGenerator.createBeep(100, 0.1, 'sawtooth'),
        CLEAR_SINGLE: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 简单的清除音效
            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 400 + i * 100;
                oscillator.type = 'triangle';

                gainNode.gain.setValueAtTime(0, now + i * 0.05);
                gainNode.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);

                oscillator.start(now + i * 0.05);
                oscillator.stop(now + i * 0.05 + 0.2);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        CLEAR_DOUBLE: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 双行清除音效
            for (let i = 0; i < 4; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 500 + i * 50;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, now + i * 0.03);
                gainNode.gain.linearRampToValueAtTime(0.25, now + i * 0.03 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.25);

                oscillator.start(now + i * 0.03);
                oscillator.stop(now + i * 0.03 + 0.25);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        CLEAR_TRIPLE: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 三行清除音效
            for (let i = 0; i < 5; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 600 + i * 40;
                oscillator.type = 'square';

                gainNode.gain.setValueAtTime(0, now + i * 0.02);
                gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.02 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.02 + 0.3);

                oscillator.start(now + i * 0.02);
                oscillator.stop(now + i * 0.02 + 0.3);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        CLEAR_TETRIS: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 四行清除音效（俄罗斯方块）
            for (let i = 0; i < 7; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 800 - i * 100;
                oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';

                gainNode.gain.setValueAtTime(0, now + i * 0.015);
                gainNode.gain.linearRampToValueAtTime(0.35, now + i * 0.015 + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.015 + 0.35);

                oscillator.start(now + i * 0.015);
                oscillator.stop(now + i * 0.015 + 0.35);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        LEVEL_UP: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 升级音效
            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 300 + i * 200;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, now + i * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.4, now + i * 0.1 + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

                oscillator.start(now + i * 0.1);
                oscillator.stop(now + i * 0.1 + 0.3);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        GAME_OVER: () => {
            const now = audioContext.currentTime;
            const sounds = [];
            // 游戏结束音效
            for (let i = 0; i < 5; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(masterGain);

                oscillator.frequency.value = 200 - i * 30;
                oscillator.type = 'sawtooth';

                gainNode.gain.setValueAtTime(0, now + i * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.5, now + i * 0.1 + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);

                oscillator.start(now + i * 0.1);
                oscillator.stop(now + i * 0.1 + 0.5);

                sounds.push({ oscillator, gainNode });
            }
            return sounds;
        },
        HOLD: () => SoundGenerator.createBeep(350, 0.1, 'sine')
    };

    // ==================== 音效管理器 ====================
    class AudioManager {
        constructor() {
            this.initialized = false;
            this.enabled = SOUND_CONFIG.enabled;
            this.volume = SOUND_CONFIG.volume;

            // 从本地存储加载设置
            this._loadSettings();
        }

        /**
         * 初始化音频系统
         * @returns {Promise} 初始化完成
         */
        async init() {
            if (this.initialized) return;

            try {
                // 创建音频上下文
                audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // 创建主音量节点
                masterGain = audioContext.createGain();
                masterGain.connect(audioContext.destination);
                masterGain.gain.value = this.enabled ? this.volume : 0;

                this.initialized = true;
                // console.log('音频系统初始化成功');
            } catch (error) {
                console.error('音频系统初始化失败:', error);
                this.enabled = false;
            }
        }

        /**
         * 播放音效
         * @param {string} soundName - 音效名称
         */
        play(soundName) {
            if (!this.enabled || !this.initialized || !audioContext) return;

            const soundFunc = GENERATED_SOUNDS[soundName];
            if (!soundFunc) {
                console.warn(`未知音效: ${soundName}`);
                return;
            }

            try {
                soundFunc();
            } catch (error) {
                console.error(`播放音效失败 ${soundName}:`, error);
            }
        }

        /**
         * 切换音效开关
         * @param {boolean} enabled - 是否启用
         */
        toggle(enabled = null) {
            this.enabled = enabled !== null ? enabled : !this.enabled;

            if (masterGain) {
                masterGain.gain.value = this.enabled ? this.volume : 0;
            }

            this._saveSettings();
            return this.enabled;
        }

        /**
         * 设置音量
         * @param {number} volume - 音量值 (0-1)
         */
        setVolume(volume) {
            this.volume = Math.max(0, Math.min(1, volume));

            if (masterGain && this.enabled) {
                masterGain.gain.value = this.volume;
            }

            this._saveSettings();
        }

        /**
         * 获取当前设置
         * @returns {Object} 音频设置
         */
        getSettings() {
            return {
                enabled: this.enabled,
                volume: this.volume
            };
        }

        /**
         * 从本地存储加载设置
         */
        _loadSettings() {
            try {
                const saved = localStorage.getItem('tetris_audio_settings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    this.enabled = settings.enabled !== undefined ? settings.enabled : this.enabled;
                    this.volume = settings.volume !== undefined ? settings.volume : this.volume;
                }
            } catch (error) {
                console.warn('加载音频设置失败:', error);
            }
        }

        /**
         * 保存设置到本地存储
         */
        _saveSettings() {
            try {
                const settings = {
                    enabled: this.enabled,
                    volume: this.volume,
                    timestamp: Date.now()
                };
                localStorage.setItem('tetris_audio_settings', JSON.stringify(settings));
            } catch (error) {
                console.warn('保存音频设置失败:', error);
            }
        }

        /**
         * 暂停音频上下文（节省资源）
         */
        suspend() {
            if (audioContext && audioContext.state === 'running') {
                audioContext.suspend();
            }
        }

        /**
         * 恢复音频上下文
         */
        resume() {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }

        /**
         * 销毁音频系统
         */
        destroy() {
            if (audioContext) {
                audioContext.close();
                audioContext = null;
                masterGain = null;
            }
            this.initialized = false;
        }
    }

    // ==================== 音效助手函数 ====================
    const SoundEffects = {
        // 方块移动音效
        playMove() {
            instance.play('MOVE');
        },

        // 方块旋转音效
        playRotate() {
            instance.play('ROTATE');
        },

        // 方块降落音效
        playDrop() {
            instance.play('DROP');
        },

        // 行清除音效
        playLineClear(lines) {
            switch (lines) {
                case 1:
                    instance.play('CLEAR_SINGLE');
                    break;
                case 2:
                    instance.play('CLEAR_DOUBLE');
                    break;
                case 3:
                    instance.play('CLEAR_TRIPLE');
                    break;
                case 4:
                    instance.play('CLEAR_TETRIS');
                    break;
                default:
                    instance.play('CLEAR_SINGLE');
            }
        },

        // 升级音效
        playLevelUp() {
            instance.play('LEVEL_UP');
        },

        // 游戏结束音效
        playGameOver() {
            instance.play('GAME_OVER');
        },

        // 保持方块音效
        playHold() {
            instance.play('HOLD');
        }
    };

    // ==================== 创建单例实例 ====================
    const instance = new AudioManager();

    // ==================== 公共API ====================
    return {
        // 音效管理器
        AudioManager: instance,

        // 音效助手
        SoundEffects,

        // 工具函数
        init: () => instance.init(),
        toggle: (enabled) => instance.toggle(enabled),
        setVolume: (volume) => instance.setVolume(volume),
        getSettings: () => instance.getSettings(),

        // 音效播放快捷方式
        playMove: () => SoundEffects.playMove(),
        playRotate: () => SoundEffects.playRotate(),
        playDrop: () => SoundEffects.playDrop(),
        playLineClear: (lines) => SoundEffects.playLineClear(lines),
        playLevelUp: () => SoundEffects.playLevelUp(),
        playGameOver: () => SoundEffects.playGameOver(),
        playHold: () => SoundEffects.playHold(),

        // 生命周期管理
        suspend: () => instance.suspend(),
        resume: () => instance.resume(),
        destroy: () => instance.destroy()
    };

})();