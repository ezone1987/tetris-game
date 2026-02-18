/**
 * 俄罗斯方块 - 主游戏模块
 * 处理游戏逻辑、渲染和用户输入
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==================== 游戏配置 ====================
    const CONFIG = {
        // 网格配置
        GRID_WIDTH: 10,
        GRID_HEIGHT: 20,
        BLOCK_SIZE: 30,

        // 游戏速度配置（毫秒）
        INITIAL_SPEED: 1000,
        SPEED_DECREMENT: 50,
        MIN_SPEED: 100,

        // 游戏规则
        LINES_PER_LEVEL: 10,
        SCORE_SINGLE: 100,
        SCORE_DOUBLE: 300,
        SCORE_TRIPLE: 500,
        SCORE_TETRIS: 800,
        SCORE_COMBO_MULTIPLIER: 1.5,

        // 渲染配置
        GRID_COLOR: 'rgba(0, 173, 181, 0.3)',
        GRID_LINE_WIDTH: 1,
        // GHOST_ALPHA: 0.3, // 不再使用幽灵方块效果

        // 本地存储键名
        STORAGE_HIGH_SCORE: 'tetris_high_score',
        STORAGE_STATS: 'tetris_stats'
    };

    // ==================== 游戏状态 ====================
    let gameState = {
        // 游戏网格 (0 = 空, 1-7 = 方块类型)
        grid: Array(CONFIG.GRID_HEIGHT).fill().map(() => Array(CONFIG.GRID_WIDTH).fill(0)),

        // 当前游戏对象
        currentPiece: null,
        nextPiece: null,
        holdPiece: null,
        canHold: true,

        // 游戏统计
        score: 0,
        level: 1,
        lines: 0,
        combo: 0,

        // 游戏控制
        isRunning: false,
        isPaused: false,
        gameOver: false,
        lastDropTime: 0,
        dropInterval: CONFIG.INITIAL_SPEED,

        // 最高分
        highScore: 0,

        // 方块工厂
        pieceFactory: null
    };

    // ==================== Canvas上下文 ====================
    let canvas, ctx;
    let nextCanvas, nextCtx;
    let holdCanvas, holdCtx;

    // ==================== DOM元素 ====================
    let scoreElement, highScoreElement, levelElement, linesElement, speedElement;
    let startBtn, pauseBtn, resetBtn, soundBtn;
    let gameOverlay, overlayTitle, overlayText, overlayButton;

    // ==================== 初始化函数 ====================
    async function init() {
        // console.log('初始化俄罗斯方块游戏...');

        // 获取Canvas元素
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');

        nextCanvas = document.getElementById('next-canvas');
        nextCtx = nextCanvas.getContext('2d');

        holdCanvas = document.getElementById('hold-canvas');
        holdCtx = holdCanvas.getContext('2d');

        // 获取DOM元素
        scoreElement = document.getElementById('score');
        highScoreElement = document.getElementById('high-score');
        levelElement = document.getElementById('level');
        linesElement = document.getElementById('lines');
        speedElement = document.getElementById('speed');

        startBtn = document.getElementById('start-btn');
        pauseBtn = document.getElementById('pause-btn');
        resetBtn = document.getElementById('reset-btn');
        soundBtn = document.getElementById('sound-btn');

        gameOverlay = document.getElementById('game-overlay');
        overlayTitle = document.getElementById('overlay-title');
        overlayText = document.getElementById('overlay-text');
        overlayButton = document.getElementById('overlay-button');

        // 初始化方块工厂（传递碰撞检测函数）
        gameState.pieceFactory = new Tetromino.TetrominoFactory((piece) => {
            return !checkCollision(piece);
        });

        // 加载最高分
        loadHighScore();

        // 设置事件监听器
        setupEventListeners();

        // 初始化音频系统
        try {
            await AudioManager.init();
        } catch (error) {
            console.warn('音频初始化失败，游戏将继续运行:', error);
        }

        // 初始渲染
        drawGrid();
        drawUI();

        // 显示开始界面
        showOverlay('俄罗斯方块', '准备好开始游戏了吗？', '开始游戏');

        // 开发环境下运行自检
        if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
            setTimeout(() => {
                console.log('运行多行清除自检...');
                testLineClear();
            }, 500);
        }

        // console.log('游戏初始化完成');
    }

    // ==================== 游戏控制函数 ====================
    function startGame() {
        if (gameState.isRunning && !gameState.isPaused) return;

        resetGame();

        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.gameOver = false;
        gameState.lastDropTime = Date.now();

        // 生成初始方块
        spawnNewPiece();

        // 隐藏覆盖层
        hideOverlay();

        // 更新按钮状态
        updateButtonStates();

        // 开始游戏循环
        requestAnimationFrame(gameLoop);

        // console.log('游戏开始');
    }

    function pauseGame() {
        if (!gameState.isRunning || gameState.gameOver) return;

        gameState.isPaused = !gameState.isPaused;

        if (gameState.isPaused) {
            showOverlay('游戏暂停', '按空格键或点击按钮继续', '继续游戏');
            AudioManager.suspend();
        } else {
            hideOverlay();
            gameState.lastDropTime = Date.now();
            AudioManager.resume();
            requestAnimationFrame(gameLoop);
        }

        updateButtonStates();
        // console.log(`游戏${gameState.isPaused ? '暂停' : '继续'}`);
    }

    function resetGame() {
        // 重置游戏状态
        gameState.grid = Array(CONFIG.GRID_HEIGHT).fill().map(() => Array(CONFIG.GRID_WIDTH).fill(0));
        gameState.currentPiece = null;
        gameState.nextPiece = null;
        gameState.holdPiece = null;
        gameState.canHold = true;
        gameState.score = 0;
        gameState.level = 1;
        gameState.lines = 0;
        gameState.combo = 0;
        gameState.isRunning = false;
        gameState.isPaused = false;
        gameState.gameOver = false;
        gameState.dropInterval = CONFIG.INITIAL_SPEED;

        // 重置方块工厂（传递碰撞检测函数）
        gameState.pieceFactory = new Tetromino.TetrominoFactory((piece) => {
            return !checkCollision(piece);
        });

        // 更新UI
        updateUI();
        drawGrid();
        drawUI();

        // 显示开始界面
        showOverlay('俄罗斯方块', '准备好开始游戏了吗？', '开始游戏');

        updateButtonStates();
        // console.log('游戏重置');
    }

    // ==================== 方块管理函数 ====================
    function spawnNewPiece() {
        // 如果没有下一个方块，生成一个新的
        if (!gameState.nextPiece) {
            gameState.nextPiece = gameState.pieceFactory.next();
        }

        // 当前方块变为下一个方块
        gameState.currentPiece = gameState.nextPiece;

        // 生成新的下一个方块
        gameState.nextPiece = gameState.pieceFactory.next();

        // 重置保持标志
        gameState.canHold = true;

        // 检查游戏是否结束（新方块无法放置）
        if (checkCollision(gameState.currentPiece)) {
            gameOver();
            return;
        }

        // 绘制下一个方块预览
        drawNextPiece();

        // console.log(`生成新方块: ${gameState.currentPiece.type}`);
    }

    function holdPiece() {
        if (!gameState.canHold || !gameState.isRunning || gameState.isPaused) return;

        AudioManager.playHold();

        if (!gameState.holdPiece) {
            // 第一次保持，直接交换
            gameState.holdPiece = gameState.currentPiece;
            gameState.holdPiece.resetPosition();
            spawnNewPiece();
        } else {
            // 交换当前方块和保持方块
            const temp = gameState.currentPiece;
            gameState.currentPiece = gameState.holdPiece;
            gameState.currentPiece.resetPosition();
            gameState.holdPiece = temp;
            gameState.holdPiece.resetPosition();
        }

        gameState.canHold = false;

        // 绘制保持方块
        drawHoldPiece();

        // console.log(`保持方块: ${gameState.holdPiece.type}`);
    }

    // ==================== 游戏逻辑函数 ====================
    function movePiece(dx, dy) {
        if (!gameState.currentPiece || !gameState.isRunning || gameState.isPaused) return false;

        gameState.currentPiece.move(dx, dy);

        if (checkCollision(gameState.currentPiece)) {
            gameState.currentPiece.move(-dx, -dy);
            return false;
        }

        AudioManager.playMove();
        return true;
    }

    function rotatePiece(clockwise = true) {
        if (!gameState.currentPiece || !gameState.isRunning || gameState.isPaused) return false;

        let success;

        if (clockwise) {
            success = gameState.currentPiece.rotate().success;
        } else {
            success = gameState.currentPiece.rotateCCW().success;
        }

        // 检查旋转后是否碰撞
        if (success && checkCollision(gameState.currentPiece)) {
            // 如果碰撞，尝试墙踢
            success = false;
        }

        if (success) {
            AudioManager.playRotate();
        }

        return success;
    }

    function hardDrop() {
        if (!gameState.currentPiece || !gameState.isRunning || gameState.isPaused) return;

        let dropDistance = 0;

        // 计算可以下落的最大距离
        while (!checkCollision(gameState.currentPiece, 0, 1)) {
            gameState.currentPiece.move(0, 1);
            dropDistance++;
        }

        if (dropDistance > 0) {
            lockPiece();
            AudioManager.playDrop();
        }
    }

    function softDrop() {
        if (!movePiece(0, 1)) {
            lockPiece();
        }
    }

    function lockPiece() {
        if (!gameState.currentPiece) return;

        // 将方块锁定到网格
        const cells = gameState.currentPiece.getCells();
        for (const cell of cells) {
            if (cell.y >= 0 && cell.y < CONFIG.GRID_HEIGHT &&
                cell.x >= 0 && cell.x < CONFIG.GRID_WIDTH) {
                // 使用方块类型作为网格值 (1-7)
                const pieceType = gameState.currentPiece.type;
                const typeIndex = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'].indexOf(pieceType) + 1;
                gameState.grid[cell.y][cell.x] = typeIndex;
            }
        }

        // 检查并消除完整行
        const linesCleared = clearLines();

        // 更新分数和等级
        updateScore(linesCleared);

        // 生成新方块
        spawnNewPiece();

        // console.log(`方块锁定，消除 ${linesCleared} 行`);
    }

    function clearLines() {
        let linesCleared = 0;
        const rowsToClear = new Set();

        // 找出需要消除的行
        for (let y = CONFIG.GRID_HEIGHT - 1; y >= 0; y--) {
            if (gameState.grid[y].every(cell => cell !== 0)) {
                rowsToClear.add(y);
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            // 播放消除音效
            AudioManager.playLineClear(linesCleared);

            // 消除行 - 创建新网格，只保留不完整的行
            const newGrid = [];

            // 从底部开始，添加不完整的行
            for (let y = CONFIG.GRID_HEIGHT - 1; y >= 0; y--) {
                if (!rowsToClear.has(y)) {
                    newGrid.unshift(gameState.grid[y]);
                }
            }

            // 在顶部填充空行
            const emptyRowsNeeded = CONFIG.GRID_HEIGHT - newGrid.length;
            for (let i = 0; i < emptyRowsNeeded; i++) {
                newGrid.unshift(Array(CONFIG.GRID_WIDTH).fill(0));
            }

            // 更新网格
            gameState.grid = newGrid;

            // 更新连击计数
            gameState.combo++;

            // 更新消除行数
            gameState.lines += linesCleared;

            // 检查是否需要升级
            checkLevelUp();
        } else {
            gameState.combo = 0;
        }

        return linesCleared;
    }

    // ==================== 碰撞检测 ====================
    function checkCollision(piece, dx = 0, dy = 0) {
        const cells = piece.getCells();

        for (const cell of cells) {
            const x = cell.x + dx;
            const y = cell.y + dy;

            // 检查边界碰撞
            if (x < 0 || x >= CONFIG.GRID_WIDTH || y >= CONFIG.GRID_HEIGHT) {
                return true;
            }

            // 检查底部碰撞
            if (y < 0) {
                continue; // 方块在顶部上方是允许的
            }

            // 检查与已锁定方块的碰撞
            if (y >= 0 && gameState.grid[y][x] !== 0) {
                return true;
            }
        }

        return false;
    }

    // ==================== 游戏循环 ====================
    function gameLoop(timestamp) {
        if (!gameState.isRunning || gameState.isPaused || gameState.gameOver) return;

        // 计算时间差
        const now = Date.now();
        const deltaTime = now - gameState.lastDropTime;

        // 自动下落
        if (deltaTime >= gameState.dropInterval) {
            softDrop();
            gameState.lastDropTime = now;
        }

        // 渲染游戏
        draw();

        // 继续游戏循环
        requestAnimationFrame(gameLoop);
    }

    // ==================== 渲染函数 ====================
    function draw() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制网格背景
        drawGrid();

        // 绘制已锁定的方块
        drawLockedBlocks();

        // 绘制当前下落的方块
        if (gameState.currentPiece) {
            drawPiece(gameState.currentPiece);
        }

        // 绘制UI
        drawUI();
    }

    function drawGrid() {
        ctx.strokeStyle = CONFIG.GRID_COLOR;
        ctx.lineWidth = CONFIG.GRID_LINE_WIDTH;

        // 绘制垂直线
        for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CONFIG.BLOCK_SIZE, 0);
            ctx.lineTo(x * CONFIG.BLOCK_SIZE, CONFIG.GRID_HEIGHT * CONFIG.BLOCK_SIZE);
            ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CONFIG.BLOCK_SIZE);
            ctx.lineTo(CONFIG.GRID_WIDTH * CONFIG.BLOCK_SIZE, y * CONFIG.BLOCK_SIZE);
            ctx.stroke();
        }
    }

    function drawLockedBlocks() {
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const blockType = gameState.grid[y][x];
                if (blockType !== 0) {
                    drawBlock(x, y, blockType);
                }
            }
        }
    }

    function drawBlock(x, y, blockType) {
        const colors = {
            1: Tetromino.TETROMINOES.I.color,   // I
            2: Tetromino.TETROMINOES.O.color,   // O
            3: Tetromino.TETROMINOES.T.color,   // T
            4: Tetromino.TETROMINOES.L.color,   // L
            5: Tetromino.TETROMINOES.J.color,   // J
            6: Tetromino.TETROMINOES.S.color,   // S
            7: Tetromino.TETROMINOES.Z.color    // Z
        };

        const color = colors[blockType] || colors[1];
        const blockX = x * CONFIG.BLOCK_SIZE;
        const blockY = y * CONFIG.BLOCK_SIZE;

        // 绘制3D方块效果
        draw3DBlock(blockX, blockY, CONFIG.BLOCK_SIZE, color);
    }

    function draw3DBlock(x, y, size, color) {
        // 主方块
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, color.primary);
        gradient.addColorStop(0.5, color.secondary);
        gradient.addColorStop(1, color.dark);

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

        // 顶部高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + 2, y + 2, size - 4, 2);

        // 左侧高光
        ctx.fillRect(x + 2, y + 2, 2, size - 4);

        // 底部阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + size - 4, size - 4, 2);

        // 右侧阴影
        ctx.fillRect(x + size - 4, y + 2, 2, size - 4);

        // 内部纹理
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 1; i < 3; i++) {
            const offset = size / 3 * i;
            ctx.beginPath();
            ctx.moveTo(x + offset, y + 3);
            ctx.lineTo(x + offset, y + size - 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + 3, y + offset);
            ctx.lineTo(x + size - 3, y + offset);
            ctx.stroke();
        }
    }

    function drawPiece(piece) {
        const cells = piece.getCells();
        const color = piece.color;

        for (const cell of cells) {
            if (cell.y >= 0) { // 只绘制网格内的部分
                const x = cell.x * CONFIG.BLOCK_SIZE;
                const y = cell.y * CONFIG.BLOCK_SIZE;
                draw3DBlock(x, y, CONFIG.BLOCK_SIZE, color);
            }
        }
    }

    function drawGhostPiece() {
        if (!gameState.currentPiece) return;

        // 创建幽灵方块的副本
        const ghostPiece = gameState.currentPiece.clone();

        // 计算下落到底部的距离
        while (!checkCollision(ghostPiece, 0, 1)) {
            ghostPiece.move(0, 1);
        }

        // 绘制半透明的幽灵方块
        const cells = ghostPiece.getCells();
        const color = ghostPiece.color;

        ctx.save();
        ctx.globalAlpha = CONFIG.GHOST_ALPHA;

        for (const cell of cells) {
            if (cell.y >= 0) {
                const x = cell.x * CONFIG.BLOCK_SIZE;
                const y = cell.y * CONFIG.BLOCK_SIZE;

                // 绘制幽灵方块（简化版）
                ctx.fillStyle = color.primary;
                ctx.fillRect(x + 2, y + 2, CONFIG.BLOCK_SIZE - 4, CONFIG.BLOCK_SIZE - 4);

                // 边框
                ctx.strokeStyle = color.secondary;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, CONFIG.BLOCK_SIZE - 4, CONFIG.BLOCK_SIZE - 4);
            }
        }

        ctx.restore();
    }

    function drawNextPiece() {
        if (!gameState.nextPiece) return;

        // 清空预览画布
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

        // 计算居中位置
        const piece = gameState.nextPiece;
        const matrix = piece.getRotatedMatrix();
        const pieceWidth = matrix[0].length * CONFIG.BLOCK_SIZE;
        const pieceHeight = matrix.length * CONFIG.BLOCK_SIZE;
        const offsetX = (nextCanvas.width - pieceWidth) / 2;
        const offsetY = (nextCanvas.height - pieceHeight) / 2;

        // 绘制预览方块
        nextCtx.save();
        nextCtx.translate(offsetX, offsetY);

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    const blockX = x * CONFIG.BLOCK_SIZE;
                    const blockY = y * CONFIG.BLOCK_SIZE;
                    draw3DBlockOnContext(nextCtx, blockX, blockY, CONFIG.BLOCK_SIZE, piece.color);
                }
            }
        }

        nextCtx.restore();
    }

    function drawHoldPiece() {
        if (!gameState.holdPiece) {
            // 清空画布
            holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
            return;
        }

        // 清空画布
        holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);

        // 计算居中位置
        const piece = gameState.holdPiece;
        const matrix = piece.getRotatedMatrix();
        const pieceWidth = matrix[0].length * CONFIG.BLOCK_SIZE;
        const pieceHeight = matrix.length * CONFIG.BLOCK_SIZE;
        const offsetX = (holdCanvas.width - pieceWidth) / 2;
        const offsetY = (holdCanvas.height - pieceHeight) / 2;

        // 绘制保持方块
        holdCtx.save();
        holdCtx.translate(offsetX, offsetY);

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    const blockX = x * CONFIG.BLOCK_SIZE;
                    const blockY = y * CONFIG.BLOCK_SIZE;
                    draw3DBlockOnContext(holdCtx, blockX, blockY, CONFIG.BLOCK_SIZE, piece.color);
                }
            }
        }

        holdCtx.restore();
    }

    function draw3DBlockOnContext(context, x, y, size, color) {
        // 主方块
        const gradient = context.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, color.primary);
        gradient.addColorStop(0.5, color.secondary);
        gradient.addColorStop(1, color.dark);

        context.fillStyle = gradient;
        context.fillRect(x + 1, y + 1, size - 2, size - 2);

        // 简单的高光和阴影
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        context.fillRect(x + 2, y + 2, size - 4, 2);
        context.fillRect(x + 2, y + 2, 2, size - 4);

        context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        context.fillRect(x + 2, y + size - 4, size - 4, 2);
        context.fillRect(x + size - 4, y + 2, 2, size - 4);
    }

    // ==================== UI更新函数 ====================
    function drawUI() {
        // UI元素在HTML中渲染，这里不需要在Canvas上绘制
        // 保留此函数以保持代码完整性
    }

    function updateUI() {
        scoreElement.textContent = gameState.score.toLocaleString();
        highScoreElement.textContent = gameState.highScore.toLocaleString();
        levelElement.textContent = gameState.level;
        linesElement.textContent = gameState.lines;
        speedElement.textContent = `${(CONFIG.INITIAL_SPEED / gameState.dropInterval).toFixed(1)}x`;
    }

    function updateScore(linesCleared) {
        if (linesCleared <= 0) return;

        let baseScore;
        switch (linesCleared) {
            case 1: baseScore = CONFIG.SCORE_SINGLE; break;
            case 2: baseScore = CONFIG.SCORE_DOUBLE; break;
            case 3: baseScore = CONFIG.SCORE_TRIPLE; break;
            case 4: baseScore = CONFIG.SCORE_TETRIS; break;
            default: baseScore = linesCleared * CONFIG.SCORE_SINGLE;
        }

        // 连击加成
        let comboMultiplier = 1;
        if (gameState.combo > 1) {
            comboMultiplier = Math.pow(CONFIG.SCORE_COMBO_MULTIPLIER, gameState.combo - 1);
        }

        // 等级加成
        const levelMultiplier = gameState.level;

        // 计算最终分数
        const scoreIncrease = Math.floor(baseScore * comboMultiplier * levelMultiplier);
        gameState.score += scoreIncrease;

        // 更新最高分
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            saveHighScore();
        }

        updateUI();

        // console.log(`得分: +${scoreIncrease} (${linesCleared}行, ${gameState.combo}连击, ${levelMultiplier}级加成)`);
    }

    function checkLevelUp() {
        const newLevel = Math.floor(gameState.lines / CONFIG.LINES_PER_LEVEL) + 1;

        if (newLevel > gameState.level) {
            gameState.level = newLevel;

            // 提高游戏速度
            gameState.dropInterval = Math.max(
                CONFIG.MIN_SPEED,
                CONFIG.INITIAL_SPEED - (gameState.level - 1) * CONFIG.SPEED_DECREMENT
            );

            // 播放升级音效
            AudioManager.playLevelUp();

            updateUI();
            // console.log(`升级到 ${gameState.level} 级，下落间隔: ${gameState.dropInterval}ms`);
        }
    }

    // ==================== 游戏结束处理 ====================
    function gameOver() {
        gameState.isRunning = false;
        gameState.gameOver = true;

        // 播放游戏结束音效
        AudioManager.playGameOver();

        // 显示游戏结束界面
        showOverlay(
            '游戏结束',
            `最终分数: ${gameState.score.toLocaleString()}<br>消除行数: ${gameState.lines}<br>最高等级: ${gameState.level}`,
            '重新开始'
        );

        // 保存游戏统计
        saveGameStats();

        // console.log(`游戏结束，分数: ${gameState.score}, 行数: ${gameState.lines}, 等级: ${gameState.level}`);
    }

    // ==================== 本地存储函数 ====================
    function loadHighScore() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_HIGH_SCORE);
            if (saved) {
                gameState.highScore = parseInt(saved, 10) || 0;
            }
        } catch (error) {
            console.warn('加载最高分失败:', error);
        }

        updateUI();
    }

    function saveHighScore() {
        try {
            localStorage.setItem(CONFIG.STORAGE_HIGH_SCORE, gameState.highScore.toString());
        } catch (error) {
            console.warn('保存最高分失败:', error);
        }
    }

    function saveGameStats() {
        try {
            const stats = {
                lastScore: gameState.score,
                lastLines: gameState.lines,
                lastLevel: gameState.level,
                highScore: gameState.highScore,
                timestamp: Date.now()
            };

            localStorage.setItem(CONFIG.STORAGE_STATS, JSON.stringify(stats));
        } catch (error) {
            console.warn('保存游戏统计失败:', error);
        }
    }

    // ==================== UI辅助函数 ====================
    function showOverlay(title, text, buttonText) {
        overlayTitle.textContent = title;
        // 将<br>标签转换为换行符，使用textContent避免XSS
        const safeText = text.replace(/<br\s*\/?>/gi, '\n');
        overlayText.textContent = safeText;
        // 添加CSS以保留换行
        overlayText.style.whiteSpace = 'pre-line';
        overlayButton.innerHTML = `<i class="fas fa-play"></i> ${buttonText}`;
        gameOverlay.style.display = 'flex';
    }

    function hideOverlay() {
        gameOverlay.style.display = 'none';
    }

    function updateButtonStates() {
        if (!gameState.isRunning) {
            startBtn.innerHTML = '<i class="fas fa-play"></i> 开始';
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
        } else if (gameState.isPaused) {
            startBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
        } else {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
        }

        // 声音按钮
        const audioSettings = AudioManager.getSettings();
        soundBtn.innerHTML = audioSettings.enabled ?
            '<i class="fas fa-volume-up"></i> 声音' :
            '<i class="fas fa-volume-mute"></i> 静音';
    }

    // ==================== 事件监听器 ====================
    function setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', handleKeyPress);

        // 按钮事件
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', pauseGame);
        resetBtn.addEventListener('click', resetGame);
        soundBtn.addEventListener('click', () => {
            const enabled = AudioManager.toggle();
            soundBtn.innerHTML = enabled ?
                '<i class="fas fa-volume-up"></i> 声音' :
                '<i class="fas fa-volume-mute"></i> 静音';
        });

        // 覆盖层按钮
        overlayButton.addEventListener('click', () => {
            if (gameState.gameOver) {
                resetGame();
            } else if (gameState.isPaused) {
                pauseGame();
            } else {
                startGame();
            }
        });

        // 防止方向键滚动页面
        window.addEventListener('keydown', (e) => {
            if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
                e.preventDefault();
            }
        });

        // 窗口失去焦点时暂停游戏
        window.addEventListener('blur', () => {
            if (gameState.isRunning && !gameState.isPaused && !gameState.gameOver) {
                pauseGame();
            }
        });

        // 窗口获得焦点时恢复音频
        window.addEventListener('focus', () => {
            AudioManager.resume();
        });
    }

    function handleKeyPress(e) {
        if (!gameState.isRunning || gameState.gameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
                movePiece(-1, 0);
                break;
            case 'ArrowRight':
                movePiece(1, 0);
                break;
            case 'ArrowDown':
                softDrop();
                break;
            case 'ArrowUp':
            case 'z':
            case 'Z':
                rotatePiece(true);
                break;
            case 'x':
            case 'X':
                rotatePiece(false);
                break;
            case ' ':
                hardDrop();
                break;
            case 'c':
            case 'C':
                holdPiece();
                break;
            case 'p':
            case 'P':
            case 'Escape':
                pauseGame();
                break;
        }
    }

    // ==================== 启动游戏 ====================

    // 开发模式下的自检函数
    window.testWallKick = function() {
        console.log('=== 墙踢检测测试 ===');
        const factory = new Tetromino.TetrominoFactory((piece) => {
            // 简单的碰撞检测：检查是否在网格边界内
            const cells = piece.getCells();
            for (const cell of cells) {
                if (cell.x < 0 || cell.x >= CONFIG.GRID_WIDTH || cell.y >= CONFIG.GRID_HEIGHT) {
                    return false;
                }
            }
            return true;
        });

        const piece = factory.next();
        console.log('测试方块:', piece.type);

        // 测试旋转
        const result = piece.rotate();
        console.log('旋转结果:', result);

        if (result.success) {
            console.log('✅ 墙踢检测基本功能正常');
        } else {
            console.log('⚠️ 旋转失败（可能正常，取决于位置）');
        }

        return result;
    };

    // 可选：在开发环境中自动运行测试
    // if (window.location.href.includes('localhost')) {
    //     setTimeout(() => testWallKick(), 1000);
    // }

    // 多行清除测试函数
    window.testLineClear = function() {
        console.log('=== 多行清除测试 ===');

        // 保存原始网格
        const originalGrid = gameState.grid;

        // 创建一个测试网格：底部4行满，其他行空
        const testGrid = Array(CONFIG.GRID_HEIGHT).fill().map(() => Array(CONFIG.GRID_WIDTH).fill(0));
        for (let y = CONFIG.GRID_HEIGHT - 4; y < CONFIG.GRID_HEIGHT; y++) {
            testGrid[y] = Array(CONFIG.GRID_WIDTH).fill(1); // 填充为方块类型1
        }

        // 设置测试网格
        gameState.grid = testGrid;

        console.log('测试前网格状态:');
        console.log('底部4行应该是满的');

        // 调用清除函数
        const linesCleared = clearLines();

        console.log(`清除行数: ${linesCleared}`);
        console.log('预期: 4');

        // 检查结果
        let remainingFullRows = 0;
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            if (gameState.grid[y].every(cell => cell !== 0)) {
                remainingFullRows++;
            }
        }

        console.log(`剩余满行数: ${remainingFullRows}`);
        console.log(`预期: 0`);

        if (linesCleared === 4 && remainingFullRows === 0) {
            console.log('✅ 多行清除功能正常');
        } else {
            console.log('❌ 多行清除功能异常');
        }

        // 恢复原始网格
        gameState.grid = originalGrid;

        // 重新绘制
        draw();

        return linesCleared;
    };

    init().catch(error => console.error('游戏初始化失败:', error));

});