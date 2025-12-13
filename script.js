// DOM Elements
const input = document.getElementById("inputText")
const output = document.getElementById("outputText")
const consoleBody = document.getElementById("consoleBody")
const consoleStatus = document.getElementById("consoleStatus")
const charCount = document.getElementById("charCount")
const byteCount = document.getElementById("byteCount")
const historyList = document.getElementById("historyList")
const toast = document.getElementById("toast")
const aesModal = document.getElementById("aesModal")
const aesModalTitle = document.getElementById("aesModalTitle")
const aesKeyInput = document.getElementById("aesKey")
const caesarModal = document.getElementById("caesarModal")
const caesarModalTitle = document.getElementById("caesarModalTitle")
const caesarShiftInput = document.getElementById("caesarShift")
const vigenereModal = document.getElementById("vigenereModal")
const vigenereModalTitle = document.getElementById("vigenereModalTitle")
const vigenereKeyInput = document.getElementById("vigenereKey")
const consoleInput = document.getElementById("consoleInput")

let currentAesAction = null
let currentCaesarAction = null
let currentVigenereAction = null
const CryptoJS = window.CryptoJS

// Morse Code Map
const MORSE_CODE = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
}

const MORSE_DECODE = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]))

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadHistory()
  setupEventListeners()
})

// Global function for welcome commands
window.executeCmd = (cmd) => {
  consoleInput.value = cmd
  handleConsoleCommand()
}

// Event Listeners
function setupEventListeners() {
  input.addEventListener("input", handleInput)

  // Theme toggle
  document.getElementById("modeToggle").addEventListener("change", (e) => {
    document.body.classList.toggle("light", e.target.checked)
    localStorage.setItem("theme", e.target.checked ? "light" : "dark")
    logToConsole(`Chuyển sang chế độ ${e.target.checked ? "sáng" : "tối"}`, "info")
  })

  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "light") {
    document.getElementById("modeToggle").checked = true
    document.body.classList.add("light")
  }

  // Action buttons
  document.querySelectorAll(".action-btn.encode").forEach((btn) => {
    btn.addEventListener("click", () => handleEncode(btn.dataset.type))
  })

  document.querySelectorAll(".action-btn.decode").forEach((btn) => {
    btn.addEventListener("click", () => handleDecode(btn.dataset.type))
  })

  document.querySelectorAll(".action-btn.hash").forEach((btn) => {
    btn.addEventListener("click", () => handleHash(btn.dataset.type))
  })

  // Utility buttons
  document.getElementById("copyBtn").addEventListener("click", copyResult)
  document.getElementById("exportTxt").addEventListener("click", exportTxt)
  document.getElementById("exportJson").addEventListener("click", exportJson)
  document.getElementById("pasteBtn").addEventListener("click", pasteFromClipboard)
  document.getElementById("clearAll").addEventListener("click", clearAll)
  document.getElementById("clearHistory").addEventListener("click", clearHistory)
  document.getElementById("clearConsole").addEventListener("click", clearConsole)

  // AES Modal
  document.getElementById("closeModal").addEventListener("click", closeAesModal)
  document.getElementById("cancelAes").addEventListener("click", closeAesModal)
  document.getElementById("confirmAes").addEventListener("click", confirmAes)
  aesModal.addEventListener("click", (e) => {
    if (e.target === aesModal) closeAesModal()
  })
  aesKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") confirmAes()
  })

  // Caesar Modal
  document.getElementById("closeCaesarModal").addEventListener("click", closeCaesarModal)
  document.getElementById("cancelCaesar").addEventListener("click", closeCaesarModal)
  document.getElementById("confirmCaesar").addEventListener("click", confirmCaesar)
  caesarModal.addEventListener("click", (e) => {
    if (e.target === caesarModal) closeCaesarModal()
  })
  caesarShiftInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") confirmCaesar()
  })

  // Vigenère Modal
  document.getElementById("closeVigenereModal").addEventListener("click", closeVigenereModal)
  document.getElementById("cancelVigenere").addEventListener("click", closeVigenereModal)
  document.getElementById("confirmVigenere").addEventListener("click", confirmVigenere)
  vigenereModal.addEventListener("click", (e) => {
    if (e.target === vigenereModal) closeVigenereModal()
  })
  vigenereKeyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") confirmVigenere()
  })

  // Console input
  consoleInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleConsoleCommand()
  })
  document.getElementById("consoleSend").addEventListener("click", handleConsoleCommand)
}

