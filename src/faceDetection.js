import * as faceapi from 'face-api.js';

export const loadModels = async () => {
  const MODEL_URL = "/home/ginger/Desktop/poc_web_image_processing/react-pro/face-detection/public/models"; // Path to face-api.js models

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
};

export const detectFaces = async (image) => {
  const detectedFaces = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

  return detectedFaces;
};
