import "./App.css";

import React from "react";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.13.0/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

/**
 * @function App
 * @description Main root of the app
 * @returns {JSX}
 */
const App = () => {
  // handled at react web hosting side
  const sdkKey = process.env.REACT_APP_ZOOM_SDK_KEY_PROD;
  const role = 0;
  const leaveUrl = "https://zoom.us";

  // handled at react native side - would be passed from React native to React
  const meetingNumber = 99488065055;
  const passWord = "imn6YJ";
  const userName = "Bala Test";
  const userEmail = "svbala99@gmail.com";

  /**
   * @async
   * @function getSignature
   * @param {Event} e
   * @description generates description by hitting the hosted git repo Express server
   * @description replace localhost 4000 with the URL where the Express server runs remotely
   */
  const getSignature = async (event) => {
    try {
      event.preventDefault();

      // hit the remote experss server to retrieve signature
      // meetingNumber and role are must.
      // role 0 means attendee, 1 stands for host
      const responseFromSignatureEndpoint = await fetch(
        "http://localhost:4000",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingNumber: meetingNumber,
            role: role,
          }),
        }
      );

      // if signature is retrieved successfully, then attempt to start meeting
      const signatureJSON = await responseFromSignatureEndpoint.json();
      if (signatureJSON) {
        startMeeting(signatureJSON?.signature);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * @function startMeeting
   * @param {String} signature
   * @description starts the zoom meeting
   */
  const startMeeting = (signature = null) => {
    // in the HTML document, whichever div has zmmtg-root as ID, then overwrite its style prop by display : 'block'
    document.getElementById("zmmtg-root").style.display = "block";

    // make init() from zoomSDK
    // pass success and error callbacks for init() and join()
    // all fields are mandatory
    ZoomMtg.init({
      leaveUrl,
      success: (success) => {
        //   console.log("============= Zoom init success",success)
        ZoomMtg.join({
          signature,
          sdkKey,
          meetingNumber,
          passWord,
          userName,
          userEmail,
          // success: (success) => {
          //   console.log("============= Zoom join success",success)
          // },
          // error: (error) => {
          //   console.log("============= Zoom join error", error);
          // }
        });
      },
      // error: (error) => {
      //   console.log("============= Zoom init error", error);
      // }
    });
  };

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>
        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
};

export default App;
