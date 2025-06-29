import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';

/**
 * Extended MIME type mapping
 */
const mimeFallback = {
  // Text formats
  txt: 'text/plain',
  csv: 'text/csv',
  html: 'text/html',
  xml: 'text/xml',
  json: 'application/json',
  md: 'text/markdown',
  
  // Document formats
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Audio formats
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  aac: 'audio/aac',
};

/**
 * Generate random filename with extension
 */
function generateRandomFileName(ext) {
  return `${crypto.randomBytes(16).toString('hex')}.${ext}`;
}

/**
 * Get MIME type and extension from Buffer
 */
async function getFileInfo(buffer, originalExt = '') {
  let fileInfo = await fileTypeFromBuffer(buffer);
  
  // If fileTypeFromBuffer fails, try to determine from original extension
  if (!fileInfo && originalExt) {
    const mime = mimeFallback[originalExt.toLowerCase()];
    if (mime) {
      fileInfo = { ext: originalExt, mime };
    }
  }
  
  // Fallback to octet-stream if still no match
  return fileInfo || { ext: originalExt || 'bin', mime: 'application/octet-stream' };
}

/**
 * Upload file or image to Maelyn CDN from buffer or local file path
 */
async function uploadToMaelyn(file) {
  const formData = new FormData();

  try {
    if (Buffer.isBuffer(file)) {
      const fileInfo = await getFileInfo(file);
      const randomFileName = generateRandomFileName(fileInfo.ext);
      formData.append('file', file, { 
        filename: randomFileName, 
        contentType: fileInfo.mime 
      });

    } else if (typeof file === 'string') {
      if (!fs.existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }

      const ext = path.extname(file).slice(1).toLowerCase();
      const buffer = fs.readFileSync(file);
      const fileInfo = await getFileInfo(buffer, ext);
      const randomFileName = generateRandomFileName(fileInfo.ext);

      formData.append('file', fs.createReadStream(file), { 
        filename: randomFileName,
        contentType: fileInfo.mime
      });

    } else {
      throw new Error('Invalid file input. Must be a Buffer or file path (string).');
    }

    const response = await axios.post('https://cdn.maelyn.sbs/api/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data.error) throw new Error(response.data.error);
    console.log('✅ File uploaded successfully:', response.data.data.url);
    return response.data.data.url;

  } catch (error) {
    console.error('❌ Error uploading file:', error.message);
    throw error;
  }
}


// 🔗 Ekspor dengan format sesuai permintaan
const cdn = {
  maelyn: uploadToMaelyn,
};

export default cdn;
// 