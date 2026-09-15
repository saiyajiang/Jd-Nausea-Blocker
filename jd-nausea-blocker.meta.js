// ==UserScript==
// @name         京东 · 不适商品屏蔽器
// @namespace    https://github.com/saiyajiang/jd-nausea-blocker
// @version      2.3.0
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
