// ==UserScript==
// @name         京东 · 不适商品屏蔽器
// @namespace    https://github.com/saiyajiang/jd-nausea-blocker
// @version      2.3.1
// @description  【AI 制作】按关键词 / 商品唯一编号 / 店铺屏蔽京东上让你不适的商品，可选「图片打码」或「彻底隐藏」，鼠标悬停商品卡可一键拉黑。
// @description:zh-CN 【本脚本由 AI 制作】按关键词 / 商品唯一编号 / 店铺屏蔽京东（jd.com、jd.hk）网页上让你不适的商品。支持两种模式：图片打码（商品仍在，图被高斯模糊，悬停可临时查看）或彻底隐藏（商品卡直接消失）。鼠标悬停商品卡会浮出「屏蔽 / 显示」按钮，可一键拉黑该商品的唯一编号、该店铺或顺手加关键词。设置面板内改动即时生效，无需手动保存。内置诊断工具可查看当前页面识别到多少个商品卡、命中几个、以及商品的真实标题，方便排查失效原因。商品唯一编号即京东每件商品的专属 ID（商品页地址栏里那串数字，如 item.jd.com/100012043978.html 中的 100012043978），用编号拉黑最精准，不误伤其他商品。
// @description:en  [AI-generated] Hide or blur JD.com products you find disgusting, filtered by keyword / product ID / shop. Two modes: blur the image or remove the card entirely. One-click block button on hover, live-editing settings panel, and a built-in diagnostics tool. The product ID is the number in a product page URL (e.g. 100012043978 in item.jd.com/100012043978.html).
// @author       saiyajiang
// @license      MIT
// @homepageURL  https://github.com/saiyajiang/Jd-Nausea-Blocker
// @supportURL   https://github.com/saiyajiang/Jd-Nausea-Blocker/issues
// @downloadURL  https://raw.githubusercontent.com/saiyajiang/Jd-Nausea-Blocker/main/jd-nausea-blocker.user.js
// @updateURL    https://raw.githubusercontent.com/saiyajiang/Jd-Nausea-Blocker/main/jd-nausea-blocker.meta.js
// @match        https://*.jd.com/*
// @match        http://*.jd.com/*
// @match        https://jd.com/*
// @match        https://*.jd.hk/*
// @match        http://*.jd.hk/*
// @match        https://*.jd.com.hk/*
// @match        http://*.jd.com.hk/*
// @connect      none
// @run-at       document-start
// @compatible   chrome
// @compatible   edge
// @compatible   firefox
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @noframes
// ==/UserScript==
//
// ---------------------------------------------------------------------------
// 京东 · 不适商品屏蔽器 （Jd-Nausea-Blocker）
// 本脚本由 AI 制作，人工实机测试后发布。源码与反馈：
// https://github.com/saiyajiang/Jd-Nausea-Blocker
//
// 【这个脚本解决什么问题】
//   刷京东时，首页推荐流、搜索结果里会混入让人不适的商品 —— 人体标本模型、
//   寄生虫/蟑螂特写、撕拉鼻贴、脚气灰指甲、造口袋、血腥道具等。京东没有提供
//   关键词屏蔽功能，本脚本就是补上这个缺口：你告诉它哪些词 / 哪些商品 / 哪些
//   店铺不想看，它就在你眼前把这些商品卡打码或直接移除。
//
// 【「商品唯一编号」是什么】
//   京东给每一件商品分配一个专属编号，通常是一串数字，比如 100012043978。
//   打开任意商品页，看地址栏：
//       https://item.jd.com/100012043978.html
//                           ↑↑↑↑↑↑↑↑↑↑↑↑
//                           这串数字就是该商品的唯一编号
//   同一件商品的不同规格（颜色、容量、套装）各有各的编号。
//   （电商行业里这个概念常被称为 SKU，本脚本界面上一律用中文「商品唯一编号」
//     来称呼它，免得看不懂。）
//
//   为什么要有这个规则？对比三种规则的精度：
//     关键词     粗 —— 屏蔽「蛇」会连蛇年文创、宠物蛇粮一起干掉
//     店铺       中 —— 该店所有商品都消失，包括正常的
//     商品唯一编号 精确 —— 只屏蔽这一件商品，绝不误伤
//   所以遇到"标题很正常、但图很恶心"的商品（关键词拦不住），
//   用商品唯一编号拉黑是唯一精准的解法。
//
// 【功能】
//   1. 两种屏蔽模式：图片打码 / 彻底隐藏
//   2. 三类规则：关键词（支持正则）、商品唯一编号黑名单、店铺黑名单
//   3. 鼠标悬停商品卡，右上角浮出「屏蔽 / 显示」按钮，一键拉黑
//   4. 设置面板内改动即停手自动生效，无需点保存
//   5. 覆盖搜索页、列表页、首页推荐流、详情页推荐位
//   6. document-start 注入 + MutationObserver，卡片一进 DOM 就处理，不闪图
//   7. 内置诊断工具：油猴菜单「🔍 诊断」查看识别数、命中数与真实标题
//
// 【已知限制】
//   - 依赖文本匹配（标题 / 图片 alt / 图片 URL / 店铺名），无法识别图片内容本身
//   - 京东改版可能导致商品卡识别失效，此时用诊断工具反馈信息到 Issues
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    /* ==================== 配置 ==================== */

    const CFG_KEY = 'jd_nausea_blocker_v2';

    const DEFAULT_KEYWORDS = [
        '标本', '骨架', '骷髅', '头骨', '仿真尸', '尸体', '解剖', '腐烂', '腐尸', '血腥',
        '寄生虫', '蛔虫', '绦虫', '虫卵', '蛆', '蟑螂', '水蛭', '蚂蟥', '蜈蚣', '蝎子',
        '溃烂', '化脓', '脓液', '坏疽', '呕吐', '恐怖', '惊悚',
        '粪便', '排泄', '痔疮', '褥疮', '造口', '造瘘', '导尿', '灌肠', '咳痰', '痰液',
        '白带', '恶露', '胎盘', '脐带', '疣', '灰指甲', '脚气',
    ];

    const DEFAULTS = {
        enabled: true,
        mode: 'blur',        // 'blur' 打码 | 'hide' 彻底隐藏
        blurPx: 22,
        showTools: true,
        keywords: DEFAULT_KEYWORDS.slice(),
        skus: [],
        shops: [],
    };

    /* ==================== 存储 & 规则编译 ==================== */

    let cfg = loadCfg();
    let cfgVersion = 0;
    let matchKeyword = compile(cfg.keywords);
    let matchShop = compile(cfg.shops);
    let skuSet = new Set(normList(cfg.skus));

    function loadCfg() {
        let saved = null;
        try { saved = GM_getValue(CFG_KEY, null); } catch (e) {}
        if (typeof saved === 'string') { try { saved = JSON.parse(saved); } catch (e) { saved = null; } }
        const c = Object.assign({}, DEFAULTS, saved || {});
        c.keywords = Array.isArray(c.keywords) ? c.keywords : DEFAULTS.keywords.slice();
        c.skus = Array.isArray(c.skus) ? c.skus : [];
        c.shops = Array.isArray(c.shops) ? c.shops : [];
        c.mode = (c.mode === 'hide') ? 'hide' : 'blur';
        c.blurPx = Number(c.blurPx) > 0 ? Number(c.blurPx) : 22;
        c.enabled = c.enabled !== false;
        return c;
    }

    function saveCfg(next) {
        cfg = next;
        cfgVersion++;
        matchKeyword = compile(cfg.keywords);
        matchShop = compile(cfg.shops);
        skuSet = new Set(normList(cfg.skus));
        try { GM_setValue(CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
        applyStyleVars();
        rescan(true);
    }

    function normList(a) {
        return (Array.isArray(a) ? a : []).map(s => String(s == null ? '' : s).trim()).filter(Boolean);
    }

    // 纯文本 -> includes；/正则/i 或 re:正则 -> 正则
    function compile(list) {
        const strs = [], regs = [];
        normList(list).forEach(s => {
            if (s.length > 2 && s[0] === '/' && s.lastIndexOf('/') > 0) {
                const end = s.lastIndexOf('/');
                try { regs.push(new RegExp(s.slice(1, end), s.slice(end + 1).replace(/[^gimsuy]/g, ''))); return; }
                catch (e) { /* 写错就当文本 */ }
            }
            if (s.slice(0, 3).toLowerCase() === 're:') {
                try { regs.push(new RegExp(s.slice(3), 'i')); return; } catch (e) { return; }
            }
            strs.push(s.toLowerCase());
        });
        return function (text) {
            const t = String(text == null ? '' : text).toLowerCase();
            if (!t) return null;
            for (let i = 0; i < strs.length; i++) if (t.indexOf(strs[i]) !== -1) return strs[i];
            for (let i = 0; i < regs.length; i++) {
                const r = regs[i];
                r.lastIndex = 0;
                if (r.test(t)) return r.source;
            }
            return null;
        };
    }

    /* ==================== 样式 ==================== */

    const STYLE_ID = 'jd-nb-style-v2';

    function cssText() {
        return `
.jd-nb-hide { display: none !important; }
.jd-nb-blur img,
.jd-nb-blur .p-img,
.jd-nb-blur [class*="img"][style*="background"] {
    filter: blur(var(--jd-nb-px, 22px)) grayscale(.15) !important;
    -webkit-filter: blur(var(--jd-nb-px, 22px)) grayscale(.15) !important;
}
.jd-nb-imgblur {
    filter: blur(var(--jd-nb-px, 22px)) grayscale(.15) !important;
    -webkit-filter: blur(var(--jd-nb-px, 22px)) grayscale(.15) !important;
}
.jd-nb-reveal.jd-nb-blur img,
.jd-nb-reveal.jd-nb-blur .p-img { filter: none !important; -webkit-filter: none !important; }
.jd-nb-hide.jd-nb-reveal { display: block !important; }
.jd-nb-touched { position: relative; }
.jd-nb-bar {
    position: absolute; top: 4px; right: 4px; z-index: 2147483000;
    display: flex; gap: 4px; opacity: 0; transition: opacity .15s;
    font: 12px/1 -apple-system, "Microsoft YaHei", sans-serif !important;
}
.jd-nb-touched:hover > .jd-nb-bar,
.jd-nb-touched:hover .jd-nb-bar { opacity: 1; }
.jd-nb-bar button {
    border: 0; cursor: pointer; padding: 3px 7px; border-radius: 10px;
    background: rgba(0,0,0,.62); color: #fff; font-size: 12px; line-height: 1.4;
}
.jd-nb-bar button:hover { background: #e1251b; }
.jd-nb-tag {
    position: absolute; left: 4px; bottom: 4px; z-index: 2147483000;
    padding: 2px 6px; border-radius: 8px; background: rgba(0,0,0,.55);
    color: #fff; font-size: 11px; pointer-events: none;
}
#jd-nb-panel, #jd-nb-diag {
    position: fixed; z-index: 2147483647; background: #fff; color: #333;
    border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.28);
    font: 13px/1.7 -apple-system, "Microsoft YaHei", sans-serif !important;
    box-sizing: border-box; padding: 16px 18px;
}
#jd-nb-panel { right: 24px; top: 80px; width: 390px; max-height: 78vh; overflow: auto; }
#jd-nb-diag  { left: 24px;  top: 80px; width: 460px; max-height: 70vh; overflow: auto; }
#jd-nb-panel h3, #jd-nb-diag h3 { margin: 0 0 12px; font-size: 15px; color: #e1251b; }
#jd-nb-panel label.blk { display: block; margin: 10px 0 4px; font-weight: 600; }
#jd-nb-panel textarea {
    width: 100%; box-sizing: border-box; height: 90px; resize: vertical;
    border: 1px solid #ddd; border-radius: 6px; padding: 6px 8px; font-size: 12px; line-height: 1.6;
}
#jd-nb-panel .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
#jd-nb-panel .row label { margin: 0; }
#jd-nb-panel .btns { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }
#jd-nb-panel .btns button, #jd-nb-diag .btns button {
    border: 0; border-radius: 6px; padding: 7px 14px; cursor: pointer;
    background: #e1251b; color: #fff; font-size: 13px;
}
#jd-nb-panel .btns button.ghost, #jd-nb-diag .btns button.ghost { background: #f2f2f2; color: #555; }
#jd-nb-panel .tip, #jd-nb-diag .tip { color: #999; font-size: 11px; }
#jd-nb-diag pre {
    background: #f7f7f7; border-radius: 6px; padding: 8px 10px; font-size: 11px;
    line-height: 1.6; max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-all;
}
`;
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const host = document.head || document.documentElement;
        if (!host) return;
        const st = document.createElement('style');
        st.id = STYLE_ID;
        st.textContent = cssText();
        try { host.appendChild(st); } catch (e) {}
    }

    function applyStyleVars() {
        ensureStyle();
        const root = document.documentElement || document.body;
        if (root) root.style.setProperty('--jd-nb-px', (Number(cfg.blurPx) || 22) + 'px');
    }

    /* ==================== 商品识别（不依赖京东类名） ==================== */

    // 商品链接的常见形态
    const LINK_SELECTOR = [
        'a[href*="item.jd.com"]',
        'a[href*="item.jd.hk"]',
        'a[href*="/product/"]',
        'a[href*="item.m.jd.com"]',
        'a[href*="sku"]',
    ].join(',');

    const LINK_RE = /(item\.(jd|jd\.hk|m\.jd)\.com|\/product\/|\/\d{6,}\.html|[?&]sku=)/i;

    // 已知卡片容器（有就用，没有就靠链接兜底）
    const CARD_SELECTOR = '[data-sku],[data-spu],[data-sku-id],[data-item-id],li.gl-item,li.j-sku-item,div.j-sku-item,li[data-index],div[class*="gl-item"]';

    function rectOk(el) {
        const r = el.getBoundingClientRect();
        return r.width > 40 && r.height > 40 && r.width < window.innerWidth * 0.98 && r.height < 900;
    }

    // 从一个商品链接反查"应该被处理的那张卡片"
    function pickCard(a) {
        // 1) 带 sku/id 的祖先（最准）
        let el = a.closest(CARD_SELECTOR);
        if (el && rectOk(el)) return el;

        // 2) 常见的 li / item 容器，但尺寸要像个卡片
        let p = a.parentElement, guard = 0;
        while (p && p !== document.body && guard++ < 5) {
            if (p.tagName === 'LI' || /(^|[\s-])(item|goods|product|sku|card|cell)([\s-]|$)/i.test(p.className || '')) {
                if (rectOk(p)) return p;
            }
            p = p.parentElement;
        }

        // 3) 链接自己就包着图 -> 直接处理链接
        if (a.querySelector('img')) return a;

        // 4) 兜底：链接的父元素
        return a.parentElement || a;
    }

    function collectCards() {
        const out = [];
        const seen = new Set();
        let links = [];
        try { links = Array.prototype.slice.call(document.querySelectorAll(LINK_SELECTOR)); } catch (e) {}

        for (let i = 0; i < links.length; i++) {
            const a = links[i];
            let href = '';
            try { href = a.href || ''; } catch (e) {}
            if (!href || !LINK_RE.test(href)) continue;
            const card = pickCard(a);
            if (!card || card === document.body || card === document.documentElement) continue;
            if (seen.has(card)) continue;
            seen.add(card);
            out.push(card);
        }

        // 去重：如果被命中的卡片是另一张卡片的后代，去掉后代
        return out.filter(el => {
            let p = el.parentElement;
            while (p && p !== document.body) { if (seen.has(p)) return false; p = p.parentElement; }
            return true;
        });
    }

    function imgAttrs(img) {
        return [
            img.getAttribute('alt'),
            img.getAttribute('title'),
            img.getAttribute('data-lazy-img'),
            img.getAttribute('data-origin'),
            img.getAttribute('data-img'),
            img.getAttribute('src'),
            img.getAttribute('srcset'),
        ].filter(Boolean).join(' ');
    }

    function cardInfo(el) {
        const sku = el.getAttribute('data-sku') || el.getAttribute('data-spu') ||
                    el.getAttribute('data-sku-id') || el.getAttribute('data-item-id') || '';
        let title = '';
        const tNode = el.querySelector('.p-name em') || el.querySelector('.p-name') ||
                      el.querySelector('[class*="name"]') || el.querySelector('a[title]');
        if (tNode) title = (tNode.getAttribute('title') || tNode.textContent || '').trim();
        if (!title) {
            const im = el.querySelector('img[alt]');
            if (im) title = (im.getAttribute('alt') || '').trim();
        }
        if (!title) title = (el.textContent || '').trim().slice(0, 300);

        const sNode = el.querySelector('.p-shop a, .curr-shop, [class*="shop"] a, [class*="shop-name"]');
        const shop = sNode ? (sNode.getAttribute('title') || sNode.textContent || '').trim() : '';

        let imgText = '';
        const imgs = el.querySelectorAll('img');
        for (let i = 0; i < imgs.length && i < 6; i++) imgText += imgAttrs(imgs[i]) + '\n';

        return { sku: String(sku).trim(), title, shop, imgText };
    }

    /* ==================== 判定 & 处理 ==================== */

    const A_V = 'data-jd-nb-v', A_HIT = 'data-jd-nb-hit', A_SIG = 'data-jd-nb-sig';
    let stat = { cards: 0, hit: 0, imgHit: 0 };

    function judge(el) {
        if (!cfg.enabled) return { why: null, info: cardInfo(el) };
        const info = cardInfo(el);
        const hay = [info.title, info.imgText, info.shop, info.sku].join('\n');
        const kw = matchKeyword(hay);
        if (kw) return { why: '关键词：' + kw, info };
        if (info.sku && skuSet.has(info.sku)) return { why: '已拉黑的商品编号：' + info.sku, info };
        if (info.shop && matchShop(info.shop)) return { why: '店铺：' + matchShop(info.shop), info };
        return { why: null, info };
    }

    function processCard(el, force) {
        try {
            const res = judge(el);
            const sig = (res.info.title + '|' + res.info.sku).slice(0, 200);

            if (!force && el.getAttribute(A_V) === String(cfgVersion)) {
                if (el.getAttribute(A_HIT)) return true;               // 已命中，跳过
                if (el.getAttribute(A_SIG) === sig) return false;      // 已扫描且内容没变
            }

            el.setAttribute(A_V, String(cfgVersion));
            el.setAttribute(A_SIG, sig);
            el.classList.remove('jd-nb-hide', 'jd-nb-blur');

            if (res.why) {
                el.setAttribute(A_HIT, res.why);
                el.classList.add(cfg.mode === 'hide' ? 'jd-nb-hide' : 'jd-nb-blur');
                ensureTag(el, res.why);
            } else {
                el.removeAttribute(A_HIT);
                removeTag(el);
            }
            if (cfg.showTools) ensureTools(el);
            return !!res.why;
        } catch (e) { return false; }
    }

    // 兜底：就算卡片识别失败，只要图片本身（alt/src）命中就直接打码
    function processImages() {
        if (!cfg.enabled) return 0;
        let n = 0;
        let imgs = [];
        try { imgs = Array.prototype.slice.call(document.querySelectorAll('img')); } catch (e) {}
        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            try {
                const txt = imgAttrs(img);
                if (!txt) continue;
                const kw = matchKeyword(txt);
                const done = img.getAttribute(A_V);
                if (kw) {
                    if (done !== String(cfgVersion)) {
                        img.setAttribute(A_V, String(cfgVersion));
                        img.setAttribute(A_HIT, kw);
                    }
                    if (cfg.mode === 'hide') {
                        const box = img.closest('a, [class*="img"], [class*="pic"]') || img;
                        box.classList.add('jd-nb-imgblur');
                    } else {
                        img.classList.add('jd-nb-imgblur');
                    }
                    n++;
                } else if (done === String(cfgVersion)) {
                    img.classList.remove('jd-nb-imgblur');
                }
            } catch (e) {}
        }
        return n;
    }

    function ensureTag(el, why) {
        let tag = null;
        for (const c of el.children) if (c.className === 'jd-nb-tag') { tag = c; break; }
        if (!tag) { tag = document.createElement('div'); tag.className = 'jd-nb-tag'; el.appendChild(tag); }
        tag.textContent = cfg.mode === 'hide' ? '已屏蔽' : '已打码';
        tag.title = why;
    }
    function removeTag(el) {
        for (const c of Array.prototype.slice.call(el.children)) if (c.className === 'jd-nb-tag') c.remove();
    }

    function ensureTools(el) {
        for (const c of el.children) if (c.className === 'jd-nb-bar') return;
        const bar = document.createElement('div');
        bar.className = 'jd-nb-bar';
        bar.innerHTML = '<button data-act="block" title="拉黑这个商品">屏蔽</button>' +
                        '<button data-act="reveal" title="临时显示原图">显示</button>';
        bar.addEventListener('click', onBarClick);
        bar.addEventListener('mousedown', e => e.stopPropagation());
        bar.addEventListener('click', e => e.stopPropagation());
        el.appendChild(bar);
        el.classList.add('jd-nb-touched');
    }

    function onBarClick(e) {
        const btn = e.target.closest ? e.target.closest('button[data-act]') : null;
        if (!btn) return;
        e.preventDefault(); e.stopPropagation();
        const item = btn.closest('.jd-nb-touched') || btn.parentElement;

        if (btn.getAttribute('data-act') === 'reveal') {
            item.classList.toggle('jd-nb-reveal');
            item.querySelectorAll('img').forEach(im => im.classList.toggle('jd-nb-imgblur'));
            return;
        }

        const info = cardInfo(item);
        const ans = window.prompt(
            '屏蔽这个商品：\n' +
            '  直接确定  → 拉黑该商品的唯一编号' + (info.sku ? '（' + info.sku + '）' : '（未识别到商品编号）') + '\n' +
            '  输入 s     → 拉黑店铺' + (info.shop ? '（' + info.shop + '）' : '（未识别到店铺）') + '\n' +
            '  输入文字   → 作为关键词（多个用空格分隔）\n\n' +
            '  提示：用商品唯一编号拉黑最精准，只屏蔽这一件，不会误伤其他商品。\n\n' +
            '商品：' + info.title.slice(0, 40),
            ''
        );
        if (ans === null) return;
        const v = ans.trim();
        const next = JSON.parse(JSON.stringify(cfg));
        if (!v) {
            if (info.sku) next.skus = push(next.skus, info.sku);
            else if (info.title) next.keywords = push(next.keywords, info.title.slice(0, 20));
        } else if (v === 's') {
            if (info.shop) next.shops = push(next.shops, info.shop);
        } else {
            v.split(/[\s,，]+/).forEach(w => { if (w) next.keywords = push(next.keywords, w); });
        }
        saveCfg(next);
        toast('已加入黑名单');
    }

    function push(arr, v) {
        const a = (Array.isArray(arr) ? arr.slice() : []);
        if (v && a.indexOf(v) === -1) a.push(v);
        return a;
    }

    /* ==================== 扫描调度 ==================== */

    let timer = null;
    function schedule(force) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { timer = null; rescan(force === true); }, 180);
    }

    function rescan(force) {
        ensureStyle();
        if (!cfg.enabled) { clearAll(); return; }
        let hit = 0;
        const cards = collectCards();
        for (let i = 0; i < cards.length; i++) if (processCard(cards[i], force)) hit++;
        stat = { cards: cards.length, hit: hit, imgHit: processImages() };
        if (panel && panel.isConnected) refreshStat();
    }

    function clearAll() {
        try {
            document.querySelectorAll('.jd-nb-hide,.jd-nb-blur,.jd-nb-imgblur').forEach(el => {
                el.classList.remove('jd-nb-hide', 'jd-nb-blur', 'jd-nb-reveal', 'jd-nb-imgblur');
                el.removeAttribute(A_HIT); el.removeAttribute(A_V); el.removeAttribute(A_SIG);
            });
            document.querySelectorAll('.jd-nb-tag').forEach(n => n.remove());
        } catch (e) {}
    }

    /* ==================== 设置面板 ==================== */

    let panel = null;

    function openPanel() {
        if (panel && panel.isConnected) { panel.remove(); panel = null; return; }
        if (diag && diag.isConnected) { diag.remove(); diag = null; }
        panel = document.createElement('div');
        panel.id = 'jd-nb-panel';
        panel.innerHTML = `
            <h3>京东 · 不适商品屏蔽器</h3>
            <div class="row">
                <label><input type="checkbox" id="nb-on" ${cfg.enabled ? 'checked' : ''}> 启用屏蔽</label>
                <label><input type="radio" name="m" value="blur" ${cfg.mode === 'blur' ? 'checked' : ''}> 图片打码</label>
                <label><input type="radio" name="m" value="hide" ${cfg.mode === 'hide' ? 'checked' : ''}> 彻底隐藏</label>
            </div>
            <div class="row" style="margin-top:8px">
                <span>打码强度</span>
                <input type="range" id="nb-px" min="6" max="60" value="${cfg.blurPx}">
                <span id="nb-pxv">${cfg.blurPx}px</span>
            </div>
            <label class="blk">关键词（每行一个，支持 /正则/i，改动即自动生效）</label>
            <textarea id="nb-kw">${esc((cfg.keywords || []).join('\n'))}</textarea>
            <label class="blk">商品唯一编号黑名单（每行一个）</label>
            <div class="tip" style="margin-bottom:4px">
                商品唯一编号 = 商品页地址栏里那串数字，如 item.jd.com/<b>100012043978</b>.html
                里的 100012043978。按编号拉黑最精准，只屏蔽这一件商品。
            </div>
            <textarea id="nb-sku" style="height:60px">${esc((cfg.skus || []).join('\n'))}</textarea>
            <label class="blk">店铺黑名单（每行一个）</label>
            <textarea id="nb-shop" style="height:60px">${esc((cfg.shops || []).join('\n'))}</textarea>
            <div class="row" style="margin-top:8px">
                <label><input type="checkbox" id="nb-tools" ${cfg.showTools ? 'checked' : ''}> 商品卡悬浮按钮</label>
            </div>
            <div class="btns">
                <button id="nb-save">保存并生效</button>
                <button class="ghost" id="nb-diag">诊断</button>
                <button class="ghost" id="nb-reset">恢复默认</button>
                <button class="ghost" id="nb-export">导出</button>
                <button class="ghost" id="nb-import">导入</button>
                <button class="ghost" id="nb-close">关闭</button>
            </div>
            <div class="tip" id="nb-stat" style="margin-top:10px"></div>
        `;
        document.body.appendChild(panel);

        panel.querySelector('#nb-px').addEventListener('input', e => {
            panel.querySelector('#nb-pxv').textContent = e.target.value + 'px';
            readPanel(true);
        });
        ['#nb-on', '#nb-tools'].forEach(s => panel.querySelector(s).addEventListener('change', () => readPanel(true)));
        panel.querySelectorAll('input[name="m"]').forEach(r => r.addEventListener('change', () => readPanel(true)));
        ['#nb-kw', '#nb-sku', '#nb-shop'].forEach(s => {
            let t = null;
            panel.querySelector(s).addEventListener('input', () => {
                clearTimeout(t);
                t = setTimeout(() => readPanel(true), 700); // 边打字边生效
            });
        });

        panel.querySelector('#nb-save').addEventListener('click', () => { readPanel(true); toast('已保存并生效'); });
        panel.querySelector('#nb-close').addEventListener('click', () => { panel.remove(); panel = null; });
        panel.querySelector('#nb-diag').addEventListener('click', openDiag);
        panel.querySelector('#nb-reset').addEventListener('click', () => {
            if (window.confirm('恢复默认关键词？商品唯一编号 / 店铺黑名单会清空。')) {
                saveCfg(Object.assign({}, DEFAULTS, { keywords: DEFAULT_KEYWORDS.slice(), skus: [], shops: [] }));
                if (panel) { panel.remove(); panel = null; }
                toast('已恢复默认');
            }
        });
        panel.querySelector('#nb-export').addEventListener('click', () => {
            const txt = JSON.stringify(cfg, null, 2);
            try { navigator.clipboard.writeText(txt); toast('已复制到剪贴板'); } catch (e) {}
            window.prompt('复制下面的配置：', txt);
        });
        panel.querySelector('#nb-import').addEventListener('click', () => {
            const txt = window.prompt('粘贴配置 JSON：', '');
            if (!txt) return;
            try {
                saveCfg(Object.assign({}, DEFAULTS, JSON.parse(txt)));
                if (panel) { panel.remove(); panel = null; }
                toast('导入成功');
            } catch (e) { toast('JSON 解析失败'); }
        });
        refreshStat();
    }

    function readPanel(apply) {
        if (!panel) return;
        const next = Object.assign({}, cfg);
        next.enabled = panel.querySelector('#nb-on').checked;
        const m = panel.querySelector('input[name="m"]:checked');
        next.mode = m ? m.value : cfg.mode;
        next.blurPx = Number(panel.querySelector('#nb-px').value) || 22;
        next.showTools = panel.querySelector('#nb-tools').checked;
        next.keywords = lines(panel.querySelector('#nb-kw').value);
        next.skus = lines(panel.querySelector('#nb-sku').value);
        next.shops = lines(panel.querySelector('#nb-shop').value);
        if (!next.enabled) clearAll();
        saveCfg(next);
    }

    function refreshStat() {
        const s = panel && panel.querySelector('#nb-stat');
        if (!s) return;
        s.innerHTML = cfg.enabled
            ? '规则：关键词 ' + cfg.keywords.length + ' / 商品编号 ' + cfg.skus.length + ' / 店铺 ' + cfg.shops.length +
              '<br>本页：识别到 <b>' + stat.cards + '</b> 个商品，命中 <b>' + stat.hit + '</b> 个。识别数为 0 请点「诊断」。'
            : '已暂停（所有屏蔽已撤销）。';
    }

    /* ==================== 诊断 ==================== */

    let diag = null;

    function openDiag() {
        if (diag && diag.isConnected) { diag.remove(); diag = null; return; }
        rescan(true);
        const cards = collectCards();
        const sample = cards.slice(0, 8).map((el, i) => {
            const info = cardInfo(el);
            return (i + 1) + '. ' + (info.title || '(无标题)').slice(0, 46) +
                   '\n   命中: ' + (el.getAttribute(A_HIT) || '—') +
                   '\n   卡片: ' + el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(/\s+/).slice(0, 3).join('.') : '') +
                   '\n   文本: ' + (el.textContent || '').trim().slice(0, 60);
        }).join('\n\n');

        diag = document.createElement('div');
        diag.id = 'jd-nb-diag';
        diag.innerHTML = `
            <h3>诊断</h3>
            <div>脚本状态：<b>${cfg.enabled ? '已启用' : '已暂停'}</b>　模式：<b>${cfg.mode === 'hide' ? '彻底隐藏' : '图片打码'}</b></div>
            <div>当前 URL：<span class="tip">${esc(location.href.slice(0, 70))}</span></div>
            <div style="margin-top:8px">
                识别商品卡：<b>${stat.cards}</b> 个　命中：<b>${stat.hit}</b> 个　图片级命中：<b>${stat.imgHit}</b> 个
            </div>
            <label class="blk" style="margin-top:12px">前几个商品（确认标题是否被读到）</label>
            <pre>${esc(sample || '没有找到任何商品卡 —— 说明选择器在本页不适用，请把这段内容反馈给脚本作者。')}</pre>
            <div class="btns">
                <button id="nb-d-rescan">重新扫描</button>
                <button class="ghost" id="nb-d-copy">复制以上信息</button>
                <button class="ghost" id="nb-d-close">关闭</button>
            </div>
            <div class="tip" style="margin-top:8px">
                如果「识别商品卡」是 0：本页是动态渲染，点「重新扫描」或滚动一下页面再试。<br>
                如果识别数正常、命中是 0：检查关键词是不是真的出现在标题里。
            </div>
        `;
        document.body.appendChild(diag);
        diag.querySelector('#nb-d-close').addEventListener('click', () => { diag.remove(); diag = null; });
        diag.querySelector('#nb-d-rescan').addEventListener('click', () => { rescan(true); diag.remove(); diag = null; openDiag(); });
        diag.querySelector('#nb-d-copy').addEventListener('click', () => {
            try { navigator.clipboard.writeText(sample); toast('已复制'); } catch (e) {}
        });
        console.log('[JD屏蔽器] 诊断：', { stat: stat, sample: sample, cfg: cfg });
    }

    /* ==================== 工具 ==================== */

    function lines(v) { return String(v || '').split('\n').map(s => s.trim()).filter(Boolean); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function toast(msg) { try { GM_notification({ text: msg, timeout: 1800 }); } catch (e) {} }

    /* ==================== 启动 ==================== */

    function start() {
        ensureStyle();
        applyStyleVars();

        const obs = new MutationObserver(() => schedule(false));
        try { obs.observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
        window.addEventListener('DOMContentLoaded', () => { ensureStyle(); schedule(true); });
        window.addEventListener('load', () => schedule(true));
        window.addEventListener('scroll', () => schedule(false), { passive: true });
        setInterval(() => { ensureStyle(); schedule(false); }, 3000);

        GM_registerMenuCommand('⚙️ 设置（关键词 / 打码 / 隐藏）', openPanel);
        GM_registerMenuCommand('🔍 诊断（看看有没有识别到商品）', openDiag);
        GM_registerMenuCommand('➕ 快速添加关键词', () => {
            const w = window.prompt('添加关键词（多个用空格分隔，支持 /正则/i）：', '');
            if (!w) return;
            const next = JSON.parse(JSON.stringify(cfg));
            w.split(/[\s,，]+/).forEach(x => { if (x) next.keywords = push(next.keywords, x); });
            saveCfg(next);
            toast('已添加');
        });
        GM_registerMenuCommand('👁 暂停 / 恢复屏蔽', () => {
            const next = JSON.parse(JSON.stringify(cfg));
            next.enabled = !next.enabled;
            if (!next.enabled) clearAll();
            saveCfg(next);
            toast(next.enabled ? '已开启屏蔽' : '已暂停屏蔽');
        });

        schedule(true);
    }

    function boot() {
        if (!document.documentElement) { setTimeout(boot, 5); return; }
        start();
    }
    boot();
})();