// Console Command Handler
function handleConsoleCommand() {
  const cmd = consoleInput.value.trim().toLowerCase()
  if (!cmd) return

  consoleInput.value = ""
  logToConsole(`<span style="color: #818cf8;">$</span> ${cmd}`, "default")

  if (cmd === "help" || cmd === "?") {
    showHelp()
  } else if (cmd === "clear" || cmd === "cls") {
    clearConsole()
  } else if (cmd === "version" || cmd === "v") {
    logToConsole("Chuyển Mã Pro v4.0 - Made by nguyên.dev", "info")
    logToConsole("Hỗ trợ 12 loại mã hóa + 3 loại hash", "info")
  } else if (cmd === "list" || cmd === "ls") {
    showEncodingList()
  } else if (cmd.startsWith("encode ") || cmd.startsWith("e ")) {
    const type = cmd.replace(/^(encode|e)\s+/, "")
    if (input.value) handleEncode(type)
    else logToConsole("Vui lòng nhập dữ liệu trước!", "error")
  } else if (cmd.startsWith("decode ") || cmd.startsWith("d ")) {
    const type = cmd.replace(/^(decode|d)\s+/, "")
    if (input.value) handleDecode(type)
    else logToConsole("Vui lòng nhập dữ liệu trước!", "error")
  } else if (cmd.startsWith("hash ")) {
    const type = cmd.replace("hash ", "")
    if (input.value) handleHash(type)
    else logToConsole("Vui lòng nhập dữ liệu trước!", "error")
  } else if (cmd === "analyze" || cmd === "a") {
    if (input.value) analyzeInput(input.value)
    else logToConsole("Vui lòng nhập dữ liệu để phân tích!", "warning")
  } else if (cmd === "stats") {
    showStats()
  } else {
    logToConsole(`Lệnh không hợp lệ: "${cmd}". Gõ "help" để xem hướng dẫn.`, "warning")
  }
}

function showHelp() {
  const helpText = `
<div style="padding: 12px 0;">
  <div style="margin-bottom: 12px; background: linear-gradient(90deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1rem;">Danh sách lệnh hỗ trợ</div>
  <div style="display: grid; gap: 8px; font-size: 0.82rem;">
    <div><span class="highlight">help, ?</span> — Hiện hướng dẫn này</div>
    <div><span class="highlight">clear, cls</span> — Xóa console</div>
    <div><span class="highlight">version, v</span> — Xem phiên bản</div>
    <div><span class="highlight">list, ls</span> — Danh sách mã hóa</div>
    <div><span class="highlight">analyze, a</span> — Phân tích dữ liệu</div>
    <div><span class="highlight">stats</span> — Thống kê dữ liệu chi tiết</div>
    <div><span class="highlight">encode [type]</span> — Mã hóa (binary, hex, base64, url, rot13, rot47, morse, reverse, atbash, caesar, vigenere, aes)</div>
    <div><span class="highlight">decode [type]</span> — Giải mã</div>
    <div><span class="highlight">hash [type]</span> — Hash (md5, sha256, sha512)</div>
  </div>
</div>`
  logToConsole(helpText, "ai")
}

function showEncodingList() {
  const list = `
<div style="padding: 12px 0;">
  <div style="margin-bottom: 12px; color: #4ade80; font-weight: 600;">Các loại mã hóa được hỗ trợ:</div>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 0.8rem;">
    <div>✦ Binary (nhị phân)</div>
    <div>✦ Hex (thập lục phân)</div>
    <div>✦ Base64</div>
    <div>✦ URL Encoding</div>
    <div>✦ ROT13</div>
    <div>✦ ROT47</div>
    <div>✦ Morse Code</div>
    <div>✦ Reverse</div>
    <div>✦ Atbash Cipher</div>
    <div>✦ Caesar Cipher</div>
    <div>✦ Vigenère Cipher</div>
    <div>✦ AES Encryption</div>
  </div>
  <div style="margin-top: 12px; color: #f59e0b; font-weight: 600;">Hash functions:</div>
  <div style="display: flex; gap: 16px; font-size: 0.8rem; margin-top: 6px;">
    <span>✦ MD5</span>
    <span>✦ SHA256</span>
    <span>✦ SHA512</span>
  </div>
</div>`
  logToConsole(list, "ai")
}

