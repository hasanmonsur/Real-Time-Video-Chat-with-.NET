export async function initializeVideo(videoElementId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    //    .then(stream => {
    //        stream.getTracks().forEach(track => pc.addTrack(track, stream));
    //    });

    const video = document.getElementById(videoElementId);
    video.srcObject = stream;
    console.log("Local stream initialized with tracks:", stream.getTracks());
    video.play().catch(e => console.error("Local video play error:", e));

    if (typeof pc !== 'undefined') {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        console.log("Tracks added to peer connection");
    }


    return stream;
}

export function createPeerConnection(config) {
    const pc = new RTCPeerConnection(config);
    console.log("Peer connection created with config:", config);
    pc.oniceconnectionstatechange = () => console.log("ICE state:", pc.iceConnectionState);
    pc.onconnectionstatechange = () => console.log("Connection state:", pc.connectionState);
    pc.onsignalingstatechange = () => console.log("Signaling state:", pc.signalingState);
    pc.onicecandidateerror = (e) => console.log("ICE candidate error:", e);
    return pc;
}

export function addTracks(peerConnection, stream) {
    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        console.log("Track added:", track.kind, track.id, "enabled:", track.enabled, "readyState:", track.readyState);
    });
}

export async function createOffer(peerConnection) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Offer created:", offer);
    return JSON.stringify(offer);
}

export async function createAnswer(peerConnection) {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("Answer created:", answer);
    return JSON.stringify(answer);
}

export async function setRemoteDescription(peerConnection, sdp) {
    await peerConnection.setRemoteDescription(JSON.parse(sdp));
    console.log("Remote description set");
}

export async function addIceCandidate(peerConnection, candidate) {
    const parsedCandidate = JSON.parse(candidate);
    console.log("Adding ICE candidate:", parsedCandidate);
    await peerConnection.addIceCandidate(parsedCandidate);
    console.log("ICE candidate added successfully");
}

export function setOnIceCandidate(peerConnection, dotNetRef) {
    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate && candidate.candidate) {
            console.log("ICE candidate generated:", candidate);
            dotNetRef.invokeMethodAsync('OnIceCandidate', JSON.stringify(candidate));
        } else {
            console.log("ICE gathering complete or invalid candidate:", candidate);
        }
    };
    console.log("ICE candidate handler set");
}


/*
export function setOnTrack(peerConnection, remoteVideoId) {
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById(remoteVideoId);
        if (!remoteVideo) {
            console.error("Remote video element not found:", remoteVideoId);
            return;
        }
        console.log("ontrack event triggered with streams:", event.streams);
        event.streams.forEach(stream => {
            const tracks = stream.getTracks();
            console.log("Remote stream tracks:", tracks.map(t => ({
                kind: t.kind,
                id: t.id,
                enabled: t.enabled,
                readyState: t.readyState
            })));
        });
        if (remoteVideo.srcObject !== event.streams[0]) {
            remoteVideo.srcObject = event.streams[0];
            //remoteVideo.src = 'https://www.w3schools.com/html/mov_bbb.mp4';
            console.log("Remote source object assigned:", remoteVideo.srcObject.getTracks());
            //var strm = event.streams[0];
            // Attempt to play with retry logic
            const tryPlay = (attempt = 1, maxAttempts = 3, delay = 500) => {
                remoteVideo.play().then(() => {
                    console.log("Remote video playback started");
                }).catch(e => {
                    console.error('Remote video play error (attempt ${attempt}):', e);
                    if (attempt < maxAttempts) {
                        console.log('Retrying play in ${delay}ms...');
                        setTimeout(() => tryPlay(attempt + 1, maxAttempts, delay), delay);
                    } else {
                        console.error("Max play attempts reached. Video may not display.");
                    }
                });
            };


            //tryPlay();

            // Call with verification
            if (document.getElementById(remoteVideoId)) {
                console.log("Starting video playback attempt....");
                //remoteVideo.srcObject = strm;
                //tryPlay();

                remoteVideo.onerror = () => console.error('Video error:', remoteVideo.error);

                remoteVideo.onplay = () => console.log('Video playback started');
                remoteVideo.onloadedmetadata = () => console.log('Metadata loaded');
                console.log("Starting video playback running....");

            } else {
                console.error("Video element not found....");
            }

            // Debug video element state
            console.log("Remote video element:", {
                id: remoteVideo.id,
                autoplay: remoteVideo.autoplay,
                muted: remoteVideo.muted,
                width: remoteVideo.width,
                height: remoteVideo.height,
                videoWidth: remoteVideo.videoWidth,
                videoHeight: remoteVideo.videoHeight,
                currentSrc: remoteVideo.currentSrc,
                readyState: remoteVideo.readyState,
                networkState: remoteVideo.networkState
            });

            // Listen for video events
            remoteVideo.onplaying = () => console.log("Remote video is playing");
            remoteVideo.onerror = () => console.error("Remote video error:", remoteVideo.error);
            remoteVideo.onstalled = () => console.error("Remote video stalled");
        }
    };
    console.log("ontrack handler set");
}
*/

