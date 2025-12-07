const input = document.getElementById("inputText");
const output = document.getElementById("outputText");
const detect = document.getElementById("detect");

input.addEventListener("input", () => {
    autoDetect();
    realTimeConvert();
});


function autoDetect() {
    const t = input.value.trim();

    if (!t) return detect.innerText = "Đang chờ nhập...";

    if (/^[01\s]+$/.test(t)) return detect.innerText = "Nhận dạng: Binary";
    if (/^[0-9a-fA-F\s]+$/.test(t)) return detect.innerText = "Nhận dạng: Hex";
    if (/^[A-Za-z0-9+/=]+$/.test(t)) return detect.innerText = "Nhận dạng: Base64";
    if (/%[0-9A-Fa-f]{2}/.test(t)) return detect.innerText = "Nhận dạng: URL Encode";
    if (/^[A-Za-z]+$/.test(t)) return detect.innerText = "Nhận dạng: Văn bản / ROT13";

    detect.innerText = "Không rõ định dạng";
}

function realTimeConvert() {
    const mode = detect.innerText;

    if (mode.includes("Binary")) reverseConvert("binary");
    else if (mode.includes("Hex")) reverseConvert("hex");
    else if (mode.includes("Base64")) reverseConvert("base64");
    else if (mode.includes("URL Encode")) reverseConvert("url");
}



function convert(type) {
    const text = input.value;
    let out = "";

    switch (type) {
        case "binary":
            out = text.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
            break;
        case "hex":
            out = [...text].map(c => c.charCodeAt(0).toString(16)).join(" ");
            break;
        case "base64":
            out = btoa(unescape(encodeURIComponent(text)));
            break;
        case "url":
            out = encodeURIComponent(text);
            break;
            case "aes-en":
            out = prompt("AES Key:");
            out.value = CryptoJS.AES.encrypt(text).toString();
            break;
        case "rot13":
            out = text.replace(/[a-zA-Z]/g, c =>
                String.fromCharCode(
                    c <= "Z"
                        ? (c.charCodeAt(0) - 65 + 13) % 26 + 65
                        : (c.charCodeAt(0) - 97 + 13) % 26 + 97
                )
            );
            break;
    }

    output.value = out;
    addHistory(`Convert (${type})`);
}

function reverseConvert(type) {
    const text = input.value;
    let out = "";

    try {
        switch (type) {
            case "binary":
                out = text.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("");
                break;
            case "hex":
                out = text.split(" ").map(h => String.fromCharCode(parseInt(h, 16))).join("");
                break;
            case "base64":
                out = decodeURIComponent(escape(atob(text)));
                break;
            case "url":
                out = decodeURIComponent(text);
                break;
            case "rot13":
                out = convert("rot13");
                break;
                 case "aes-de":
                 output.value = CryptoJS.AES.decrypt(text).toString(CryptoJS.enc.Utf8);
                break;
        }
    } catch (e) {
        out = "Khó cho tôi!";
    }

    output.value = out;
    addHistory(`Decode (${type})`);
}

function hashText(type) {
    const text = input.value;
    let out = "";

    out = type === "md5"
        ? CryptoJS.MD5(text).toString()
        : CryptoJS.SHA256(text).toString();

    output.value = out;
    addHistory(`Hash (${type})`);
}



function copyResult() {
    output.select();
    document.execCommand("copy");
    addHistory("Copy");
}



function exportTxt() {
    const blob = new Blob([output.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "export.txt";
    a.click();

    addHistory("Export TXT");
}

function exportJson() {
    const data = { input: input.value, output: output.value, time: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "export.json";
    a.click();

    addHistory("Export JSON");
}


const historyList = document.getElementById("historyList");

function addHistory(action) {
    const item = document.createElement("li");
    item.innerText = `[${new Date().toLocaleTimeString()}] ${action}`;
    historyList.prepend(item);

    saveHistory();
}

function saveHistory() {
    localStorage.setItem("history", historyList.innerHTML);
}

function loadHistory() {
    const h = localStorage.getItem("history");
    if (h) historyList.innerHTML = h;
}

loadHistory();


document.getElementById("modeToggle")
    .addEventListener("change", () => document.body.classList.toggle("light"));