function showStats() {
  const text = input.value
  if (!text) {
    logToConsole("Không có dữ liệu để thống kê!", "warning")
    return
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  const lines = text.split("\n").length
  const letters = (text.match(/[a-zA-Z]/g) || []).length
  const numbers = (text.match(/[0-9]/g) || []).length
  const spaces = (text.match(/\s/g) || []).length
  const special = text.length - letters - numbers - spaces

  const statsHtml = `
<div style="padding: 12px 0;">
  <div style="margin-bottom: 12px; color: #60a5fa; font-weight: 600;">Thống kê chi tiết:</div>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.82rem;">
    <div>Ký tự: <span style="color: #4ade80; font-weight: 600;">${text.length}</span></div>
    <div>Từ: <span style="color: #4ade80; font-weight: 600;">${words}</span></div>
    <div>Dòng: <span style="color: #4ade80; font-weight: 600;">${lines}</span></div>
    <div>Bytes: <span style="color: #4ade80; font-weight: 600;">${new Blob([text]).size}</span></div>
    <div>Chữ cái: <span style="color: #818cf8; font-weight: 600;">${letters}</span></div>
    <div>Số: <span style="color: #818cf8; font-weight: 600;">${numbers}</span></div>
    <div>Khoảng trắng: <span style="color: #818cf8; font-weight: 600;">${spaces}</span></div>
    <div>Ký tự đặc biệt: <span style="color: #818cf8; font-weight: 600;">${special}</span></div>
    <div>Entropy: <span style="color: #fbbf24; font-weight: 600;">${calculateEntropy(text).toFixed(3)} bits</span></div>
  </div>
</div>`
  logToConsole(statsHtml, "ai")
}

function clearConsole() {
  consoleBody.innerHTML = `
    <div class="console-welcome">
      <div class="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
          <circle cx="7.5" cy="14.5" r="1.5"/>
          <circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>
      </div>
      <div class="welcome-text">
        <h3>Console đã được làm mới</h3>
        <p>Sẵn sàng nhận lệnh mới...</p>
      </div>
      <div class="welcome-commands">
        <span class="welcome-cmd" onclick="executeCmd('help')">help</span>
        <span class="welcome-cmd" onclick="executeCmd('analyze')">analyze</span>
        <span class="welcome-cmd" onclick="executeCmd('list')">list</span>
      </div>
    </div>`
}

// Input Handler
function handleInput() {
  const text = input.value
  charCount.textContent = `${text.length} ký tự`
  byteCount.textContent = `${new Blob([text]).size} bytes`

  if (text.trim()) {
    updateConsoleStatus("Đang phân tích...")
    clearTimeout(window.analysisTimeout)
    window.analysisTimeout = setTimeout(() => {
      analyzeInput(text.trim())
    }, 600)
  }
}

function analyzeInput(text) {
  const detected = detectFormat(text)

  const welcome = consoleBody.querySelector(".console-welcome")
  if (welcome) welcome.remove()

  const oldAnalysis = consoleBody.querySelector(".console-analysis")
  if (oldAnalysis) oldAnalysis.remove()

  const analysisBox = document.createElement("div")
  analysisBox.className = "console-analysis"
  analysisBox.innerHTML = `
    <div class="analysis-header">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
      <span>AI Analysis Result</span>
      <span class="analysis-badge">Auto</span>
    </div>
    <div class="analysis-grid">
      <div class="analysis-item">
        <span class="label">Định dạng</span>
        <span class="value detected">${detected.type}</span>
      </div>
      <div class="analysis-item">
        <span class="label">Độ tin cậy</span>
        <span class="value">${detected.confidence}%</span>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${detected.confidence}%"></div>
        </div>
      </div>
      <div class="analysis-item">
        <span class="label">Độ dài</span>
        <span class="value">${text.length} ký tự</span>
      </div>
      <div class="analysis-item">
        <span class="label">Entropy</span>
        <span class="value">${calculateEntropy(text).toFixed(2)} bits</span>
      </div>
    </div>
    ${
      detected.suggestions.length > 0
        ? `
    <div class="analysis-suggestions">
      <span class="label">Gợi ý hành động</span>
      <div class="suggestion-chips">
        ${detected.suggestions.map((s) => `<span class="suggestion-chip" onclick="handleSuggestion('${s.action}', '${s.type}')">${s.label}</span>`).join("")}
      </div>
    </div>`
        : ""
    }
  `

  consoleBody.appendChild(analysisBox)
  consoleBody.scrollTop = consoleBody.scrollHeight
  updateConsoleStatus("Sẵn sàng")
}

function calculateEntropy(text) {
  const freq = {}
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1
  }
  let entropy = 0
  const len = text.length
  for (const char in freq) {
    const p = freq[char] / len
    entropy -= p * Math.log2(p)
  }
  return entropy
}

