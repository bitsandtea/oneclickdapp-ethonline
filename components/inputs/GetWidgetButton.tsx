import React, { useState } from "react";
import axios from "axios";

const GetWidgetButton = ({ code }) => {
  const [bundleUrl, setBundleUrl] = useState("");

  const compileComponent = async () => {
    console.log("code is: ", code);
    // try {
    //   const response = await axios.post("http://localhost:3000/api/compile", {
    //     code,
    //   });
    //   setBundleUrl(response.data.url);
    // } catch (error) {
    //   console.error("Compilation failed", error);
    // }
  };

  return (
    <div>
      <button onClick={compileComponent}>Get Widget</button>
      {bundleUrl && (
        <p>
          Your widget is available . How to use it?
          <a href={bundleUrl} target="_blank" rel="noopener noreferrer">
            here
          </a>
        </p>
      )}
    </div>
  );
};

export default GetWidgetButton;
