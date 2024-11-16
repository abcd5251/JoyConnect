"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import change_icon from "@/assets/turn.png";
import upload_icon from "@/assets/video_player.png";
import upload_cloud_icon from "@/assets/upload.svg";
import Advanced from "@/components/advanced";
import mint_fail_img from "@/assets/mint_fail.jpg";
import mint_success_img from "@/assets/mint_success.jpg";
import { SignIn } from "@/components/SignIn";

import { Step } from "@/core/setting";
import { useSession } from "next-auth/react";

const MintFail = () => {
  return (
    <div className=" fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[300px] h-[300px]">
      <Image src={mint_fail_img} alt="mint fail" width="300" height="300" />
    </div>
  );
};
const MintSuccess = () => {
  return (
    <div className=" fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[300px] h-[300px]">
      <Image src={mint_success_img} alt="mint fail" width="300" height="300" />
    </div>
  );
};

const Home = () => {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(Step.stepSelectVideo);
  const [animations, setAnimations] = useState<number[]>([1, 2, 3]);
  const [animationIndex, setAnimationIndex] = useState<number>(0);
  const [otherVideoUrls, setOtherVideoUrls] = useState<string[]>([
    "1.mp4",
    "2.mp4",
    "3.mp4",
  ]);
  const [swipeCardUrlIndex, setSwipeCardUrlIndex] = useState<number>(0);
  const [modalShow, setModalShow] = useState<boolean>(true);
  const [showMintFail, setShowMintFail] = useState<boolean>(false);
  const [showMintSuccess, setShowMintSuccess] = useState<boolean>(false);

  const msleep = async (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Display the uploaded image preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleShowMintFail = async () => {
    setShowMintFail(true);
    await msleep(3000);
    setShowMintFail(false);
  };
  const handleShowMintSuccess = async () => {
    setShowMintSuccess(true);
    await msleep(3000);
    setShowMintSuccess(false);
  };
  const handleAnimationSelect = (animation: number) => {
    setSelectedAnimation(animation);
  };

  const handleNext = async () => {
    if (step === Step.stepSelectVideo) {
      handleAnimationSelect(animations[animationIndex]);
      setStep(Step.stepUploadPhoto);
    } else if (step === Step.stepUploadPhoto) {
      if (!selectedFile) {
        alert("Please upload an image");
        return;
      }
      await handleSubmit();
      setStep(Step.stepResult);
    } else if (step === Step.stepResult) {
      setStep(Step.stepShowOthers);
    }
  };
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload an image");
      return;
    }
    if (selectedAnimation === null) {
      alert("Please choose your video");
      return;
    }
    if (selectedFile && selectedAnimation !== null) {
      setLoading(true);
      setVideoUrl(null); // Reset video URL when a new submission is made

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("number", selectedAnimation.toString());

      const IPFSData = new FormData();
      IPFSData.append("file", selectedFile);
      IPFSData.append("bucket_name", "test1");
      
      const IPFSResponse = await fetch(
        "http://0.0.0.0:8070/upload",  // Updated endpoint
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("success", IPFSResponse)
        
      const response = await fetch(
        "https://test-upload-video.onrender.com/uploadImage",
        {
          method: "POST",
          body: formData,
        }
      );

      setLoading(false);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    }
  };

  const handleIndexChange = () => {
    setAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
  };
  const handleAgain = () => {
    setSelectedFile(null);
    setSelectedAnimation(null);
    setVideoUrl(null);
    setPreviewUrl(null); // Reset preview URL
  };

  const handleSwipe = (direction: any) => {
    if (direction === "right") {
      alert("You Like this video");
    } else if (direction === "left") {
      alert("You don't like this video");
    }
    setSwipeCardUrlIndex(
      (prevIndex) => (prevIndex + 1) % otherVideoUrls.length
    );
  };

  // If loading, show nothing
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="loader"></div>
      </div>
    );
  }

  // If not authenticated, show only SignIn
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <SignIn />
      </div>
    );
  }

  // Main content - only shown when authenticated
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      {loading && (
        <div className="flex items-center justify-center">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && !videoUrl && (
        <>
          {step === Step.stepSelectVideo && (
            <>
              <h3 className="font-bold mb-8 text-[#8F8E8E] text-center">
                Let&apos;s be someone you like.
              </h3>
              <div className="mb-4">
                <h2 className="text-white">Today&apos;s video</h2>
              </div>
              <div className="flex mb-4">
                <div className="flex flex-col items-center mx-4">
                  <video
                    controls
                    className="mb-5 w-[350px] h-[350px] mx-auto"
                    key={animationIndex}
                    preload="metadata"
                    poster={`${animations[animationIndex]}.gif`}
                  >
                    <source
                      src={`${animations[animationIndex]}.mp4`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <button
                    onClick={handleIndexChange}
                    className={`d-flex items-center px-4 py-2  rounded-full text-[#9B9B9B] bg-[#2D2D2D] mb-10 mt-3`}
                  >
                    <Image
                      src={change_icon}
                      alt="turn"
                      className="inline-block w-5 h-5 mr-2"
                      width="30"
                      height="30"
                    />
                    change
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-[#58FFA3] text-black rounded-xl w-full mx-5"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
          {step === Step.stepUploadPhoto && (
            <>
              <h3 className="font-bold mb-8 text-[#8F8E8E]  text-center">
                Let&apos;s be someone you like.
              </h3>
              <div className="flex mb-4 w-[350px]">
                <div className="flex flex-col items-center mx-4 w-full">
                  <h2 className="text-center mb-4 text-white">
                    Upload your photo
                  </h2>
                  <label htmlFor="file" className="">
                    {!selectedFile && (
                      <div className="relative w-full">
                        <Image
                          width="300"
                          height="300"
                          src={upload_icon}
                          className="mb-10 w-[300px] h-[300px]"
                          alt="upload"
                        />
                        <Image
                          width="50"
                          height="50"
                          src={upload_cloud_icon}
                          className="mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          alt="upload"
                        />
                      </div>
                    )}
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4 border p-2 rounded hidden w-[300px] h-[300px]"
                  />
                  {previewUrl && (
                    <label htmlFor="file" className="mb-4">
                      <img
                        src={previewUrl}
                        alt="Uploaded"
                        className="w-[300px] h-[300px] object-cover mb-10"
                      />
                    </label>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-[#58FFA3] text-black rounded-xl w-full"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
      {videoUrl && step === Step.stepResult && (
        <div className="mt-4 w-[400px]">
          <h3 className="font-bold mb-8 text-[#8F8E8E] text-center">
            Let&apos;s be someone you like.
          </h3>
          <div className="mb-4 px-5">
            <h2 className="text-center mb-4 text-white">
              Here&apos;s your result
            </h2>
            <video controls className="mb-5 w-[350px] h-[350px] mx-auto">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="flex items-center mb-10 justify-between px-5 flex-wrap w-full">
              <span className="text-white block mb-5 text-center w-full">
                If you are Top 3 scoring last week
              </span>
              <button
                className="border-[#FFE958] border-2 px-2 py-2 rounded-full text-[#FFE958] block mx-auto"
                onClick={() => {
                  handleShowMintFail();
                }}
              >
                Mint Special NFT
              </button>
            </div>
            <button
              className="border-[#58FFA3] border-2 px-2 py-2 rounded-full text-[#58FFA3] block mx-auto mb-10"
              onClick={() => {
                handleShowMintSuccess();
              }}
            >
              Mint today&apos;s NFT
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#58FFA3] text-black rounded-xl w-full"
            >
              See other&apos;s work
            </button>
          </div>
        </div>
      )}
      {step === Step.stepShowOthers && (
        <>
          {otherVideoUrls.length > swipeCardUrlIndex ? (
            // <>
            //   <SwipeCard
            //     key={swipeCardUrlIndex}
            //     videoUrl={otherVideoUrls[swipeCardUrlIndex]}
            //     onSwipe={handleSwipe}
            //   />
            // </>
            <Advanced />
          ) : (
            <h1>no more videos</h1>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