window.handleSuggestion = (action, type) => {
  if (action === "encode") handleEncode(type)
  else if (action === "decode") handleDecode(type)
  else if (action === "hash") handleHash(type)
}

function detectFormat(text) {
  const detectors = [
    {
      type: "Mã Morse",
      test: /^[.\-\s/]+$/,
      confidence: 92,
      suggestions: [{ label: "Giải mã Morse", action: "decode", type: "morse" }],
    },
    {
      type: "Binary",
      test: /^[01\s]+$/,
      confidence: 95,
      suggestions: [{ label: "Giải mã Binary", action: "decode", type: "binary" }],
    },
    {
      type: "Hex",
      test: /^([0-9a-fA-F]{2}\s?)+$/,
      confidence: 90,
      suggestions: [{ label: "Giải mã Hex", action: "decode", type: "hex" }],
    },
    {
      type: "Base64",
      test: /^[A-Za-z0-9+/]+=*$/,
      confidence: () => {
        try {
          atob(text)
          return 85
        } catch {
          return 40
        }
      },
      suggestions: [{ label: "Giải mã Base64", action: "decode", type: "base64" }],
    },
    {
      type: "URL Encoded",
      test: /%[0-9A-Fa-f]{2}/,
      confidence: 90,
      suggestions: [{ label: "URL Decode", action: "decode", type: "url" }],
    },
    {
      type: "AES Encrypted",
      test: /^U2FsdGVkX1/,
      confidence: 95,
      suggestions: [{ label: "Giải mã AES", action: "decode", type: "aes-decrypt" }],
    },
    {
      type: "MD5 Hash",
      test: /^[a-fA-F0-9]{32}$/,
      confidence: 90,
      suggestions: [],
    },
    {
      type: "SHA256 Hash",
      test: /^[a-fA-F0-9]{64}$/,
      confidence: 90,
      suggestions: [],
    },
    {
      type: "SHA512 Hash",
      test: /^[a-fA-F0-9]{128}$/,
      confidence: 90,
      suggestions: [],
    },
    {
      type: "Văn bản thuần",
      test: /^[\x20-\x7E\u00C0-\u024F\u1EA0-\u1EF9\s]+$/,
      confidence: 70,
      suggestions: [
        { label: "Binary", action: "encode", type: "binary" },
        { label: "Base64", action: "encode", type: "base64" },
        { label: "Morse", action: "encode", type: "morse" },
        { label: "MD5", action: "hash", type: "md5" },
      ],
    },
  ]

  for (const detector of detectors) {
    const testResult = typeof detector.test === "function" ? detector.test() : detector.test.test(text)
    if (testResult) {
      const confidence = typeof detector.confidence === "function" ? detector.confidence() : detector.confidence
      return { type: detector.type, confidence, suggestions: detector.suggestions || [] }
    }
  }

  return { type: "Không xác định", confidence: 0, suggestions: [] }
}

function logToConsole(message, type = "default") {
  const welcome = consoleBody.querySelector(".console-welcome")
  if (welcome) welcome.remove()

  const icons = {
    default: "›",
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✕",
    ai: "✦",
  }

  const now = new Date()
  const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  const line = document.createElement("div")
  line.className = `console-line ${type}`
  line.innerHTML = `
    <span class="line-icon">${icons[type] || icons.default}</span>
    <div class="line-content">
      <span class="line-time">${time}</span>
      <span class="line-text">${message}</span>
    </div>
  `
  consoleBody.appendChild(line)
  consoleBody.scrollTop = consoleBody.scrollHeight

  const lines = consoleBody.querySelectorAll(".console-line")
  while (lines.length > 50) {
    consoleBody.removeChild(lines[0])
  }
}

