# SDP

- [rfc4566](https://datatracker.ietf.org/doc/html/rfc4566)
- [rfc8866](https://datatracker.ietf.org/doc/html/rfc8866)

`SDP`协议是会话描述协议(Session Description Protocol)的缩写, 是一种会话描述格式, 一种描述流媒体初始化参数的格式, 为描述多媒体数据而设计.  
`SDP`协议完全是一种会话描述格式. `SDP`协议是文本形式, 采用UTF-8编码的ISO 10646字符集
`SDP`协议不支持会话内容或媒体编码的协商(`SDP`协议只是描述信息而不能协商的去更改信息), 所以在流媒体中只用来描述媒体信息, 媒体协商需要其它协议来完成.

## SDP协议描述符

①会话名和目的
②会话激活的时间区段
③构成会话的媒体信息(主叫和被叫的信息)
④接收这些媒体所需要的信息(地址, 端口, 格式)
⑤会话所用的宽带信息
⑥会话负责人的联系信息
⑦媒体信息(包括：媒体类型(视频, 音频等)、传送协议(RTP/UDP/IP H.320等)、媒体格式(H,264视频, MPEG视频等)、媒体地址和端口).

### SDP格式

一个`SDP`会话描述包括若干行`type=value`形式的文本.

- `type`: 该字节为单字节(如: v, o,  m等)且区分大小写
- `value`: 为结构化文本的文本, 格式由`type`而定, 通常由若干分割符隔开的字段组成或者是一个字符串, 整个协议文本区分大小写.
- `=`: 等号两侧不允许有空格.

```yaml
# <类型>=<值>
＜type＞=<value> [CRLF] # (CRLF表示换行)
```

### SDP整体结构

`SDP`由一个会话级描述(session level description)和多个媒体级描述(media level description)组成.

- 会话级描述的作用域是整个会话, 在`SDP`中, 从 **"v="** 行开始到第一个 **"m="** 行之前都是属于会话级描述的内容.
- 媒体级描述对某个媒体流的内容进行描述, 例如某个音频流或者某个视频流, 从某个 **"m="** 行开始到下个 **"m="** 行之前是属于一个媒体级描述的内容.

[下面带`*`号的是可选的, 其余的是必须的. 一般顺序也按照下面的顺序来排列. a=*是sdp协议扩展属性定义, 除上面以外的, 分解时其它的都可以扔掉. a=charset属性指定协议使用的字符集. 一般的是ISO-10646.]

```yaml
Session description                                 # 会话描述
    v=  (protocol version)                          # 协议版本
    o=  (originator and session identifier)         # 发起者和会话标识符
    s=  (session name)                              # 会话名称
    i=* (session information)                       # 会话信息
    u=* (URI of description)                        # URI描述
    e=* (email address)                             # email地址
    p=* (phone number)                              # 电话号码
    c=* (connection information - not required if included in all media)  # 连接信息 ― 如果包含在所有媒体中, 则不需要该字段
    b=* (zero or more bandwidth information lines)  # 零或多个带宽信息行
    One or more time descriptions ("t=" and "r=" lines, see below) # 零或多个时间描述行
    z=* (time zone adjustments)                     # 时区调整
    k=* (encryption key)                            # 加密密钥 
    a=* (zero or more session attribute lines)      # 零或多个会话属性行
    Zero or more media descriptions                 # 零或多个媒体描述

Time description                                    # 时间描述
    t=  (time the session is active)                # 会话活动时间
    r=* (zero or more repeat times)                 # 零或多个重复时间

Media description, if present                       # 媒体描述, 如果有
    m=  (media name and transport address)          # 媒体名称和传输地址
    i=* (media title)                               # 媒体标题
    c=* (connection information - optional if included at session-level)  # 连接信息 — 如果包含在会话层则该字段可选
    b=* (zero or more bandwidth information lines)  # 带宽信息
    k=* (encryption key)                            # 加密密钥
    a=* (zero or more media attribute lines)        # 零或多个会话属性行
```

#### v: protocol version(必选)

`v`的含义是`SDP`协议的版本号，目前`v`都是`0`。

### o: originator and session identifier(必选)

会话所有者有关的参数

- `username`: 会话发起者的名称。如果不提供则用"-"表示，用户名不能包含空格；
- `session-id`: 主叫方的会话标识符, 在整个会话中同必须唯一.
- `session-version`: 会话版本号，一般为 0；
- `nettype`: 网络类型，目前仅使用`IN`来表示Internet网络类型；
- `addrtype`: 地址类型，可以是`IPV4`和`IPV6`两种地址类型；
- `unicast-address`：会话发起者的IP地址;

### s: session name(必选)

本次会话的标题或会话的名称, 没有的话使用-代替.

### i: session information(可选)

会话信息, 建议包括进来用于描述相应会话文字性说明.

### u: URI of description(可选)

url的描述信息.

### e: email address(可选)

邮件地址.

### p: phone number(可选)

电话号码.

### c: connection information - not required if included in all media(可选)

媒体连接信息

`c=<networktype> <address type> <connection address>`

- `<network type>`: 网络类型，一般为`IN`, 表示”internet”
- `<address type>`: 地址类型，一般为`IP4`。
- `<connection address>`: 应用程序必须处理域名和ip地址两种情形。单播时，为域名或IP地址，推荐使用域名；多播，为IP地址，且IP后面必须有TTL（取值范围是0－255），地址和TTL决定了多播包被传播的范围。

### b: zero or more bandwidth information lines(可选)

### One or more time descriptions

一或多个时间描述, 描述了会话的开始时间和结束时间。这个可以有行，指定多个不规则时间段，如果是规则的时间段，则r=属性可以使用

#### t: time the session is active(必选)

会话的起始时间和结束时间（Time session starts and stops），如果没有规定这两个时间的话，都写为 0 即可。

#### r: zero or more repeat times(可选)

重复次数, `r=<repeat-interval> <active duration> <offsets from start-time>`

### z: time zone adjustments

### k: encryption key

### a: zero or more session attribute lines

### Zero or more media descriptions

媒体描述, 如果有

#### m: media name and transport address(必选)

媒体名称和传输地址, `m=<media> <port>[/<number of ports>] <transport> <fmt list>`

#### i: media title(可选)

媒体标题

#### c: connection information - optional if included at session-level(可选)

连接信息

#### b: zero or more bandwidth information lines(可选)

带宽信息, `b=<bwtype>:<bandwidth-value>`

#### k: encryption key(可选)

加密密钥

#### a: zero or more media attribute lines(可选)

零或多个会话属性行

 <!-- k=已定义的方法有:  k=clear:<加密密钥>密钥没有变换;k=base64:<编码密钥>已编码, 因为它含有SDP禁用的字符;k=uri:<获得密钥的URI>;k=prompt.SDP没有提供密钥但该会话或媒体流是要求加密的. -->