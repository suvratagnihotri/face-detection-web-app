import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { loadModels, detectFaces } from './faceDetection';


const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isImageCaptured, setIsImageCaptured] = useState(false);

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

    // Draw the current video frame onto the canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    setIsCameraOn(false);
    videoElement.srcObject.getTracks().forEach((track) => track.stop());

    setIsImageCaptured(true);
    canvasRef.current = canvasElement;
  };

  const detectFaces = async () => {
    try {
      await loadModels(); // Load face-api.js models
  
      const videoElement = videoRef.current.video;
      const canvasElement = document.createElement('canvas');
      const context = canvasElement.getContext('2d');
  
      // Set canvas dimensions to match the video stream
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
  
      // Draw the current video frame onto the canvas
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
      setIsCameraOn(false);
      videoElement.srcObject.getTracks().forEach((track) => track.stop());
  
      setIsImageCaptured(true);
      canvasRef.current = canvasElement;
  
      const image = await faceapi.fetchImage(canvasElement.toDataURL());
      const detectedFaces = await detectFaces(image); // Perform face detection using face-api.js
  
      // Draw bounding boxes around detected faces
      const resultImage = faceapi.createCanvasFromMedia(image);
      faceapi.draw.drawDetections(resultImage, detectedFaces);
  
      const resultContainer = document.createElement('div');
      resultContainer.classList.add('result-container');
      resultContainer.appendChild(resultImage);
  
      document.body.appendChild(resultContainer);
    } catch (error) {
      console.log('Face detection error:', error);
    }
  };
  

  useEffect(() => {
    console.log('Initializing camera...');
    startCamera();
    console.log('Camera initialized.');
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
          <img className="video" src={canvasRef.current?.toDataURL()} alt="Captured" />
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
