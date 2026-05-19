import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  PanResponder,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { X, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// We use a square container for the cropping view
const containerSize = screenWidth; 

export default function ImageCropper({
  visible,
  imageUri,
  imageWidth,
  imageHeight,
  aspectRatio = 16 / 9,
  onCancel,
  onCropComplete
}) {
  const [naturalWidth, setNaturalWidth] = useState(imageWidth || 0);
  const [naturalHeight, setNaturalHeight] = useState(imageHeight || 0);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const maxScale = 3;

  // Retrieve natural width and height if not supplied
  useEffect(() => {
    if (!visible || !imageUri) return;

    if (imageWidth && imageHeight) {
      setNaturalWidth(imageWidth);
      setNaturalHeight(imageHeight);
      setScale(1);
      setPanX(0);
      setPanY(0);
      return;
    }

    setLoading(true);
    Image.getSize(
      imageUri,
      (w, h) => {
        setNaturalWidth(w);
        setNaturalHeight(h);
        setScale(1);
        setPanX(0);
        setPanY(0);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to get natural dimensions of image:', err);
        setLoading(false);
        Alert.alert('Lỗi nạp ảnh', 'Không thể đọc kích thước của bức ảnh được chọn.');
      }
    );
  }, [visible, imageUri, imageWidth, imageHeight]);

  // Compute layout sizes
  const cropWidth = containerSize - 40;
  const cropHeight = cropWidth / aspectRatio;

  const R_img = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1;
  const R_crop = aspectRatio;

  let baselineW = 0;
  let baselineH = 0;

  if (naturalWidth > 0 && naturalHeight > 0) {
    if (R_img > R_crop) {
      // Image is wider than crop box
      baselineH = cropHeight;
      baselineW = cropHeight * R_img;
    } else {
      // Image is taller than crop box
      baselineW = cropWidth;
      baselineH = cropWidth / R_img;
    }
  }

  const renderedW = baselineW * scale;
  const renderedH = baselineH * scale;

  // Store variables in ref for PanResponder callback to avoid stale states
  const stateRef = useRef({ scale, panX, panY, baselineW, baselineH, cropWidth, cropHeight });
  useEffect(() => {
    stateRef.current = { scale, panX, panY, baselineW, baselineH, cropWidth, cropHeight };
  }, [scale, panX, panY, baselineW, baselineH, cropWidth, cropHeight]);

  const initialPanX = useRef(0);
  const initialPanY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        initialPanX.current = stateRef.current.panX;
        initialPanY.current = stateRef.current.panY;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { baselineW, baselineH, cropWidth, cropHeight, scale } = stateRef.current;
        if (baselineW === 0 || baselineH === 0) return;

        const targetX = initialPanX.current + gestureState.dx;
        const targetY = initialPanY.current + gestureState.dy;

        const maxPanX = (baselineW * scale - cropWidth) / 2;
        const maxPanY = (baselineH * scale - cropHeight) / 2;

        setPanX(Math.max(-maxPanX, Math.min(maxPanX, targetX)));
        setPanY(Math.max(-maxPanY, Math.min(maxPanY, targetY)));
      }
    })
  ).current;

  // Enforce bounds protection on scale change
  useEffect(() => {
    if (baselineW === 0 || baselineH === 0) return;

    const maxPanX = (baselineW * scale - cropWidth) / 2;
    const maxPanY = (baselineH * scale - cropHeight) / 2;

    const clampedX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    const clampedY = Math.max(-maxPanY, Math.min(maxPanY, panY));

    if (clampedX !== panX || clampedY !== panY) {
      setPanX(clampedX);
      setPanY(clampedY);
    }
  }, [scale, baselineW, baselineH, cropWidth, cropHeight]);

  // Execute native crop action
  const handleCrop = async () => {
    if (naturalWidth === 0 || naturalHeight === 0 || loading) return;

    setLoading(true);
    try {
      // Calculate crop coordinates
      const R_pixel = naturalWidth / renderedW;
      
      const offsetX_screen = (renderedW - cropWidth) / 2 - panX;
      const offsetY_screen = (renderedH - cropHeight) / 2 - panY;

      const originX = Math.max(0, Math.round(offsetX_screen * R_pixel));
      const originY = Math.max(0, Math.round(offsetY_screen * R_pixel));
      const width = Math.min(naturalWidth - originX, Math.round(cropWidth * R_pixel));
      const height = Math.min(naturalHeight - originY, Math.round(cropHeight * R_pixel));

      console.log('Manipulator Crop Dimensions:', { originX, originY, width, height });

      const actions = [
        {
          crop: {
            originX,
            originY,
            width,
            height
          }
        }
      ];

      const result = await ImageManipulator.manipulateAsync(imageUri, actions, {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG
      });

      onCropComplete(result.uri);
    } catch (error) {
      console.error('Image crop manipulation failed:', error);
      Alert.alert('Lỗi cắt ảnh', 'Không thể thực hiện cắt ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const adjustScale = (amount) => {
    setScale((prev) => Math.max(1, Math.min(maxScale, prev + amount)));
  };

  // Slider layout touch handler
  const handleSliderTouch = (event) => {
    const trackWidth = screenWidth - 140;
    const startX = 70; // estimated left padding of track
    const pageX = event.nativeEvent.pageX;
    const relativeX = pageX - startX;
    const pct = Math.max(0, Math.min(1, relativeX / trackWidth));
    setScale(1 + pct * (maxScale - 1));
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBg}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.iconBtn}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cắt Ảnh Chuẩn Tỷ Lệ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* LOADING INDICATOR */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
          </View>
        )}

        {/* CROP WORKSPACE */}
        <View style={styles.workspace}>
          <View style={styles.container} {...panResponder.panHandlers}>
            {/* IMAGE */}
            {imageUri && naturalWidth > 0 && (
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.image,
                  {
                    width: renderedW,
                    height: renderedH,
                    transform: [{ translateX: panX }, { translateY: panY }]
                  }
                ]}
                resizeMode="cover"
              />
            )}

            {/* SEMI-TRANSPARENT MASK */}
            <View style={[styles.mask, styles.maskTop, { height: (containerSize - cropHeight) / 2 }]} pointerEvents="none" />
            <View style={[styles.mask, styles.maskBottom, { height: (containerSize - cropHeight) / 2 }]} pointerEvents="none" />
            <View
              style={[
                styles.mask,
                styles.maskLeft,
                {
                  width: (containerSize - cropWidth) / 2,
                  height: cropHeight,
                  top: (containerSize - cropHeight) / 2
                }
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.mask,
                styles.maskRight,
                {
                  width: (containerSize - cropWidth) / 2,
                  height: cropHeight,
                  top: (containerSize - cropHeight) / 2
                }
              ]}
              pointerEvents="none"
            />

            {/* CROP BORDER BOX */}
            <View
              style={[
                styles.cropBorderBox,
                {
                  width: cropWidth,
                  height: cropHeight,
                  top: (containerSize - cropHeight) / 2,
                  left: (containerSize - cropWidth) / 2
                }
              ]}
              pointerEvents="none"
            >
              {/* Corner indicators for cool visual feedback */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controlsContainer}>
          <Text style={styles.hintText}>Kéo để di chuyển, dùng thanh trượt hoặc nút để phóng to</Text>

          {/* ZOOM SLIDER & BUTTONS */}
          <View style={styles.zoomContainer}>
            <TouchableOpacity onPress={() => adjustScale(-0.1)} style={styles.zoomBtn}>
              <ZoomOut size={16} color="#94a3b8" />
            </TouchableOpacity>
            
            <View 
              style={styles.sliderTrack}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handleSliderTouch}
              onResponderMove={handleSliderTouch}
            >
              <View style={[styles.sliderThumb, { left: `${((scale - 1) / (maxScale - 1)) * 100}%` }]} />
            </View>

            <TouchableOpacity onPress={() => adjustScale(0.1)} style={styles.zoomBtn}>
              <ZoomIn size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* PRESETS */}
          <View style={styles.presetRow}>
            {[1.0, 1.5, 2.0, 2.5].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.presetChip, Math.abs(scale - p) < 0.05 && styles.activePresetChip]}
                onPress={() => setScale(p)}
              >
                <Text style={[styles.presetText, Math.abs(scale - p) < 0.05 && styles.activePresetText]}>
                  {p.toFixed(1)}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CONFIRM BUTTON */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleCrop} disabled={loading}>
            <CheckCircle2 size={18} color="#fff" />
            <Text style={styles.confirmBtnText}>Xác nhận cắt ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'space-between',
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#1e293b'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12
  },
  workspace: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: containerSize,
    height: containerSize,
    backgroundColor: '#020617',
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: 0,
    // Note: rendered height and width will override these
  },
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(2, 6, 23, 0.75)'
  },
  maskTop: {
    top: 0,
    left: 0,
    right: 0
  },
  maskBottom: {
    bottom: 0,
    left: 0,
    right: 0
  },
  maskLeft: {
    left: 0
  },
  maskRight: {
    right: 0
  },
  cropBorderBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#06b6d4'
  },
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#06b6d4'
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3
  },
  controlsContainer: {
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  hintText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  zoomBtn: {
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginHorizontal: 12,
    position: 'relative',
    justifyContent: 'center'
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#06b6d4',
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -9
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  activePresetChip: {
    backgroundColor: '#06b6d420',
    borderColor: '#06b6d4'
  },
  presetText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500'
  },
  activePresetText: {
    color: '#06b6d4',
    fontWeight: 'bold'
  },
  confirmBtn: {
    backgroundColor: '#06b6d4',
    height: 48,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
