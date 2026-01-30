# Evidência 00 — Inventário da VPS

Cole aqui:
- serviços rodando
- docker ps / compose
- endpoints expostos
- crons

(sem tokens)

```bash
root@clauwdbot-gateway:~# date
uname -a
uptime
whoami
pwd
Fri Jan 30 01:28:51 AM -03 2026
Linux clauwdbot-gateway 6.8.0-90-generic #91-Ubuntu SMP PREEMPT_DYNAMIC Tue Nov 18 14:14:30 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
 01:28:51 up 4 days,  5:28,  1 user,  load average: 0.00, 0.00, 0.00
root
/root
root@clauwdbot-gateway:~# docker --version
Docker version 29.1.5, build 0e6fee6
root@clauwdbot-gateway:~# docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
NAMES     IMAGE     STATUS    PORTS
root@clauwdbot-gateway:~# cd clawdbot
root@clauwdbot-gateway:~/clawdbot# docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
NAMES     IMAGE     STATUS    PORTS
root@clauwdbot-gateway:~/clawdbot# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
root@clauwdbot-gateway:~/clawdbot# ^C
root@clauwdbot-gateway:~/clawdbot# docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep -i clawdbot
root@clauwdbot-gateway:~/clawdbot# docker
Usage:  docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Common Commands:
  run         Create and run a new container from an image
  exec        Execute a command in a running container
  ps          List containers
  build       Build an image from a Dockerfile
  bake        Build from a file
  pull        Download an image from a registry
  push        Upload an image to a registry
  images      List images
  login       Authenticate to a registry
  logout      Log out from a registry
  search      Search Docker Hub for images
  version     Show the Docker version information
  info        Display system-wide information

Management Commands:
  builder     Manage builds
  buildx*     Docker Buildx
  compose*    Docker Compose
  container   Manage containers
  context     Manage contexts
  image       Manage images
  manifest    Manage Docker image manifests and manifest lists
  model*      Docker Model Runner
  network     Manage networks
  plugin      Manage plugins
  system      Manage Docker
  volume      Manage volumes

Swarm Commands:
  swarm       Manage Swarm

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem
  events      Get real time events from the server
  export      Export a container's filesystem as a tar archive
  history     Show the history of an image
  import      Import the contents from a tarball to create a filesystem image
  inspect     Return low-level information on Docker objects
  kill        Kill one or more running containers
  load        Load an image from a tar archive or STDIN
  logs        Fetch the logs of a container
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  wait        Block until one or more containers stop, then print their exit codes

Global Options:
      --config string      Location of client config files (default "/root/.docker")
  -c, --context string     Name of the context to use to connect to the daemon (overrides DOCKER_HOST env var and default context set with "docker context use")
  -D, --debug              Enable debug mode
  -H, --host string        Daemon socket to connect to
  -l, --log-level string   Set the logging level ("debug", "info", "warn", "error", "fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default "/root/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default "/root/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default "/root/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Run 'docker COMMAND --help' for more information on a command.

For more help on how to use Docker, head to https://docs.docker.com/go/guides/
root@clauwdbot-gateway:~/clawdbot# docker compose version || true
Docker Compose version v5.0.2
root@clauwdbot-gateway:~/clawdbot# docker compose ls || true
NAME                STATUS              CONFIG FILES
root@clauwdbot-gateway:~/clawdbot# docker compose ps || true
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
root@clauwdbot-gateway:~/clawdbot# sudo ss -lntp || sudo netstat -lntp
State        Recv-Q       Send-Q                            Local Address:Port                Peer Address:Port       Process                                                       
LISTEN       0            4096                              100.87.121.57:43920                    0.0.0.0:*           users:(("tailscaled",pid=15853,fd=23))                       
LISTEN       0            4096                                    0.0.0.0:22                       0.0.0.0:*           users:(("sshd",pid=1037,fd=3),("systemd",pid=1,fd=91))       
LISTEN       0            4096                                 127.0.0.54:53                       0.0.0.0:*           users:(("systemd-resolve",pid=557,fd=17))                    
LISTEN       0            4096                              127.0.0.53%lo:53                       0.0.0.0:*           users:(("systemd-resolve",pid=557,fd=15))                    
LISTEN       0            4096                [fd7a:115c:a1e0::9401:79a5]:42749                       [::]:*           users:(("tailscaled",pid=15853,fd=26))                       
LISTEN       0            4096                                       [::]:22                          [::]:*           users:(("sshd",pid=1037,fd=4),("systemd",pid=1,fd=94))       
root@clauwdbot-gateway:~/clawdbot# sudo ufw status verbose || true
Status: inactive
root@clauwdbot-gateway:~/clawdbot# sudo iptables -S || true
-P INPUT ACCEPT
-P FORWARD DROP
-P OUTPUT ACCEPT
-N DOCKER
-N DOCKER-BRIDGE
-N DOCKER-CT
-N DOCKER-FORWARD
-N DOCKER-INTERNAL
-N DOCKER-USER
-N ts-forward
-N ts-input
-A INPUT -j ts-input
-A FORWARD -j ts-forward
-A FORWARD -j DOCKER-USER
-A FORWARD -j DOCKER-FORWARD
-A DOCKER ! -i docker0 -o docker0 -j DROP
-A DOCKER-BRIDGE -o docker0 -j DOCKER
-A DOCKER-CT -o docker0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
-A DOCKER-FORWARD -j DOCKER-CT
-A DOCKER-FORWARD -j DOCKER-INTERNAL
-A DOCKER-FORWARD -j DOCKER-BRIDGE
-A DOCKER-FORWARD -i docker0 -j ACCEPT
-A ts-forward -i tailscale0 -j MARK --set-xmark 0x40000/0xff0000
-A ts-forward -m mark --mark 0x40000/0xff0000 -j ACCEPT
-A ts-forward -s 100.64.0.0/10 -o tailscale0 -j DROP
-A ts-forward -o tailscale0 -j ACCEPT
-A ts-input -s 100.87.121.57/32 -i lo -j ACCEPT
-A ts-input -s 100.115.92.0/23 ! -i tailscale0 -j RETURN
-A ts-input -s 100.64.0.0/10 ! -i tailscale0 -j DROP
-A ts-input -i tailscale0 -j ACCEPT
-A ts-input -p udp -m udp --dport 41641 -j ACCEPT
root@clauwdbot-gateway:~/clawdbot# systemctl --no-pager --type=service --state=running | head -n 200
  UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
  atd.service                 loaded active running Deferred execution scheduler
  containerd.service          loaded active running containerd container runtime
  cron.service                loaded active running Regular background program processing daemon
  dbus.service                loaded active running D-Bus System Message Bus
  docker.service              loaded active running Docker Application Container Engine
  getty@tty1.service          loaded active running Getty on tty1
  multipathd.service          loaded active running Device-Mapper Multipath Device Controller
  polkit.service              loaded active running Authorization Manager
  qemu-guest-agent.service    loaded active running QEMU Guest Agent
  rsyslog.service             loaded active running System Logging Service
  serial-getty@ttyS0.service  loaded active running Serial Getty on ttyS0
  ssh.service                 loaded active running OpenBSD Secure Shell server
  systemd-journald.service    loaded active running Journal Service
  systemd-logind.service      loaded active running User Login Management
  systemd-networkd.service    loaded active running Network Configuration
  systemd-resolved.service    loaded active running Network Name Resolution
  systemd-timesyncd.service   loaded active running Network Time Synchronization
  systemd-udevd.service       loaded active running Rule-based Manager for Device Events and Files
  tailscaled.service          loaded active running Tailscale node agent
  unattended-upgrades.service loaded active running Unattended Upgrades Shutdown
  user@0.service              loaded active running User Manager for UID 0

Legend: LOAD   → Reflects whether the unit definition was properly loaded.
        ACTIVE → The high-level unit activation state, i.e. generalization of SUB.
        SUB    → The low-level unit activation state, values depend on unit type.

21 loaded units listed.
root@clauwdbot-gateway:~/clawdbot# crontab -l || true
sudo ls -la /etc/cron.* || true
sudo cat /etc/crontab 2>/dev/null || true
no crontab for root
/etc/cron.d:
total 20
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  201 Apr  8  2024 e2scrub_all
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
-rw-r--r--   1 root root  396 Aug  5 14:14 sysstat

/etc/cron.daily:
total 36
drwxr-xr-x   2 root root 4096 Jan  8 07:21 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rwxr-xr-x   1 root root  376 Jul  8  2025 apport
-rwxr-xr-x   1 root root 1478 Mar 22  2024 apt-compat
-rwxr-xr-x   1 root root  123 Feb  4  2024 dpkg
-rwxr-xr-x   1 root root  377 Aug  5 14:14 logrotate
-rwxr-xr-x   1 root root 1395 Aug  5 14:14 man-db
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
-rwxr-xr-x   1 root root  518 Aug  5 14:14 sysstat

/etc/cron.hourly:
total 12
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder

/etc/cron.monthly:
total 12
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder

/etc/cron.weekly:
total 16
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rwxr-xr-x   1 root root 1055 Aug  5 14:14 man-db
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder

/etc/cron.yearly:
total 12
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
# You can also override PATH, but by default, newer versions inherit it from the environment
#PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *	* * *	root	cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6	* * 7	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6	1 * *	root	test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
#
root@clauwdbot-gateway:~/clawdbot# systemctl status docker --no-pager
# e
docker info | head -n 50
● docker.service - Docker Application Container Engine
     Loaded: loaded (/usr/lib/systemd/system/docker.service; enabled; preset: enabled)
     Active: active (running) since Sun 2026-01-25 20:02:15 -03; 4 days ago
TriggeredBy: ● docker.socket
       Docs: https://docs.docker.com
   Main PID: 2420 (dockerd)
      Tasks: 14
     Memory: 143.1M (peak: 1.0G swap: 32.8M swap peak: 56.0M)
        CPU: 7min 39.992s
     CGroup: /system.slice/docker.service
             └─2420 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

Jan 28 21:23:03 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:23:03.307132190Z" level=info msg="sbJoin: gwep4 ''->'d9d2d51ff969', gwep6 ''->''"
Jan 28 21:23:03 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:23:03.383824646Z" level=info msg="detected 127.0.0.53 nameserver, assuming systemd-resolved, so u…/resolv.conf"
Jan 28 21:23:03 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:23:03.501679510Z" level=info msg="sbJoin: gwep4 ''->'75f50d101516', gwep6 ''->''"
Jan 28 21:23:03 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:23:03.535800775Z" level=warning msg="failed to read oom_kill event" error="open /sys/fs/cgroup/system.slice:do…
Jan 28 21:23:03 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:23:03.588731577Z" level=error msg=/moby.buildkit.v1.Control/Solve error="rpc error: code = Unknown desc = proc…
Jan 28 21:24:55 clauwdbot-gateway dockerd[2420]: 2026/01/29 00:24:55 http2: server: error reading preface from client @: read unix /run/docker.sock->@: read: connecti…reset by peer
Jan 28 21:24:55 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:24:55.913313178Z" level=info msg="detected 127.0.0.53 nameserver, assuming systemd-resolved, so u…/resolv.conf"
Jan 28 21:24:56 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:24:56.072151554Z" level=info msg="sbJoin: gwep4 ''->'4ca305780599', gwep6 ''->''"
Jan 28 21:24:56 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:24:56.207916594Z" level=warning msg="failed to read oom_kill event" error="open /sys/fs/cgroup/system.slice:do…
Jan 28 21:24:56 clauwdbot-gateway dockerd[2420]: time="2026-01-29T00:24:56.260443590Z" level=error msg=/moby.buildkit.v1.Control/Solve error="rpc error: code = Unknown desc = proc…
Hint: Some lines were ellipsized, use -l to show in full.
Client: Docker Engine - Community
 Version:    29.1.5
 Context:    default
 Debug Mode: false
 Plugins:
  buildx: Docker Buildx (Docker Inc.)
    Version:  v0.30.1
    Path:     /usr/libexec/docker/cli-plugins/docker-buildx
  compose: Docker Compose (Docker Inc.)
    Version:  v5.0.2
    Path:     /usr/libexec/docker/cli-plugins/docker-compose
  model: Docker Model Runner (Docker Inc.)
    Version:  v1.0.7
    Path:     /usr/libexec/docker/cli-plugins/docker-model

Server:
 Containers: 0
  Running: 0
  Paused: 0
  Stopped: 0
 Images: 1
 Server Version: 29.1.5
 Storage Driver: overlayfs
  driver-type: io.containerd.snapshotter.v1
 Logging Driver: json-file
 Cgroup Driver: systemd
 Cgroup Version: 2
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay
  Log: awslogs fluentd gcplogs gelf journald json-file local splunk syslog
 CDI spec directories:
  /etc/cdi
  /var/run/cdi
 Swarm: inactive
 Runtimes: io.containerd.runc.v2 runc
 Default Runtime: runc
 Init Binary: docker-init
 containerd version: dea7da592f5d1d2b7755e3a161be07f43fad8f75
 runc version: v1.3.4-0-gd6d73eb8
 init version: de40ad0
 Security Options:
  apparmor
  seccomp
   Profile: builtin
  cgroupns
 Kernel Version: 6.8.0-90-generic
 Operating System: Ubuntu 24.04.3 LTS
 OSType: linux
 Architecture: x86_64
root@clauwdbot-gateway:~/clawdbot# docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
NAMES     IMAGE     STATUS    PORTS
root@clauwdbot-gateway:~/clawdbot# docker compose ls
docker compose ps
# se der erro de “no configuration file”, é porque não está no diretório certo
NAME                STATUS              CONFIG FILES
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
root@clauwdbot-gateway:~/clawdbot# ls -la
find / -maxdepth 3 -name 'docker-compose.yml' -o -name 'compose.yml' 2>/dev/null | head -n 50
total 1916
drwxr-xr-x 21 root root    4096 Jan 28 21:24 .
drwx------  9 root root    4096 Jan 28 01:42 ..
drwxr-xr-x  3 root root    4096 Jan 25 20:02 .agent
-rw-r--r--  1 root root   17677 Jan 25 20:02 AGENTS.md
-rw-r--r--  1 root root   17223 Jan 25 20:02 appcast.xml
drwxr-xr-x  6 root root    4096 Jan 25 20:02 apps
drwxr-xr-x  3 root root    4096 Jan 25 20:02 assets
-rw-r--r--  1 root root  110085 Jan 25 20:02 CHANGELOG.md
lrwxrwxrwx  1 root root       9 Jan 25 20:02 CLAUDE.md -> AGENTS.md
drwxr-xr-x  6 root root    4096 Jan 26 19:05 clawdbot-config
drwxr-xr-x  5 root root    4096 Jan 28 18:21 clawdbot-workspace
-rw-r--r--  1 root root    2078 Jan 25 20:02 CONTRIBUTING.md
-rw-r--r--  1 root root    1250 Jan 25 20:02 .detect-secrets.cfg
drwxr-xr-x  3 root root    4096 Jan 25 20:02 dist
-rw-r--r--  1 root root     770 Jan 28 10:58 docker-compose.yml
-rw-r--r--  1 root root    3015 Jan 28 21:24 Dockerfile
-rw-r--r--  1 root root     285 Jan 25 20:02 Dockerfile.sandbox
-rw-r--r--  1 root root     570 Jan 25 20:02 Dockerfile.sandbox-browser
-rw-r--r--  1 root root     441 Jan 25 20:02 .dockerignore
-rwxr-xr-x  1 root root    5896 Jan 25 20:02 docker-setup.sh
drwxr-xr-x 25 root root    4096 Jan 25 20:02 docs
-rw-r--r--  1 root root    5198 Jan 25 20:02 docs.acp.md
-rw-r--r--  1 root root     587 Jan 28 03:16 .env
-rw-r--r--  1 root root     257 Jan 25 20:02 .env.example
drwxr-xr-x 30 root root    4096 Jan 25 20:02 extensions
-rw-r--r--  1 root root     809 Jan 25 20:02 fly.toml
drwxr-xr-x  8 root root    4096 Jan 25 20:02 .git
-rw-r--r--  1 root root      19 Jan 25 20:02 .gitattributes
drwxr-xr-x  2 root root    4096 Jan 25 20:02 git-hooks
drwxr-xr-x  4 root root    4096 Jan 25 20:02 .github
-rw-r--r--  1 root root    1192 Jan 25 20:02 .gitignore
-rw-r--r--  1 root root    1074 Jan 25 20:02 LICENSE
-rw-r--r--  1 root root     139 Jan 25 20:02 .npmrc
-rw-r--r--  1 root root     107 Jan 25 20:02 .oxfmtrc.jsonc
-rw-r--r--  1 root root     241 Jan 25 20:02 .oxlintrc.json
-rw-r--r--  1 root root   10442 Jan 25 20:23 package.json
drwxr-xr-x  2 root root    4096 Jan 25 20:02 patches
-rw-r--r--  1 root root     218 Jan 25 20:02 pnpm-workspace.yaml
-rw-r--r--  1 root root    3194 Jan 25 20:02 .pre-commit-config.yaml
-rw-r--r--  1 root root      36 Jan 25 20:02 .prettierignore
-rw-r--r--  1 root root 1413716 Jan 25 20:02 README-header.png
-rw-r--r--  1 root root   75563 Jan 25 20:02 README.md
drwxr-xr-x  7 root root    4096 Jan 25 20:02 scripts
-rw-r--r--  1 root root   71447 Jan 25 20:02 .secrets.baseline
-rw-r--r--  1 root root     415 Jan 25 20:02 SECURITY.md
-rw-r--r--  1 root root     743 Jan 25 20:02 .shellcheckrc
drwxr-xr-x 54 root root    4096 Jan 25 20:02 skills
drwxr-xr-x 50 root root    4096 Jan 25 20:02 src
drwxr-xr-x  7 root root    4096 Jan 25 20:02 Swabble
-rw-r--r--  1 root root    1090 Jan 25 20:02 .swiftformat
-rw-r--r--  1 root root    2838 Jan 25 20:02 .swiftlint.yml
drwxr-xr-x  5 root root    4096 Jan 25 20:02 test
-rw-r--r--  1 root root     538 Jan 25 20:02 tsconfig.json
drwxr-xr-x  4 root root    4096 Jan 25 20:02 ui
drwxr-xr-x  3 root root    4096 Jan 25 20:02 vendor
-rw-r--r--  1 root root    3427 Jan 25 20:02 vitest.config.ts
-rw-r--r--  1 root root     614 Jan 25 20:02 vitest.e2e.config.ts
-rw-r--r--  1 root root     350 Jan 25 20:02 vitest.extensions.config.ts
-rw-r--r--  1 root root     351 Jan 25 20:02 vitest.gateway.config.ts
-rw-r--r--  1 root root     353 Jan 25 20:02 vitest.live.config.ts
-rw-r--r--  1 root root     513 Jan 25 20:02 vitest.unit.config.ts
-rw-r--r--  1 root root     524 Jan 25 20:02 zizmor.yml
/root/clawdbot/docker-compose.yml
```

