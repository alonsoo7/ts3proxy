# ![ts3Proxy Logo](https://github.com/UnlimitedBytes/ts3proxy/raw/master/logo.png)
#
#
# TeamSpeak 3 Proxy
A simple application for creating teamspeak 3 proxys like ts3.cloud.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
* NodeJS
* NPM
* iptables
* sudo
* Server with IP_Forwarding allowed
#
### Installing
Create a new user:
```sh
$ sudo adduser ts3proxy
```
Navigate to the home directory of the new user:
```sh
$ sudo cd /home/ts3proxy
```
Copy the project to your local system
```sh
$ sudo git clone https://github.com/UnlimitedBytes/ts3proxy.git
```

Navigate into the project folder
```sh
$ sudo cd ts3proxy
```

Change the ``ipaddress`` in the  ``config.json`` file to your servers ip address:
```json
{
	"ipaddress": "1.1.1.1",
	"ports": "..."
}
```

Install the required dependencies
```sh
$ sudo npm install
```
Give the new user the ownership of the applications folder and all files in it:
```sh
$ sudo chown -R ts3proxy: .
```
Then add a new line to your ``/etc/sudoers`` file to enable the iptables privileges:
```sh
$ sudo visudo
```
```
ts3proxy    ALL=NOPASSWD: /sbin/iptables
```
Activate ip_forward
```sh
$ echo 1 > /proc/sys/net/ipv4/ip_forward
$ sysctl -w net.ipv4.ip_forward=1
```
Add two required iptable rules
```sh
$ iptables -A FORWARD -j ACCEPT
$ iptables -t nat -A POSTROUTING -j MASQUERADE
```
At least switch the user and start the application by running
```sh
$ sudo su ts3proxy
$ npm start
```
Now you can open your webbrowser and go to: ``http://<your_servers_ip>:1337``

Congratulations now you can create teamspeak 3 proxys.
#
#
## Deployment
Additional notes about how to deploy this on a live system.
> I just wannted to recommend [pm2](http://pm2.keymetrics.io/) for live deployment.
#
#
## Built With
- [Node.JS](https://nodejs.org/en/) - The programming language used
- [Express.JS](https://expressjs.com/de/) - The web framework used
- [Twig](https://twig.symfony.com/) - The view engine used
- [iptables](https://wiki.debian.org/iptables) - For the proxying
#
#
## Contributing
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.
#
#
## Authors
* **Christian Peterson** - *Initial work* - [UnlimitedBytes](https://github.com/UnlimitedBytes)

See also the list of [contributors](https://github.com/UnlimitedBytes/ts3proxy/contributors) who participated in this project.
#
#
### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