function updateConsoleStatus(status) {
  const statusText = consoleStatus.querySelector(".status-text")
  if (statusText) statusText.textContent = status
}

// Encoding Functions
function handleEncode(type) {
  const text = input.value
  if (!text) {
    showToast("Vui lòng nhập dữ liệu!", "error")
    return
  }

  if (type === "aes-encrypt") {
    currentAesAction = "encrypt"
    aesModalTitle.textContent = "Mã hóa AES"
    aesModal.classList.add("active")
    aesKeyInput.focus()
    return
  }

  if (type === "caesar-encrypt") {
    currentCaesarAction = "encrypt"
    caesarModalTitle.textContent = "Mã hóa Caesar"
    caesarModal.classList.add("active")
    caesarShiftInput.focus()
    return
  }

  if (type === "vigenere-encrypt") {
    currentVigenereAction = "encrypt"
    vigenereModalTitle.textContent = "Mã hóa Vigenère"
    vigenereModal.classList.add("active")
    vigenereKeyInput.focus()
    return
  }

  let result = ""

  try {
    switch (type) {
      case "binary":
        result = text
          .split("")
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
          .join(" ")
        break
      case "hex":
        result = [...text].map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ")
        break
      case "base64":
        result = btoa(unescape(encodeURIComponent(text)))
        break
      case "url":
        result = encodeURIComponent(text)
        break
      case "rot13":
        result = rot13(text)
        break
      case "rot47":
        result = rot47(text)
        break
      case "morse":
        result = text
          .toUpperCase()
          .split("")
          .map((c) => MORSE_CODE[c] || c)
          .join(" ")
        break
      case "reverse":
        result = text.split("").reverse().join("")
        break
      case "atbash":
        result = atbash(text)
        break
    }

    output.value = result
    logToConsole(`Mã hóa <span class="highlight">${type.toUpperCase()}</span> thành công!`, "success")
    addHistory("Mã hóa", type.toUpperCase())
  } catch (e) {
    output.value = ""
    logToConsole(`Lỗi mã hóa: ${e.message}`, "error")
    showToast("Có lỗi xảy ra!", "error")
  }
}

function handleDecode(type) {
  const text = input.value.trim()
  if (!text) {
    showToast("Vui lòng nhập dữ liệu!", "error")
    return
  }

  if (type === "aes-decrypt") {
    currentAesAction = "decrypt"
    aesModalTitle.textContent = "Giải mã AES"
    aesModal.classList.add("active")
    aesKeyInput.focus()
    return
  }

  if (type === "caesar-decrypt") {
    currentCaesarAction = "decrypt"
    caesarModalTitle.textContent = "Giải mã Caesar"
    caesarModal.classList.add("active")
    caesarShiftInput.focus()
    return
  }

  if (type === "vigenere-decrypt") {
    currentVigenereAction = "decrypt"
    vigenereModalTitle.textContent = "Giải mã Vigenère"
    vigenereModal.classList.add("active")
    vigenereKeyInput.focus()
    return
  }

  let result = ""

  try {
    switch (type) {
      case "binary":
        result = text
          .split(/\s+/)
          .map((b) => String.fromCharCode(Number.parseInt(b, 2)))
          .join("")
        break
      case "hex":
        result = text
          .split(/\s+/)
          .map((h) => String.fromCharCode(Number.parseInt(h, 16)))
          .join("")
        break
      case "base64":
        result = decodeURIComponent(escape(atob(text)))
        break
      case "url":
        result = decodeURIComponent(text)
        break
      case "rot13":
        result = rot13(text)
        break
      case "rot47":
        result = rot47(text)
        break
      case "morse":
        result = text
          .split(" ")
          .map((code) => {
            if (code === "/") return " "
            return MORSE_DECODE[code] || code
          })
          .join("")
        break
      case "reverse":
        result = text.split("").reverse().join("")
        break
      case "atbash":
        result = atbash(text)
        break
    }

    output.value = result
    logToConsole(`Giải mã <span class="highlight">${type.toUpperCase()}</span> thành công!`, "success")
    addHistory("Giải mã", type.toUpperCase())
  } catch (e) {
    output.value = ""
    logToConsole(`Lỗi giải mã: ${e.message}`, "error")
    showToast("Dữ liệu không hợp lệ!", "error")
  }
}

