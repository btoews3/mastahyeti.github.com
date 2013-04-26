---
layout: default
title: iOS Safari, Content-Type, and XSS
---

## iOS Safari, Content-Type, and XSS

In December of 2012, I contacted Apple's security team to let them know about a problem with iOS Safari's handling of the `Content-Type` header. They responded that they had no intention of fixing the issue in the near future. I am a big believer in responsible disclosure, but I feel that it requires the software vendor to be responsible about fixing vulnerabilities as well. In this situation, I think that the only responsible thing for a security researcher to do is to put pressure on the software vendor via public disclosure.

The issue is that on iOS, Safari improperly handles the `text/plain` content type. The `Content-Type` header is used by the web application/server to indicate how the browser should handle the data it receives. The expectation is that `text/html` should be rendered as HTML, `image/jpeg` should be rendered as a JPG image, etc... think about `.php` or `.asp` URLs. The browser knows how to render these ambiguous file extensions based on the `Content-Type` header set by the server.

There are historical oddities surrounding browser `Content-Type` handling. For example, Internet Explorer has taken to "sniffing" the content type. That is, if the actual content looks like HTML, it might be treated as HTML, regardless of the `Content-Type` or file extension. This led to problems where applications that allowed users to upload specific types of files could be tricked into serving other types of files. 

Think about a social networking site that allows you to upload a profile image. The server might check that the file extension is `.jpg`, `.png`, or `.gif` and verify that the MIME type is consistent with the file extension. This falls apart when an attacker uploads a file with MIME type: `image/jpeg`, file extension: `.jpg`, and content: `<html><marquee>foo bar</marquee></html>`. If the browser sniffs the content rather than looking at the `Content-Type` header, it might render the HTML instead of erroring out. This isn't a big deal if the attacker is just displaying a marquee, but this could easily be leveraged to run malicious JavaScript and attack the other users' sessions.

The mistake being made by iOS Safari is similar. Instead of rendering `text/plain` documents as raw text as the header instructs, the browser guesses as to the content type based on the file extension. This makes applications that accept `text/plain` uploads or return user content as `text/plain` vulnerable to Cross-Site Scripting, when in actuality, they are doing the right thing by returning `Content-Type: text/plain`.

If you want to see a demo, visit [this url](http://23.20.186.85/something.html) in your desktop browser and then on an iOS device. You will see that desktop browser properly renders the `text/plain` content, whereas iOS Safari renders it as HTML, executing the JavaScript.

So, there it is. Hopefully this will get a bit of attention and encourage Apple to fix the issue sooner rather than later. 