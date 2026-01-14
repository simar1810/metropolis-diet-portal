"use server";
import https from "https"
import http from "http"

export async function getBase64ImageFromUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(imageUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    client.get(imageUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get image. Status code: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'];
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
        resolve(base64);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}