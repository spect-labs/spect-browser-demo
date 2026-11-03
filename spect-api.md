# Spect API's

_NOTE_:_Spect browser internaly runs two local server one on PORT: **8888** and one on PORT : **1935** . So insure that you are running nothing on these port while using the Spect browser other wise it will conflict._
_**8888** It is the port or signaling server, **1935** in this port RTMP server runs._

Spect Browser API's are specialy made for the interviewer site's to conduct
the interview with fairness.

-It have full window blocking API which prevent tab switching and application switching when
active and many more API's.

you can access Spect browser API's via window.Spect.

## Blocking window API :

This Spect api blocks the whole window when active it prevent the person giving interview from switching tabs using
key board sortcuts such as : `CTR+TAB` and from switching applications : `ALT+TAB` . It prevent many other keyboard sortcut when Blocking is active.
It push back the floating window's like AI cheating assistence.

- API : `await window.Spect.blockwindow()`.

```
await window.Spect.blockwindow();
Output:
{success: true, blockMode: true}
```

### Unblocking window API :

This Spect api is used to unblock the window after blocking it .

- API : `await window.Spect.unblockwindow()`.

```
await window.Spect.unblockwindow();
{success: true, blockMode: false}

```

### Checking if window is blocked or not, Isblock API :

This Spect api return boolean `True/False` according to the window condition if the window is blocked it
returns `True` else `False`
-API : `await window.Spect.isBlocked()`.

_NOTE: In this case the window is Unblocked._

```
await window.Spect.isBlocked();

returns :
false
```

## Satellite API's :

Satellite is a feature of the Spect Browser where user can scan the QR-code from the Spect Browser wich contains the IP and PORT using the **Spect-Satellite** app . After connecting user can share live video to the browser with theire camera .

- API's :

1. `await window.Spect.satellite.openQRCodeModal()`.
2. `await window.Spect.satellite.closeQRCodeModal()`.
3. `await window.Spect.satellite.getLiveStream()`.

- `await window.Spect.satellite.openQRCodeModal()`: This will open the QR code modal.

- `await window.Spect.satellite.closeQRCodeModal()`: This will close the QR code modal.

- `await window.Spect.satellite.getLiveStream()`: This API provides the Live VideoStream id of video that is sended via the user.

```

const videoId = await window.Spect.satellite.getLiveStream();
const video = document.getElementById(videoId);
const stream = video.captureStream(); // captured natively in main world — real MediaStream
console.log(stream.getVideoTracks());

```

## Multiple Monitor Detection :

This api returns the number of external monitors connected, excluding the primary display.

- API : `await window.Spect.getExternalDisplayCount()`.

```
await window.Spect.getExternalDisplayCount();

returns :
1
```

## Hidden Process API :

we can access Hidden Process api using : `await window.Spect.getHiddenProcesses()`.

1. `await window.Spect.getHiddenProcesses()`:
   This api give all the hidden processes running in an array.

```
await window.Spect.getHiddenProcesses()

returns:
(3)[{...},{...},{...}]

```