```
  ~ ps aux | grep clawdbot-gateway
claus            53604   0,4  1,9 445081136 161024   ??  S    12:23     1:00.21 clawdbot-gateway    
claus            57772   0,0  0,0 435300288   1312 s001  S+    1:37     0:00.00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox --exclude-dir=.venv --exclude-dir=venv clawdbot-gateway
➜  ~ 
```

```
root@clauwdbot-gateway:~/clawdbot# ss -lntp | grep 18789
root@clauwdbot-gateway:~/clawdbot# 
```

```
systemctl list-units --type=service --state=running | egrep -i 'clawdbot|molt' || true
root      158587  0.0  0.1   6680  2304 pts/0    S+   01:39   0:00 grep -E --color=auto -i clawdbot|molt|gateway
root@clauwdbot-gateway:~/clawdbot# sudo ss -lntp | egrep '(:18789|:18791|:443|:80)' || true
root@clauwdbot-gateway:~/clawdbot# crontab -l || true
sudo ls -la /etc/cron.d /etc/cron.hourly /etc/cron.daily | head -n 200
no crontab for root
/etc/cron.d:
total 20
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  201 Apr  8  2024 e2scrub_all
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
-rw-r--r--   1 root root  396 Aug  5 14:14 sysstat

/etc/cron.daily:
total 36
drwxr-xr-x   2 root root 4096 Jan  8 07:21 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rwxr-xr-x   1 root root  376 Jul  8  2025 apport
-rwxr-xr-x   1 root root 1478 Mar 22  2024 apt-compat
-rwxr-xr-x   1 root root  123 Feb  4  2024 dpkg
-rwxr-xr-x   1 root root  377 Aug  5 14:14 logrotate
-rwxr-xr-x   1 root root 1395 Aug  5 14:14 man-db
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
-rwxr-xr-x   1 root root  518 Aug  5 14:14 sysstat

/etc/cron.hourly:
total 12
drwxr-xr-x   2 root root 4096 Aug  5 14:14 .
drwxr-xr-x 103 root root 4096 Jan 29 06:08 ..
-rw-r--r--   1 root root  102 Aug  5 14:14 .placeholder
root@clauwdbot-gateway:~/clawdbot# 
```

```services:
  clawdbot-gateway:
    image: clawdbot:local
    build: .
    restart: unless-stopped
    init: true

    environment:
      HOME: /home/node
      TERM: xterm-256color
      NODE_ENV: production
      TZ: America/Sao_Paulo
      CLAWDBOT_GATEWAY_TOKEN: ${CLAWDBOT_GATEWAY_TOKEN}
      AUTH_TOKEN: ${AUTH_TOKEN}
      CT0: ${CT0}

    volumes:
      - ./clawdbot-config:/home/node/.clawdbot
      - ./clawdbot-workspace:/home/node/clawd
      - /etc/localtime:/etc/localtime:ro
      - /etc/timezone:/etc/timezone:ro

    ports:
      - "100.87.121.57:18789:18789"
      - "100.87.121.57:18791:18791"

    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "lan",
        "--port",
        "18789"
      ]
```