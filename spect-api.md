# Spect API's
_NOTE_:_Spect browser internaly runs two local server one on PORT: **8888** and one on PORT : **1935** . So insure that you are running nothing on these port while using the Spect browser other wise it will conflict._

Spect Browser API's are specialy made for the interviewer site's to conduct
the interview with fairness.

-It have full window blocking API which prevent tab switching and application switching when 
active and many more API's.

you can access Spect browser API's via window.Spect.
## Blocking window API :
This Spect api blocks the whole window when active it prevent the person giving interview from switching tabs using 
key board sortcuts such as : `CTR+TAB` and from switching applications : `ALT+TAB` . It prevent many other keyboard sortcut when Blocking is active.
- API : `await window.Spect.blockwindow()`.

```
await window.Spect.blockwindow();
Output:
{success: true, blockMode: true}
```

## Unblocking window API :
This Spect api is used to unblock the window after blocking it .
- API :  `await window.Spect.unblockwindow()`.

```
await window.Spect.unblockwindow();
{success: true, blockMode: false}

```


## Isblock API :
This Spect api return boolean `True/False` according to the window condition if the window is blocked it 
returns `True` else `False`
-API : `await window.Spect.isBlocked()`.

_NOTE: In this case the window is Unblocked._

```
await window.Spect.isBlocked();

returns : 
false
```

## getQRCode API:
This Spect API show's a QRCode in middle of the browser window wich contains IP and PORT where IP is the local network IP of the user and PORT is provided by us .
User can connect to the Spect browser's local server using the **Spect-Satellite** App then user can share you'r Phone 
live video recording with the Spect browser.

- API:`await window.Spect.getQRCode()`.

```
await window.Spect.getQRCode();

returns :

{url: 'http://192.168.10.9:****', qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAA…sAACosgEAoMoGAIAq/wd8fJ4GMGkoqgAAAABJRU5ErkJggg=='}
```

## Satellite API's :
Satellite is a feature of the Spect Browser where user can scan the QR-code from the Spect Browser wich contains the IP and PORT using the **Spect-Satellite** app . After connecting user can share live video to the browser with there camera .
- API's :
1. `await window.Spect.satellite.getLiveStream()`.
2. `await window.Spect.satellite.getStreams()`.
3. `await window.Spect.satellite.getStreamUrl()`.

- `await window.Spect.satellite.getLiveStream()`: This API provides the Live VideoStream id of video that is sended via the user.
```
await window.Spect.satellite.getLiveStream();
output :
VM5 preload.js:452 [MSEController] > MediaSource onSourceOpen
VM5 preload.js:452 [FLVDemuxer] > Parsed AudioSpecificConfig
VM5 preload.js:452 [FLVDemuxer] > Parsed AVCDecoderConfigurationRecord
VM5 preload.js:452 [MSEController] > Received Initialization Segment, mimeType: audio/mp4;codecs=mp4a.40.5
VM5 preload.js:452 [MSEController] > Received Initialization Segment, mimeType: video/mp4;codecs=avc1.64001f
'spect-satellite-video-1791136422101'
/////  for showing video ///////////
const videoId = await window.Spect.satellite.getLiveStream();
const video = document.getElementById(videoId);
const stream = video.captureStream(); // captured natively in main world — real MediaStream
console.log(stream.getVideoTracks());

```
- `await window.Spect.satellite.getStreams()`: This API return the Object of Stream with it's id and status.
```
await window.Spect.satellite.getStreams();
output : 
[{…}]
0
: 
{id: 'muu4dchy9sn10mpr', path: '/live/stream', app: 'live', name: 'stream', startedAt: 1791136406839}
length
: 
1
[[Prototype]]
: 
Array(0)

```

- `await window.Spect.satellite.getStreamUrl()`: This API return stream url.

```
await window.Spect.satellite.getStreamUrl();
output :
'http://127.0.0.1:8888/live/stream.flv'
```


## Display API's:
we can access display api's using `await window.Spect.display`.
display api has two sub api's :

-`await window.Spect.display.getDisplays()`.
-`await window.Spect.display.getDisplaysAndSources()`.

1. `await window.Spect.display.getDisplays()`:
This api give's the information of physical display,Screen Sources and window Sources.


``` 
await window.Spect.display.getDisplays();
returns:
(3) [{…}, {…}, {…}]
0: {type: 'physicalDisplay', count: 1, items: Array(1)}
1: {type: 'capturerScreenSource', count: 1, items: Array(1)}
2: {type: 'capturerWindowSource', count: 5, items: Array(5)}
```


2. `await window.Spect.display.getDisplaysAndSources()`:

This api give's the information of physical display,Screen Sources it don't give information about window sources.


``` 
await window.Spect.display.getDisplays();
returns:
(3) [{…}, {…}, {…}]
0: {type: 'physicalDisplay', count: 1, items: Array(1)}
1: {type: 'capturerScreenSource', count: 1, items: Array(1)}
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

## Suspicious Process :
we can get all the process wich have click through enabled and are off from getting capured in the recording or screen sharing by this spect api : ` await window.Spect.getSuspiciousProcess()`
```
await window.Spect.getSuspiciousProcess();
output :
[] // the array is empty because there is no process wich have click through enabled and are off from capure
```
## Stats API :
we can see the Statistics of our computer/Pc or Laptop using : `await window.Spect.getStats();`.

```
returns:
await window.Spect.getStats();
{OS: 'linux', browser: 'Spect', memory: {…}}

``` 

## Stream API :
This api is use to see the stream of live screen sharing across the devices .

- API : `await window.Spect.getStreamAll`

```
await window.Spect.getStreamAll();
returns :

[{…}]
0: {sourceId: 'screen:394:0', sourceName: 'Entire screen', displayId: '82', displayInfo: null, stream: {…}}

```

