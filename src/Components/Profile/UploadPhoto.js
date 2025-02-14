import { getThemeProps } from "@material-ui/styles";
import React, { useState } from "react";
import API_URL from '../../environment'

const CLOUD_URL = "https://api.cloudinary.com/v1_1/dcfmnomqh/image/upload";

const Upload = (props) => {
  const [fileInputState, setFileInputState] = useState(null);
  const [previewSource, setPreviewSource] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  console.log(props.sessionToken);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setFileInputState(file);
    previewFile(file);
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };
  
  const handleSubmitFile = async (e) => {
    console.log("submitting");
    console.log(previewSource);
    e.preventDefault();
    // if(!previewSource) return;
    // uploadImage(previewSource);

    const uploadImage = await fetch(`${API_URL}/profile/cloudsign`, {
      method: "GET",
      headers: {
        Authorization: props.sessionToken,
      },
    });
    const { sig, ts } = await uploadImage.json();
    // const file=document.getElementById('file-input'.files[0]);

    const formData = new FormData();

    formData.append("file", fileInputState);
    formData.append("upload_preset", "dateperfect"); //edited
    formData.append("api_key", "223952152215851");
    formData.append("signature", sig);
    formData.append("timestamp", ts);

    console.log(ts);

    const results = await (
      await fetch(CLOUD_URL, {
        method: "POST",
        body: formData,
      })
    ).json();
    console.log(results);
    setFileUrl(results.secure_url);
    console.log(fileUrl);

    const final = await (
      await fetch(`${API_URL}/profile/imageset`, {
        method: "PUT",
        headers: {
          Authorization: props.sessionToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile: { picURL: results.secure_url } }),
      })
    ).json();
  };

  return (
    <div>
      <h4> Update Profile Image</h4>
      <form encType="multipart/form-data" onSubmit={handleSubmitFile}>
        <input
          type="file"
          name="image"
          onChange={handleFileInputChange}
        
          id="file-input"
        />
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
      {previewSource && (
        <img src={previewSource} alt="chosen" style={{ height: "200px" }} />
      )}
    </div>
  );
};

export default Upload;
