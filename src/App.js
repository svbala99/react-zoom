import "./App.css";

import React, { useEffect, useState } from "react";

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
  const [data, setData] = useState(null);
  // handled at react web hosting side
  const sdkKey = process.env.REACT_APP_ZOOM_SDK_KEY_PROD;
  const role = 0;
  const leaveUrl = "https://zoom.us";

  // handled at react native side - would be passed from React native to React
  // you can delete these after you receive all these from react native
  const userName = "User";
  const userEmail = "user@cipla.com";

  /**
   * @async
   * @function getSignature
   * @param {Event} e
   * @description generates description by hitting the hosted git repo Express server
   * @description replace localhost 4000 with the URL where the Express server runs remotely
   */
  const getSignature = async (data = null) => {
    try {
      // hit the remote experss server to retrieve signature
      // meetingNumber and role are must.
      // role 0 means attendee, 1 stands for host
      const responseFromSignatureEndpoint = await fetch(
        "https://zoomsdk-sign-generator-express.onrender.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingNumber: data?.meetingNumber,
            role,
          }),
        }
      );

      // if signature is retrieved successfully, then attempt to start meeting
      const signatureJSON = await responseFromSignatureEndpoint.json();
      if (signatureJSON) {
        startMeeting(signatureJSON?.signature, data);
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
  const startMeeting = (signature = null, data) => {
    // in the HTML document, whichever div has zmmtg-root as ID, then overwrite its style prop by display : 'block'
    document.getElementById("zmmtg-root").style.display = "block";

    if (!sdkKey || !signature) {
      return;
    }

    // make init() from zoomSDK
    // all fields are mandatory
    ZoomMtg.init({
      leaveUrl,
      success: () => {
        ZoomMtg.join({
          signature,
          sdkKey,
          meetingNumber: data?.meetingNumber,
          passWord: data?.passWord,
          userName: data?.userName || userName,
          userEmail: data?.userEmail || userEmail,
          // success: (success) => {
          //   console.log("============= Zoom join success",success)
          // },
          error: (errorMsg) => {
            sendMsg_MeetingJoin_Error(JSON.stringify(errorMsg));
          },
        });
      },
      // error: (error) => {
      //   console.log("============= Zoom init error", error);
      // }
    });
  };

  // In Use effect()====>  if(e.data?.type="LEAVE_MEETING"){
  //   ZoomMtg.leaveMeeting({
  //     confirm:true,
  //     success:()=>{
  //       sendMsg_MeetingLeave_Success();
  //     }
  //   })
  // }

  // (6) ==> ZoomMtg.join(
  // ...
  // error : ()=>{
  // write logic here
  // }
  // )

  // (5) ==>  ZoomMtg.inMeetingServiceListener("onUserIsInWaitingRoom", function (data) {
  //   console.log("USER IN WAITING ROOM!");
  //   console.log(data);
  // });

  // (1,2,3,4) ==> ZoomMtg.inMeetingServiceListener("onMeetingStatus", function (data) {
  //   // {status: 1(connecting), 2(connected), 3(disconnected), 4(reconnecting)}
  //   console.log(data);
  // });

  // 7. leave success, meeting ended

  /**
   * @function sendMsg_MeetingJoined_Connected
   * @description 1. Join success, "connected" to meeting
   */
  const sendMsg_MeetingJoined_Connected = (meetingData = null) => {
    const msg_1 = {
      type: "event",
      key: 1,
      eventProps: {
        message: "joinedZoom",
        data: {
          meetingNumber: meetingData?.meetingNumber,
          meetingStatus: "connected",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_1));
  };

  /**
   * @function sendMsg_MeetingJoined_Connecting
   * @description 2. Join success, "connecting" to meeting
   */
  const sendMsg_MeetingJoined_Connecting = (meetingData = null) => {
    const msg_2 = {
      type: "event",
      key: 2,
      eventProps: {
        message: "joinedZoom",
        data: {
          meetingNumber: meetingData?.meetingNumber,
          meetingStatus: "connecting",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_2));
  };

  /**
   * @function sendMsg_MeetingJoined_Disconnected
   * @description 3. Join success, "disconnected" to meeting
   */
  const sendMsg_MeetingJoined_Disconnected = (meetingData = null) => {
    const msg_3 = {
      type: "event",
      key: 3,
      eventProps: {
        message: "joinedZoom",
        data: {
          meetingNumber: meetingData?.meetingNumber,
          meetingStatus: "disconnected",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_3));
  };

  /**
   * @function sendMsg_MeetingJoined_Reconnecting
   * @description 4. Join success, "reconnecting" to meeting
   */
  const sendMsg_MeetingJoined_Reconnecting = (meetingData = null) => {
    const msg_4 = {
      type: "event",
      key: 4,
      eventProps: {
        message: "joinedZoom",
        data: {
          meetingNumber: meetingData?.meetingNumber,
          meetingStatus: "reconnecting",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_4));
  };

  /**
   * @function sendMsg_MeetingJoined_Waiting
   * @description  5. Join success, "waiting" in meeting room
   */
  const sendMsg_MeetingJoined_Waiting = () => {
    const msg_5 = {
      type: "event",
      key: 5,
      eventProps: {
        message: "joinedZoom",
        data: {
          meetingNumber: meetingData?.meetingNumber,
          meetingStatus: "waiting",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_5));
  };

  /**
   * @function sendMsg_MeetingJoin_Error
   * @argument {String} errorMessage
   * @description  6. join error, "error" in joining zoom meeting
   * @description pass errorMessage from onError call back of ZoomMtg.join()
   */
  const sendMsg_MeetingJoin_Error = (errorMessage = "") => {
    const msg_6 = {
      type: "event",
      key: 6,
      eventProps: {
        message: "errorZoom",
        data: {
          errorMessage,
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_6));
  };

  /**
   * @function sendMsg_MeetingLeave_Success
   * @description  7. leave success, meeting ended
   */
  const sendMsg_MeetingLeave_Success = () => {
    const msg_7 = {
      type: "event",
      key: 7,
      eventProps: {
        message: "leaveZoom",
        data: {
          endedBy: "user",
        },
      },
    };
    window?.ReactNativeWebView?.postMessage(JSON.stringify(msg_7));
  };

  /**
   * @function useEffect
   * @description to handle the listener to receive msg from React native
   * @description PWA developers can receive this e.data and utilize it wherever required
   */
  let meetingData = null;
  useEffect(() => {
    document.addEventListener("message", (e) => {
      if (e?.data?.type === "LEAVE_MEETING") {
        ZoomMtg.leaveMeeting({
          confirm: true,
          success: () => {
            sendMsg_MeetingLeave_Success();
          },
        });
      }
      getSignature(JSON.parse(e?.data));
      meetingData = JSON.stringify(JSON.parse(e?.data));
      setData(JSON.parse(e?.data));
    });

    ZoomMtg.inMeetingServiceListener("onMeetingStatus", (data) => {
      // {status: 1(connecting), 2(connected), 3(disconnected), 4(reconnecting)}
      const status = data?.meetingStatus || null;
      if (status) {
        switch (status) {
          case 1:
            sendMsg_MeetingJoined_Connecting(meetingData);
            break;
          case 2:
            sendMsg_MeetingJoined_Connected(meetingData);
            break;
          case 3:
            sendMsg_MeetingJoined_Disconnected(meetingData);
            break;
          case 4:
            sendMsg_MeetingJoined_Reconnecting(meetingData);
            break;
          default:
            break;
        }
      }
    });

    ZoomMtg.inMeetingServiceListener("onUserIsInWaitingRoom", () => {
      sendMsg_MeetingJoined_Waiting();
    });
  }, []);

  return <div className="App"></div>;
};

export default App;
