// ==UserScript==
// @name         京东 · 不适商品屏蔽器
// @namespace    https://github.com/saiyajiang/jd-nausea-blocker
// @icon         data:image/png;base64,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
// @version      2.4.0
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