// Cipher Functions
function rot13(text) {
  return text.replace(/[a-zA-Z]/g, (c) =>
    String.fromCharCode(c <= "Z" ? ((c.charCodeAt(0) - 65 + 13) % 26) + 65 : ((c.charCodeAt(0) - 97 + 13) % 26) + 97),
  )
}

function rot47(text) {
  return text
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0)
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(33 + ((code - 33 + 47) % 94))
      }
      return c
    })
    .join("")
}

function atbash(text) {
  return text
    .split("")
    .map((c) => {
      if (/[a-z]/.test(c)) return String.fromCharCode(122 - (c.charCodeAt(0) - 97))
      if (/[A-Z]/.test(c)) return String.fromCharCode(90 - (c.charCodeAt(0) - 65))
      return c
    })
    .join("")
}

function caesarCipher(text, shift) {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base)
  })
}

function vigenereCipher(text, key, decrypt = false) {
  key = key.toUpperCase().replace(/[^A-Z]/g, "")
  if (!key) throw new Error("Key không hợp lệ")

  let keyIndex = 0
  return text
    .split("")
    .map((c) => {
      if (/[a-zA-Z]/.test(c)) {
        const base = c <= "Z" ? 65 : 97
        const shift = key.charCodeAt(keyIndex % key.length) - 65
        const actualShift = decrypt ? 26 - shift : shift
        keyIndex++
        return String.fromCharCode(((c.charCodeAt(0) - base + actualShift) % 26) + base)
      }
      return c
    })
    .join("")
}

// Hash Functions
function handleHash(type) {
  const text = input.value
  if (!text) {
    showToast("Vui lòng nhập dữ liệu!", "error")
    return
  }

  let result = ""
  switch (type) {
    case "md5":
      result = CryptoJS.MD5(text).toString()
      break
    case "sha256":
      result = CryptoJS.SHA256(text).toString()
      break
    case "sha512":
      result = CryptoJS.SHA512(text).toString()
      break
  }

  output.value = result
  logToConsole(`Tạo hash <span class="highlight">${type.toUpperCase()}</span> thành công!`, "success")
  addHistory("Hash", type.toUpperCase())
}

// Modal Functions
function confirmAes() {
  const key = aesKeyInput.value
  if (!key) {
    showToast("Vui lòng nhập key!", "error")
    return
  }

  const text = input.value

  try {
    if (currentAesAction === "encrypt") {
      const encrypted = CryptoJS.AES.encrypt(text, key).toString()
      output.value = encrypted
      logToConsole('Mã hóa <span class="highlight">AES</span> thành công!', "success")
      addHistory("Mã hóa", "AES")
    } else {
      const decrypted = CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8)
      if (!decrypted) throw new Error("Key không đúng")
      output.value = decrypted
      logToConsole('Giải mã <span class="highlight">AES</span> thành công!', "success")
      addHistory("Giải mã", "AES")
    }
    closeAesModal()
    showToast("Thành công!", "success")
  } catch (e) {
    logToConsole(`Lỗi AES: ${e.message}`, "error")
    showToast("Key không đúng hoặc dữ liệu không hợp lệ!", "error")
  }
}

function closeAesModal() {
  aesModal.classList.remove("active")
  aesKeyInput.value = ""
  currentAesAction = null
}

function confirmCaesar() {
  const shift = Number.parseInt(caesarShiftInput.value) || 3
  if (shift < 1 || shift > 25) {
    showToast("Số dịch chuyển phải từ 1-25!", "error")
    return
  }

  const text = input.value

  try {
    if (currentCaesarAction === "encrypt") {
      output.value = caesarCipher(text, shift)
      logToConsole(`Mã hóa <span class="highlight">Caesar (shift: ${shift})</span> thành công!`, "success")
      addHistory("Mã hóa", `Caesar-${shift}`)
    } else {
      output.value = caesarCipher(text, 26 - shift)
      logToConsole(`Giải mã <span class="highlight">Caesar (shift: ${shift})</span> thành công!`, "success")
      addHistory("Giải mã", `Caesar-${shift}`)
    }
    closeCaesarModal()
    showToast("Thành công!", "success")
  } catch (e) {
    logToConsole(`Lỗi Caesar: ${e.message}`, "error")
    showToast("Có lỗi xảy ra!", "error")
  }
}

function closeCaesarModal() {
  caesarModal.classList.remove("active")
  caesarShiftInput.value = "3"
  currentCaesarAction = null
}

