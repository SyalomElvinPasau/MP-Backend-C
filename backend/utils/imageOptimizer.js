import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function optimizeUserImage(tempPath, finalFileName, uploadDir) {
    const finalPath = path.join(uploadDir, finalFileName);
    
    try {
        // Pastikan direktori tujuan ada
        await fs.mkdir(uploadDir, { recursive: true });

        // 1. Proses Kompresi dan Konversi menggunakan Sharp
        await sharp(tempPath)
            // Resize: Maksimal lebar 1200px.
            .resize({ width: 1200, withoutEnlargement: true }) 
            
            // Konversi ke WebP, kualitas 80 
            .webp({ quality: 80 }) 
            
            // Simpan ke lokasi final
            .toFile(finalPath);

        // 2. Hapus file gambar asli yang diunggah oleh Formidable 
        await fs.unlink(tempPath);

        console.log(`[Optimasi Gambar] Berhasil: ${finalFileName}`);
        return finalFileName;
        
    } catch (error) {
        console.error(`[Optimasi Gambar] Gagal memproses gambar: ${tempPath}`, error);
        
        // Coba hapus temp file jika proses gagal
        try {
            await fs.unlink(tempPath);
        } catch (e) { 
            // Abaikan error jika file sudah terhapus
        }
        return null;
    }
}