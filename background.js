let capturedData = [];

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = details.url;
    if (url.includes(".m3u8")) {
      let title = "Unknown Title";
      
      // tabIdからタブの情報を取得
      if (details.tabId >= 0) {
        try {
          const tab = await chrome.tabs.get(details.tabId);
          title = tab.title; // ここでHTMLの<title>タグの内容が取れます
        } catch (e) {
          console.error("Tab not found", e);
        }
      }

      const entry = {
        timestamp: new Date().toISOString(),
        title: title, // ページのタイトル
        url: url,
        method: details.method
      };
      
      capturedData.push(entry);
      console.log("Captured with Title:", entry);
    }
  },
  { urls: ["<all_urls>"] }
);

// ダウンロード処理（前回と同じ）
chrome.action.onClicked.addListener(() => {
  if (capturedData.length === 0) return;
  const jsonlContent = capturedData.map(item => JSON.stringify(item)).join("\n");
  const blob = new Blob([jsonlContent], { type: "application/x-jsonlines" });
  const reader = new FileReader();
  reader.onloadend = () => {
    chrome.downloads.download({
      url: reader.result,
      filename: `captured_m3u8_${Date.now()}.jsonl`
    });
  };
  reader.readAsDataURL(blob);
});
