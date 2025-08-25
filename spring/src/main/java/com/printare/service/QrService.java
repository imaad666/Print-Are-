package com.printare.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.google.zxing.common.BitMatrix;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

@Service
public class QrService {

    private final int size;
    private final ErrorCorrectionLevel ecc;

    public QrService(
            @Value("${printare.qr.size:320}") int size,
            @Value("${printare.qr.ecc:H}") String ecc
    ) {
        this.size = size;
        this.ecc = ErrorCorrectionLevel.valueOf(ecc);
    }

    public String generateDataUrl(String text) throws Exception {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ecc);
        hints.put(EncodeHintType.MARGIN, 2);

        BitMatrix matrix = encode(text, hints);
        BufferedImage image = toImage(matrix, Color.BLACK, Color.WHITE);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(image, "png", baos);
            String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            return "data:image/png;base64," + base64;
        }
    }

    private BitMatrix encode(String text, Map<EncodeHintType, Object> hints) throws WriterException {
        QRCodeWriter writer = new QRCodeWriter();
        return writer.encode(text, BarcodeFormat.QR_CODE, size, size, hints);
    }

    private BufferedImage toImage(BitMatrix matrix, Color dark, Color light) {
        int width = matrix.getWidth();
        int height = matrix.getHeight();
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                image.setRGB(x, y, matrix.get(x, y) ? dark.getRGB() : light.getRGB());
            }
        }
        return image;
    }
}


