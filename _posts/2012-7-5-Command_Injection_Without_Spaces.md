---
layout: default
title: Command Injection without Spaces
---
Had some problems trying to test for command injection without spaces. Figured it out eventually:
{% highlight bash %}
sleep${IFS:0:1}20
{% endhighlight %}