function confirmVigenere() {
  const key = vigenereKeyInput.value.trim()
  if (!key || !/^[a-zA-Z]+$/.test(key)) {
    showToast("Key chỉ được chứa chữ cái!", "error")
    return
  }

  const text = input.value

  try {
    if (currentVigenereAction === "encrypt") {
      output.value = vigenereCipher(text, key, false)
      logToConsole(`Mã hóa <span class="highlight">Vigenère (key: ${key.toUpperCase()})</span> thành công!`, "success")
      addHistory("Mã hóa", `Vigenère`)
    } else {
      output.value = vigenereCipher(text, key, true)
      logToConsole(`Giải mã <span class="highlight">Vigenère (key: ${key.toUpperCase()})</span> thành công!`, "success")
      addHistory("Giải mã", `Vigenère`)
    }
    closeVigenereModal()
    showToast("Thành công!", "success")
  } catch (e) {
    logToConsole(`Lỗi Vigenère: ${e.message}`, "error")
    showToast("Có lỗi xảy ra!", "error")
  }
}

function closeVigenereModal() {
  vigenereModal.classList.remove("active")
  vigenereKeyInput.value = ""
  currentVigenereAction = null
}

// Utility Functions
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    handleInput()
    logToConsole("Đã dán dữ liệu từ clipboard", "success")
    showToast("Đã dán!", "success")
  } catch (e) {
    showToast("Không thể truy cập clipboard!", "error")
  }
}

function copyResult() {
  if (!output.value) {
    showToast("Không có dữ liệu để copy!", "error")
    return
  }
  navigator.clipboard.writeText(output.value)
  logToConsole("Đã copy kết quả vào clipboard", "success")
  showToast("Đã copy!", "success")
  addHistory("Copy", "Clipboard")
}

function exportTxt() {
  if (!output.value) {
    showToast("Không có dữ liệu để export!", "error")
    return
  }
  const blob = new Blob([output.value], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `chuyen-ma-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  logToConsole("Đã export file TXT", "success")
  showToast("Đã tải file!", "success")
  addHistory("Export", "TXT")
}

function exportJson() {
  if (!output.value) {
    showToast("Không có dữ liệu để export!", "error")
    return
  }
  const data = {
    input: input.value,
    output: output.value,
    timestamp: new Date().toISOString(),
    generator: "Chuyển Mã Pro v4.0 by nguyên.dev",
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `chuyen-ma-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  logToConsole("Đã export file JSON", "success")
  showToast("Đã tải file!", "success")
  addHistory("Export", "JSON")
}

function clearAll() {
  input.value = ""
  output.value = ""
  charCount.textContent = "0 ký tự"
  byteCount.textContent = "0 bytes"
  logToConsole("Đã xóa tất cả dữ liệu", "warning")
  showToast("Đã xóa!", "success")
}

// History Functions
function addHistory(action, type) {
  const now = new Date()
  const time = now.toLocaleTimeString("vi-VN")
  const li = document.createElement("li")
  li.innerHTML = `
    <span class="history-time">${time}</span>
    <span class="history-action">${action}</span>
    <span class="history-type">${type}</span>
  `
  historyList.insertBefore(li, historyList.firstChild)
  while (historyList.children.length > 50) {
    historyList.removeChild(historyList.lastChild)
  }
  saveHistory()
}

function saveHistory() {
  const items = []
  historyList.querySelectorAll("li").forEach((li) => items.push(li.innerHTML))
  localStorage.setItem("history", JSON.stringify(items))
}

function loadHistory() {
  const saved = localStorage.getItem("history")
  if (saved) {
    const items = JSON.parse(saved)
    items.forEach((html) => {
      const li = document.createElement("li")
      li.innerHTML = html
      historyList.appendChild(li)
    })
  }
}

function clearHistory() {
  historyList.innerHTML = ""
  localStorage.removeItem("history")
  logToConsole("Đã xóa lịch sử", "warning")
  showToast("Đã xóa lịch sử!", "success")
}

// Toast Notification
function showToast(message, type = "success") {
  toast.className = `toast ${type} show`
  toast.querySelector(".toast-icon").textContent = type === "success" ? "✓" : "✕"
  toast.querySelector(".toast-message").textContent = message
  setTimeout(() => toast.classList.remove("show"), 3000)
}
