import React, { useState } from 'react'
import Webcam from 'react-webcam'
const WebcamComponent = () => <Webcam />
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
}
const Cam = ( {setPhotograph } ) => {
  const [picture, setPicture] = useState('')
  const webcamRef = React.useRef(null)
  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc)
    setPhotograph(pictureSrc)
  })
  return (
    <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
      <h2 className="mb-5 text-center">
        Capture your Face
      </h2>
      <div>
        {picture == '' ? (
          <Webcam
            audio={false}
            height={400}
            ref={webcamRef}
            width={400}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
        ) : (
          <img src={picture} />
        )}
      </div>
      <br/>
      <div>
        {picture != '' ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              setPicture('')
            }}
            className="btn btn-danger"
          >
            Retake
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              capture()
            }}
            className="btn btn-success"
          >
            Capture
          </button>
        )}
      </div>
    </div>
  )
}
export default Cam