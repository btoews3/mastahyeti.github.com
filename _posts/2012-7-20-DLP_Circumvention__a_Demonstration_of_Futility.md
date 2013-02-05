---
layout: default
title: DLP Circumvention -- A Demonstration of Futility
---
**TLDR**: Check out [the tool](http://neohapsis.github.com/QRCode-Video-Data-Exfiltration/)

I can't say that I'm an expert in Data Loss Prevention (DLP), but I imagine its hard. The basic premise is to prevent employees or others from getting data out of a controlled environment, for example, trying to prevent the DBA from stealing everyone's credit card numbers or the researcher from walking out the door with millions in trade secrets. DLP is even tougher in light of new techniques for moving confidential data undetected through a network.  When I demonstrated how I could do it with QR Codes, I had to rethink DLP protections.

Some quick research informs me that the main techniques for implementing DLP are to monitor and restrict access to data both physically and from networking and endpoint perspectives. Physical controls might consist of putting locks on USB ports or putting an extra locked door between your sensitive environment and the rest of the world. Networking controls might consist of firewalls, IDS, content filtering proxies, or maybe just unplugging the sensitive network from the rest of the network and the internet.

Many security folks joke about the futility of this effort. It seems that a determined individual can always find a way around these mechanisms. To demonstrate, my co-worker, Scott Behrens, was working on a Python script to convert files to a series of QR Codes (2d bar codes) that could be played as a video file. This video could then be recorded and decoded by a cell-phone camera and and stored as files on another computer. However, it seemed to me that with the new JavaScript/HTML5 file APIs, all the work of creating the QR Code videos could be done in the browser, avoiding the need to download a Python script/interpreter.

I was talking with a former co-worker, about this idea and he went off and wrote a HTML5/JS encoder and a ffmpeg/bash/ruby decoder that seemed to work pretty well. Not wanting to be outdone, I kept going and wrote my own encoder and decoder.

My encoder is fairly simple. It uses the file API to read in multiple files from the computer, uses Stuart Knightley's [JSZip](http://stuartk.com/jszip/) library to create a single ZIP file, and then Kazuhiko Arase's [JavaScript QRCode Generator](http://www.d-project.com/qrcode/index.html) to convert this file into a series of QRCodes. It does this all in the browser without requiring the user to download any programs or transmit any would-be-controlled data over the network.

The decoder was a little bit less straight-forward. I have been wanting to learn about [OpenCV](http://opencv.willowgarage.com/) for a non-security related side project, so I decided to use it for this. It turns out that it is not very entirely easy to use and its documentation is somewhat lacking. Still, I persevered and wrote a Python tool to:

1. Pull images from the video and analyze their color.
2. Identify the spaces between frames of QRCodes (identified by a solid color image).
3. Pull the QRCode frames between these marker frames.
4. Feed them into a ZBar ImageScanner and get the data out.

The tool seems to work pretty well. Between my crummy cellphone camera and some mystery frames that ZBar refuses to decode, it isn't the most reliable tool for data transfer, but is serves to make a point. Feel free to download both the encoder and decoder from my [GitHub Repo](http://github.com/Neohapsis/QRCode-Video-Data-Exfiltration/) or checkout the [live demo](http://neohapsis.github.com/QRCode-Video-Data-Exfiltration/) and let me know what you think. I haven't done any benchmarking for data bandwidth, but it seems reasonable to use the tool for files several megabytes in size.

To speak briefly about preventing the use of tools like this for getting data of *your* network: As with most things in security, finding a balance between usability and security is the key. The extreme on the end of usability would be to keep an entirely open network without any controls to prevent or detect data loss. The opposite extreme would be to unplug all your computers and shred their hard drives. Considerations in finding the medium as it relates to DLP include:

- The value of your data to your organization.
- The value of your data to your adversaries.
- The means of your organization to implement security mechanisms.
- The means of your adversaries to defeat security mechanisms.

Once your organization has decided what its security posture should be, it can attempt to mitigate risk accordingly. What risk remains must be accepted. For most organizations, the risk presented by a tool like the one described above is acceptable. That being said, techniques for mitigating its risk might include:

- Disallowing video capture devices in sensitive areas (already common practice in some organizations).
- Writing IDS signatures for the JavaScript used to generate the QRCodes (this is hard because JS is easily obfuscated and packed).
- Limiting access within your organization to sensitive information.
- Trying to prevent the QRCode-creating portion of the tool from reaching your computers.
  - Physical Protections (USB port locks, removing CD Drives, etc.)
  - Network Protections (segmentation,content filtering, etc.)

Good luck ;)

*Apparently the word 'QR Code' is registered trademark of [DENSO WAVE INCORPORATED](http://www.denso-wave.com/qrcode/faqpatent-e.html)*