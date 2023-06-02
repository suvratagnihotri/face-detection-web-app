import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useOpenCv } from 'opencv-react'; // Import the useOpenCv hook
import classifierXml from './haarcascade_frontalface_default.xml';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [classifierData, setClassifierData] = useState(null);
  const { cv } = useOpenCv(); // Access the OpenCV instance

  const startCamera = () => {
    setIsCameraOn(true);
  };

  const captureImage = () => {
    const videoElement = videoRef.current.video;
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    // Set canvas dimensions to match the video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    setIsCameraOn(false);
    videoElement.srcObject.getTracks().forEach((track) => track.stop());

    setIsImageCaptured(true);
    canvasRef.current = canvasElement;
  };

  const detectFaces = () => {
    const imgElement = canvasRef.current;
    const src = cv.imread(imgElement);
    
    // Convert the image to gray scale for face detection
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Load the pre-trained face detection classifier
    const classifier = new cv.CascadeClassifier();
    let location = cv.HAAR_FRONTALFACE_DEFAULT;
    // classifier.load(location); 
    classifier.load(classifierXml);

    // Detect faces in the image
    const faces = new cv.RectVector();
    classifier.detectMultiScale(gray, faces);

    // Draw rectangles around the detected faces
    for (let i = 0; i < faces.size(); i++) {
      const faceRect = faces.get(i);
      const point1 = new cv.Point(faceRect.x, faceRect.y);
      const point2 = new cv.Point(faceRect.x + faceRect.width, faceRect.y + faceRect.height);
      cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
    }

    // Display the result
    cv.imshow(canvasRef.current, src);
    
    // Clean up
    src.delete();
    gray.delete();
    classifier.delete();
    faces.delete();
  };

  useEffect(() => {
    console.log('Initializing camera...');
    startCamera();
    console.log('Camera initialized.');
    const loadClassifier = async () => {
      try {
        const response = await fetch('/haarcascade_frontalface_default.xml');
        const xmlData = await response.text();
        const blob = new Blob([xmlData], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        setClassifierData(url);
      } catch (error) {
        console.error('Error loading XML file:', error);
      }
    };
  
    loadClassifier();
  }, []);

  return (
    <div className="app">
      <h1 className="title">Face Detection Web App</h1>
      {isCameraOn && (
        <div className="camera-container">
          <Webcam className="video" ref={videoRef} mirrored={true} />
        </div>
      )}
      {isImageCaptured ? (
        <div className="camera-container">
          <img className="video" src={canvasRef.current?.toDataURL()} alt="Captured" crossOrigin="anonymous" />
        </div>
      ) : (
        <div className="button-container">
          <button className="capture-button" onClick={captureImage}>
            Capture
          </button>
        </div>
      )}
      {isImageCaptured && (
        <div className="button-container">
          <button className="detect-button" onClick={detectFaces}>
            Detect Face
          </button>
        </div>
      )}
    </div>
  );
};

const Root = () => <App />;

export default Root;
