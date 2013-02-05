---
layout: default
title: Browser Event Hijacking
---
**TL;DR**: [preventDefault can be bad](http://boomer.neohapsis.com/searchbox/index.html)

In playing with the `preventDefault` method on JavaScript events, it occured to me that one can easily hijack events that should get passed through to the browser. The example that I will be discussing here is the `ctrl+f` or `⌘+f` combination. This ubiquitous key combination results in a search box of some type being displayed to the user. With browser and OS key bindings, there is a user expectation of continuity. We are conditioned as users to expect that pressing these key combinations will have a certain effect. The interruption of this continuity can have security implications.

In the example hosted [here](http://boomer.neohapsis.com/searchbox/index.html), a list of information that a user might be tempted to search through is presented. JavaScript on the page hijacks the `ctrl+f` and `⌘+f` combinations, presenting a search box that is nearly identical to the browser search box users would see running Google Chrome on OSX. While normally, JavaScript wouldn't have access to the contents of the search box, the fake search box is obviously accessible to the malicious site.


Fake Browser Search Bar

Real Browser Search Bar (Google Chrome on OSX)
The ability of a malicious site to interrupt the expected continuity of user interaction with a web browser constitutes a breach of user trust on the part of the web browser. Because the user trusts that this key combination will trigger a *browser* event, they will trust the search bar presented by the site and interact with it as they would with the browser. Other key combinations could be similarly attacked. For example, `ctrl+s`/`⌘+s` or `ctrl+o`/`⌘+o` could be hijacked and could display a fake dialog claiming that the user's password is required for file-system access. Specific attack scenarios aside, it is problematic to have ambiguity about the boundaries between browser and web app. More generally, a lower trust component should not have the ability to affect the behavior of a higher trust component.

This page in probably won't be convincing for users of different operating systems or browsers, but with a bit more effort, the script could detect browser and OS and display an appropriate search box. It could also easily emulate other browser behavior like highlighting entered text or scrolling around the page.

What is the solution, though? There are a few solutions that come to mind:

1. Place the browser search box in a part of the browser that could not be confused with website content.
2. Warn the user when a site attempts to call preventDefault on an event that is registered as a browser key binding.

I raised this issue to the Chrome team and it was labeled as a low-priority issue. I'm not sure that I disagree with that analysis, but I do think that this is an issue that should be considered.