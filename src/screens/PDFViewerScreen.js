import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';

const PDFViewerScreen = ({ navigation, route }) => {
  const { uri, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [scale, setScale] = useState(1.5);
  const webViewRef = React.useRef(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        // Check if it's a local file
        if (uri.startsWith('file://') || uri.startsWith(FileSystem.documentDirectory)) {
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setPdfBase64(base64);
        }
      } catch (error) {
        setError('Failed to load PDF: ' + error.message);
      }
    };

    loadPDF();
  }, [uri]);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description);
    setLoading(false);
  };

  const handleZoomIn = () => {
    const newScale = scale + 0.2;
    setScale(newScale);
    webViewRef.current?.injectJavaScript(`
      window.zoomScale = ${newScale};
      window.renderPDF();
    `);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.5, scale - 0.2);
    setScale(newScale);
    webViewRef.current?.injectJavaScript(`
      window.zoomScale = ${newScale};
      window.renderPDF();
    `);
  };

  const handleDownload = async () => {
    try {
      const fileName = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf` : 'document.pdf';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const { uri: localUri } = await downloadResumable.downloadAsync();
      Alert.alert('Success', `PDF saved to: ${localUri}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download PDF: ' + error.message);
    }
  };

  // Create PDF viewer HTML using PDF.js
  const createPDFViewerHTML = (pdfUri, base64Data) => {
    const pdfData = base64Data 
      ? `data:application/pdf;base64,${base64Data}`
      : pdfUri;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
              background-color: #525659;
              touch-action: manipulation;
            }
            #viewer {
              width: 100%;
              height: 100%;
              overflow: auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              -webkit-overflow-scrolling: touch;
            }
            .page {
              margin-bottom: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              background-color: white;
              transform-origin: center center;
            }
            .loading {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-family: Arial, sans-serif;
            }
            #page-counter {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background-color: rgba(0, 0, 0, 0.5);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 600;
              z-index: 1000;
            }
          </style>
        </head>
        <body>
          <div id="viewer">
            <div class="loading">Loading PDF...</div>
          </div>
          <div id="page-counter">Page 1 of 1</div>
          <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc = null;
            window.zoomScale = ${scale};
            let currentScale = ${scale};
            let startDistance = 0;
            let startScale = ${scale};
            let isPinching = false;
            let currentPage = 1;
            let totalPages = 0;
            
            async function renderPDF() {
              if (!pdfDoc) return;
              
              const viewer = document.getElementById('viewer');
              viewer.innerHTML = '';
              totalPages = pdfDoc.numPages;
              
              // Update page counter
              updatePageCounter();
              
              for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                const viewport = page.getViewport({ scale: currentScale });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.className = 'page';
                canvas.id = 'page-' + pageNum;
                
                await page.render({
                  canvasContext: context,
                  viewport: viewport
                }).promise;
                
                viewer.appendChild(canvas);
              }
            }

            function updatePageCounter() {
              const counter = document.getElementById('page-counter');
              if (counter) {
                counter.textContent = \`Page \${currentPage} of \${totalPages}\`;
              }
            }

            function handleScroll() {
              const viewer = document.getElementById('viewer');
              const pages = document.getElementsByClassName('page');
              const viewerRect = viewer.getBoundingClientRect();
              const viewerCenter = viewerRect.top + viewerRect.height / 2;

              let closestPage = 1;
              let minDistance = Infinity;

              for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const pageRect = page.getBoundingClientRect();
                const pageCenter = pageRect.top + pageRect.height / 2;
                const distance = Math.abs(pageCenter - viewerCenter);

                if (distance < minDistance) {
                  minDistance = distance;
                  closestPage = i + 1;
                }
              }

              if (currentPage !== closestPage) {
                currentPage = closestPage;
                updatePageCounter();
              }
            }

            function getDistance(touch1, touch2) {
              const dx = touch1.clientX - touch2.clientX;
              const dy = touch1.clientY - touch2.clientY;
              return Math.sqrt(dx * dx + dy * dy);
            }

            function handleTouchStart(e) {
              if (e.touches.length === 2) {
                e.preventDefault();
                isPinching = true;
                startDistance = getDistance(e.touches[0], e.touches[1]);
                startScale = currentScale;
              }
            }

            function handleTouchMove(e) {
              if (!isPinching || e.touches.length !== 2) return;
              
              e.preventDefault();
              const currentDistance = getDistance(e.touches[0], e.touches[1]);
              const scale = (currentDistance / startDistance) * startScale;
              
              // Limit zoom between 0.5 and 3
              currentScale = Math.max(0.5, Math.min(3, scale));
              window.zoomScale = currentScale;
              
              // Use requestAnimationFrame for smooth rendering
              requestAnimationFrame(() => {
                renderPDF();
              });
            }

            function handleTouchEnd(e) {
              isPinching = false;
            }
            
            async function loadPDF() {
              try {
                const loadingTask = pdfjsLib.getDocument('${pdfData}');
                pdfDoc = await loadingTask.promise;
                totalPages = pdfDoc.numPages;
                window.renderPDF = renderPDF;
                
                // Update the page counter immediately after loading
                const counter = document.getElementById('page-counter');
                if (counter) {
                  counter.textContent = \`Page 1 of \${totalPages}\`;
                }
                
                await renderPDF();

                // Add touch event listeners for pinch zoom
                const viewer = document.getElementById('viewer');
                viewer.addEventListener('touchstart', handleTouchStart, { passive: false });
                viewer.addEventListener('touchmove', handleTouchMove, { passive: false });
                viewer.addEventListener('touchend', handleTouchEnd);
                viewer.addEventListener('touchcancel', handleTouchEnd);
                
                // Add scroll listener for page tracking
                viewer.addEventListener('scroll', handleScroll);
              } catch (error) {
                document.getElementById('viewer').innerHTML = 
                  '<div style="color: white; text-align: center; padding: 20px;">' +
                  'Error loading PDF: ' + error.message + '<br>' +
                  '<a href="${pdfData}" style="color: #4f5ef7;">Download PDF</a>' +
                  '</div>';
              }
            }
            
            loadPDF();
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Ionicons name="remove" size={24} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Ionicons name="add" size={24} color="#222" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
          <Ionicons name="download-outline" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f5ef7" />
        </View>
      )}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: createPDFViewerHTML(uri, pdfBase64) }}
          style={styles.pdf}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          scrollEnabled={true}
          bounces={true}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
  },
  zoomButton: {
    padding: 8,
  },
  pdf: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default PDFViewerScreen;