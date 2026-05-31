const urls = process.argv.slice(2);

(async () => {
  for (const url of urls) {
    const text = await (await fetch(url)).text();
    const assets = Array.from(text.matchAll(/assets\/(index-[^"]+)/g)).map((match) => match[1]);
    console.log(`${url} ${assets.join(", ")}`);
  }
})();