export function setOnTrack(peerConnection, remoteVideoId) {
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById(remoteVideoId);
        if (!remoteVideo) {
            console.error("Remote video element not found:", remoteVideoId);
            return;
        }

        const stream = event.streams[0];
        if (!stream) {
            console.error("No stream received in ontrack event");
            return;
        }

        // Log stream details
        console.log("ontrack event triggered with stream:", stream);
        const tracks = stream.getTracks();
        console.log("Remote stream tracks:", tracks.map(t => ({
            kind: t.kind,
            id: t.id,
            enabled: t.enabled,
            readyState: t.readyState
        })));

        // Assign stream to video element
        if (remoteVideo.srcObject !== stream) {
            remoteVideo.srcObject = stream;
            console.log("Remote source object assigned:", stream.getTracks());

            // Ensure video attributes for playback
            remoteVideo.autoplay = true; // Enable autoplay
            remoteVideo.playsinline = true; // Required for mobile browsers
            remoteVideo.muted = true; // Mute to bypass autoplay restrictions (optional)

            // Attempt to play the video
            remoteVideo.play()
                .then(() => {
                    console.log("Remote video playback started");
                })
                .catch(error => {
                    console.error("Remote video play error:", error);
                    // Log additional video state for debugging
                    console.log("Video state:", {
                        readyState: remoteVideo.readyState,
                        networkState: remoteVideo.networkState,
                        error: remoteVideo.error
                    });
                });

            // Video event listeners for debugging
            remoteVideo.onloadedmetadata = () => console.log("Metadata loaded:", {
                videoWidth: remoteVideo.videoWidth,
                videoHeight: remoteVideo.videoHeight
            });
            remoteVideo.onplaying = () => console.log("Remote video is actively playing");
            remoteVideo.onerror = () => console.error("Video error:", remoteVideo.error);
            remoteVideo.onstalled = () => console.error("Video stalled");
        }

        // Optional: Record the stream to a video file
        try {
            const recordedChunks = [];
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus' // WebM with VP8 video and Opus audio
            });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                    console.log("Recorded chunk:", e.data.size, "bytes");
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `remote-video-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("Video file downloaded");
            };

            // Start recording (optional: trigger via user action)
            mediaRecorder.start(1000); // Record in 1-second chunks
            console.log("Recording started");

            // Example: Stop after 10 seconds (adjust or make user-controlled)
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    console.log("Recording stopped");
                }
            }, 10000);

            // Optional: Add stop button for manual control
            const stopButton = document.createElement('button');
            stopButton.textContent = 'Stop Recording';
            stopButton.onclick = () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            };
            document.body.appendChild(stopButton);

        } catch (error) {
            console.error("MediaRecorder setup error:", error);
        }
    };

    console.log("ontrack handler set");
}

export function getConnectionStates(peerConnection) {
    return {
        iceState: peerConnection.iceConnectionState,
        connState: peerConnection.connectionState,
        sigState: peerConnection.signalingState
    };
}