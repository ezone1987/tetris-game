/**
 * 俄罗斯方块 - 方块模块
 * 实现7种经典俄罗斯方块的形状、旋转和移动逻辑
 * 使用SRS（Super Rotation System）标准旋转系统
 */

window.Tetromino = (() => {
    'use strict';

    // ==================== 方块定义 ====================
    // 7种经典俄罗斯方块：I, O, T, L, J, S, Z
    // 每种方块使用4×4矩阵表示，1表示有方块，0表示空
    const TETROMINOES = {
        I: {
            name: 'I',
            color: { primary: '#00f5ff', secondary: '#00bcd4', dark: '#0097a7' },
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            rotations: 2, // I方块有2个旋转状态
            spawnOffset: { x: 3, y: 0 } // 生成时的偏移量
        },
        O: {
            name: 'O',
            color: { primary: '#ffff00', secondary: '#ffeb3b', dark: '#fbc02d' },
            shape: [
                [1, 1],
                [1, 1]
            ],
            rotations: 1, // O方块只有1个旋转状态
            spawnOffset: { x: 4, y: 0 }
        },
        T: {
            name: 'T',
            color: { primary: '#9c27b0', secondary: '#ba68c8', dark: '#7b1fa2' },
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            rotations: 4,
            spawnOffset: { x: 3, y: 0 }
        },
        L: {
            name: 'L',
            color: { primary: '#ff9800', secondary: '#ffb74d', dark: '#f57c00' },
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            rotations: 4,
            spawnOffset: { x: 3, y: 0 }
        },
        J: {
            name: 'J',
            color: { primary: '#2196f3', secondary: '#64b5f6', dark: '#1976d2' },
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            rotations: 4,
            spawnOffset: { x: 3, y: 0 }
        },
        S: {
            name: 'S',
            color: { primary: '#4caf50', secondary: '#81c784', dark: '#388e3c' },
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            rotations: 2,
            spawnOffset: { x: 3, y: 0 }
        },
        Z: {
            name: 'Z',
            color: { primary: '#f44336', secondary: '#e57373', dark: '#d32f2f' },
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            rotations: 2,
            spawnOffset: { x: 3, y: 0 }
        }
    };

    // ==================== SRS旋转系统 - 墙踢表 ====================
    // 参考：https://tetris.wiki/Super_Rotation_System
    const WALL_KICK_DATA = {
        JLSTZ: [
            // 0->R (从初始状态向右旋转)
            [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
            // R->2 (从右旋转状态向下旋转)
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
            // 2->L (从下旋转状态向左旋转)
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
            // L->0 (从左旋转状态回初始状态)
            [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }]
        ],
        I: [
            // I方块的墙踢表
            // 0->R
            [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
            // R->2
            [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
            // 2->L
            [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
            // L->0
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }]
        ],
        O: [
            // O方块不需要墙踢（旋转后位置不变）
            [{ x: 0, y: 0 }],
            [{ x: 0, y: 0 }],
            [{ x: 0, y: 0 }],
            [{ x: 0, y: 0 }]
        ]
    };

    // ==================== 方块类 ====================
    class TetrominoPiece {
        constructor(type) {
            this.type = type;
            this.data = TETROMINOES[type];
            this.matrix = this._copyMatrix(this.data.shape);
            this.rotation = 0; // 当前旋转状态 (0-3)
            this.position = { x: this.data.spawnOffset.x, y: this.data.spawnOffset.y };
            this.color = this.data.color;
        }

        /**
         * 复制矩阵（深拷贝）
         * @param {Array} matrix - 要复制的矩阵
         * @returns {Array} 复制后的矩阵
         */
        _copyMatrix(matrix) {
            return matrix.map(row => [...row]);
        }

        /**
         * 获取当前方块的有效单元格坐标
         * @returns {Array} 包含{x, y}坐标的数组
         */
        getCells() {
            const cells = [];
            for (let y = 0; y < this.matrix.length; y++) {
                for (let x = 0; x < this.matrix[y].length; x++) {
                    if (this.matrix[y][x]) {
                        cells.push({
                            x: this.position.x + x,
                            y: this.position.y + y
                        });
                    }
                }
            }
            return cells;
        }

        /**
         * 移动方块
         * @param {number} dx - X轴移动距离
         * @param {number} dy - Y轴移动距离
         */
        move(dx, dy) {
            this.position.x += dx;
            this.position.y += dy;
        }

        /**
         * 旋转方块（顺时针）
         * @returns {Object} 旋转结果 {success: boolean, kick: {x, y}}
         */
        rotate() {
            const oldRotation = this.rotation;
            const oldMatrix = this._copyMatrix(this.matrix);

            // 执行矩阵旋转（顺时针90度）
            const rotated = this.matrix[0].map((_, index) =>
                this.matrix.map(row => row[index]).reverse()
            );

            this.matrix = rotated;
            this.rotation = (this.rotation + 1) % 4;

            // 应用墙踢测试
            const kickResult = this._applyWallKick(oldRotation, this.rotation);

            if (!kickResult.success) {
                // 旋转失败，恢复到之前的状态
                this.rotation = oldRotation;
                this.matrix = oldMatrix;
            }

            return kickResult;
        }

        /**
         * 旋转方块（逆时针）
         * @returns {Object} 旋转结果 {success: boolean, kick: {x, y}}
         */
        rotateCCW() {
            const oldRotation = this.rotation;
            const oldMatrix = this._copyMatrix(this.matrix);

            // 执行矩阵旋转（逆时针90度）
            const rotated = this.matrix[0].map((_, index) =>
                this.matrix.map(row => row[row.length - 1 - index])
            );

            this.matrix = rotated;
            this.rotation = (this.rotation + 3) % 4; // 加3等于减1

            // 应用墙踢测试
            const kickResult = this._applyWallKick(oldRotation, this.rotation);

            if (!kickResult.success) {
                // 旋转失败，恢复到之前的状态
                this.rotation = oldRotation;
                this.matrix = oldMatrix;
            }

            return kickResult;
        }

        /**
         * 应用墙踢测试
         * @param {number} oldRot - 原始旋转状态
         * @param {number} newRot - 新旋转状态
         * @returns {Object} 测试结果
         */
        _applyWallKick(oldRot, newRot) {
            const kickTable = this.type === 'I' ? WALL_KICK_DATA.I :
                            this.type === 'O' ? WALL_KICK_DATA.O :
                            WALL_KICK_DATA.JLSTZ;

            // 获取正确的墙踢测试序列
            let kickIndex;
            if (oldRot === 0 && newRot === 1) kickIndex = 0; // 0->R
            else if (oldRot === 1 && newRot === 2) kickIndex = 1; // R->2
            else if (oldRot === 2 && newRot === 3) kickIndex = 2; // 2->L
            else if (oldRot === 3 && newRot === 0) kickIndex = 3; // L->0
            else if (oldRot === 3 && newRot === 2) kickIndex = 0; // L->2 (逆时针)
            else if (oldRot === 2 && newRot === 1) kickIndex = 1; // 2->R (逆时针)
            else if (oldRot === 1 && newRot === 0) kickIndex = 2; // R->0 (逆时针)
            else if (oldRot === 0 && newRot === 3) kickIndex = 3; // 0->L (逆时针)
            else kickIndex = 0;

            const kicks = kickTable[kickIndex];

            // 尝试每个墙踢位置
            for (const kick of kicks) {
                this.position.x += kick.x;
                this.position.y += kick.y;

                // 检查新位置是否有效
                const isValid = true; // 这里需要网格来检查，在game.js中实现
                // 注意：实际的碰撞检测在游戏主逻辑中完成

                // 如果位置有效，返回成功
                if (isValid) {
                    return {
                        success: true,
                        kick: { x: kick.x, y: kick.y }
                    };
                }

                // 无效则回退
                this.position.x -= kick.x;
                this.position.y -= kick.y;
            }

            return { success: false, kick: { x: 0, y: 0 } };
        }

        /**
         * 获取旋转后的矩阵（用于预览）
         * @param {number} rotation - 旋转次数（0-3）
         * @returns {Array} 旋转后的矩阵
         */
        getRotatedMatrix(rotation = 0) {
            let matrix = this._copyMatrix(this.data.shape);

            // 应用指定次数的旋转
            for (let i = 0; i < rotation; i++) {
                matrix = matrix[0].map((_, index) =>
                    matrix.map(row => row[index]).reverse()
                );
            }

            return matrix;
        }

        /**
         * 重置方块位置到生成点
         */
        resetPosition() {
            this.position = {
                x: this.data.spawnOffset.x,
                y: this.data.spawnOffset.y
            };
        }

        /**
         * 克隆当前方块
         * @returns {TetrominoPiece} 克隆的方块
         */
        clone() {
            const clone = new TetrominoPiece(this.type);
            clone.matrix = this._copyMatrix(this.matrix);
            clone.rotation = this.rotation;
            clone.position = { ...this.position };
            return clone;
        }
    }

    // ==================== 方块工厂 ====================
    class TetrominoFactory {
        constructor() {
            this.bag = [];
            this._refillBag();
        }

        /**
         * 重新填充随机方块袋（7-bag随机系统）
         */
        _refillBag() {
            const types = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];

            // Fisher-Yates洗牌算法
            for (let i = types.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [types[i], types[j]] = [types[j], types[i]];
            }

            this.bag.push(...types);
        }

        /**
         * 获取下一个方块
         * @returns {TetrominoPiece} 新的方块
         */
        next() {
            if (this.bag.length === 0) {
                this._refillBag();
            }

            const type = this.bag.shift();
            return new TetrominoPiece(type);
        }

        /**
         * 预览接下来的N个方块
         * @param {number} count - 要预览的方块数量
         * @returns {Array} 方块类型数组
         */
        preview(count = 3) {
            const previews = [];
            let bagIndex = 0;

            while (previews.length < count) {
                if (bagIndex >= this.bag.length) {
                    // 需要生成新的随机序列来预览
                    const tempTypes = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
                    for (let i = tempTypes.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [tempTypes[i], tempTypes[j]] = [tempTypes[j], tempTypes[i]];
                    }
                    previews.push(...tempTypes.slice(0, count - previews.length));
                } else {
                    previews.push(this.bag[bagIndex]);
                    bagIndex++;
                }
            }

            return previews.slice(0, count);
        }
    }

    // ==================== 公共API ====================
    return {
        TetrominoPiece,
        TetrominoFactory,
        TETROMINOES,
        WALL_KICK_DATA
    };

})();