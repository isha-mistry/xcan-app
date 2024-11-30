export function redirectionInNewTab(url: any) {
  window.open(url, "_blank", "noopener, noreferrer");
}

// const link = document.createElement('a');
// link.href = url;
// link.target = '_blank';
// link.rel = 'noopener noreferrer';
// link.click();
