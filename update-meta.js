#!/usr/bin/env node
/**
 * 从 jd-nausea-blocker.user.js 提取 UserScript 头部，生成 jd-nausea-blocker.meta.js
 *
 * 用途：Greasyfork 每次同步会优先抓取 .meta.js 检查版本号，
 *      只有版本真的变了才会去下载完整脚本，能省掉大量流量。
 *
 * 用法：改完 @version 后执行  node update-meta.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'jd-nausea-blocker.user.js');
const OUT = path.join(__dirname, 'jd-nausea-blocker.meta.js');

const code = fs.readFileSync(SRC, 'utf8');
const start = code.indexOf('// ==UserScript==');
const end = code.indexOf('// ==/UserScript==');

if (start === -1 || end === -1) {
    console.error('✗ 没找到 UserScript 元数据块，检查 ' + SRC);
    process.exit(1);
}

const block = code.slice(start, end + '// ==/UserScript=='.length);
fs.writeFileSync(OUT, block + '\n', 'utf8');

const vMatch = block.match(/^\s*\*?\s*@version\s+(\S+)/m) || block.match(/@version\s+(\S+)/);
console.log('✓ ' + path.basename(OUT) + ' 已生成' + (vMatch ? '，版本 ' + vMatch[1] : ''));
console.log('  记得 git commit 之后在 Greasyfork 后台点一次「同步」或直接等自动更新。');
