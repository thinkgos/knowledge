# NATS

特性:

- Core NATS
- JetStream

优势:

- 边缘与云原生消息系统, `CNCF`毕业项目, 社区活跃度高, 文档完善.
- `golang`编写, 服务端程序极小, 不到20M.
- 支持客户端的语言非常多, 主流语言基本都支持.
- 支持内存级的`Core NATS`, 有发布-订阅, 请求-回复(类似RPC), 队列组等功能
- 支持持久化的`JetStream`, 在`Core NATS`之上提供消息持久化, 消息确认, 消息重试, 消息保序等机制, 另外还提供`Key-Value`存储, 对象存储功能.
  - 每一个`Stream`独立提供丰富的配置
  - 每一个`Stream`的每一个`Consumer`独立提供丰富配置
- 支持安全的身份验证和授权访问机制, 支持TLS, JWT-based zero trust security
- 支持集群, 可以水平扩展, 提供高可用, 高并发的消息系统
- 协议层面支持 TCP, MQTT, WebSockets

## 1. Core NATS

### 1.1 Publish-Subscribe(发布-订阅)

![ps](https://docs.nats.io/~gitbook/image?url=https%3A%2F%2F1487470910-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LqMYcZML1bsXrN3Ezg0%252Fuploads%252Fgit-blob-22d59af386038cc2717176561ffc95c63c295926%252Fpubsub.svg%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=1a700ae8&sv=2)

### 1.2 Request-Reply(请求-回复)

![rr](https://docs.nats.io/~gitbook/image?url=https%3A%2F%2F1487470910-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LqMYcZML1bsXrN3Ezg0%252Fuploads%252Fgit-blob-dc10798d4afca301adba55c1e85c599b25a2ae24%252Freqrepl.svg%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=4fdca5ce&sv=2)

### 1.3 QueueGroup(队列组)

![qg](https://docs.nats.io/~gitbook/image?url=https%3A%2F%2F1487470910-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-LqMYcZML1bsXrN3Ezg0%252Fuploads%252Fgit-blob-62652b3e6dd556e3cb1c3bb474ec10038334c600%252Fqueue.svg%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=ab76b046&sv=2)

## 2. JetStream

`JetStream`在`Core NATS`基本功能的基础上实现新的功能和更高的服务质量.

### 2.1 Streams

#### 2.1.1 Replay policies(重放策略)

JetStream 消费者支持多种重放策略, 具体取决于消费应用程序是否希望接收策略:

- 存储在`stream`中的所有消息, 可以完整重放, 也可以选择重放策略(即重放速度):
  - `instant`: (以最快的速度向消费者发送消息).
  - `original`: (这意味着消息将以发布到流中的速度传送给消费者, 这对于暂存生产流量非常有用. )
- 存储在`stream`中的最后一条消息, 或每个主题的最后一条消息 (因为流可以捕获多个主题).
- 从特定序列号开始.
- 从特定的开始时间开始.

#### 2.1.2 Retention policies and limits(保留政策和限制)

##### 2.1.2.1 Limits(限制)

你可以对`stream`施加以下限制:

- 最大消息年龄
- `stream`的最大总大小(字节)
- `stream`的消息最大总数量
- 单条消息的最大大小
- 还可以设置在任何给定时间点为`stream`定义的消费者数量限制

您还必须选择一个丢弃策略, 该策略规定了一旦`stream`达到其限制之一并有新消息发布时应该发生的情况:

- `discard old`: 表示`stream`将自动删除`stream`中最旧的消息, 为新消息腾出空间.
- `discard new`: 表示丢弃新消息 (JetStream 发布调用会返回错误消息, 表明已达到限制).

##### 2.1.2.2 Retention policy(保留策略)

您可以为每个`stream`选择所需的保留策略:

- `limits`:  (默认)是提供流中消息的重播.
- `work queue`: 来提供`stream`中消息的只有一次的消费(消息流被用作共享队列, 消息被消费时会从队列中移除).
- `interest`: 是工作队列的一种变体, 它只保留对消息主题有兴趣 (流上当前定义的消费者)的消息. (只要有消费者尚未发送消息, 消息流中就会一直保留消息)

请注意, 无论选择哪种保留策略, `Limits` (和丢弃策略)始终生效.

#### 2.1.3 Persistent and Consistent distributed storage(持久且一致的分布式存储)

您可以根据自己的需要选择消息存储的持久化和弹性.

- `Memory storage`.
- `File storage`.
- `Replication` (1 (none), 2, 3) between nats servers for Fault Tolerance.

### 2.2 Consumers(消费者)

`Core NATS`提供最多一次的交付保证, 而`JetStream`的消费者则不同, 它可以提供至少一次的交付保证.

#### 2.2.1 Dispatch type - Pull/Push(分发类型 - 拉模式/推模式)

- `push`: 基于推送模式的, 即向指定主题发送消息
- `pull`: 基于拉模式的, 即允许客户按需请求批量消息

#### 2.2.2 Ordered Consumers(有序消费者)

有序消费者是推/拉消费者的默认类型, 专为希望有效消费数据流以进行数据检查或分析的应用程序而设计.

- 总是短暂的
- 无确认（如果检测到间隙, 则重新创建消费者）
- 自动流量控制/拉动处理
- 单线程调度
- 无负载平衡

#### 2.2.3 Persistence - Durable/Ephemeral(持久性 - 持久/短暂)

除了可以选择推式或拉式外, 消费者还可以是短暂的或持久的.

### 2.2.4 AckPolicy(应答策略)

策略选择包括:

- `AckExplicit`:  默认策略. 每条报文都必须确认. 建议使用该策略以获得最高的可靠性和功能性.
- `AckNone`: 不需要确认；服务器假定在发送时确认.
- `AckAll`: 只确认系列中收到的最后一条信息；之前的所有信息都会自动确认. 将确认 Pull Consumer 所有订阅者的所有待确认信息.

如果需要确认, 但在`AckWait`窗口内未收到, 则会重新发送报文.

### 2.2.5 DeliverPolicy(分发策略)

策略选择包括:

- `DeliverAll`: 默认策略. 从信息流中最早可用的信息开始接收.
- `DeliverLast`: 从流中添加的最后一条信息开始接收, 或从符合消费者筛选主题（如果已定义）的最后一条信息开始接收.
- `DeliverLastPerSubject`: 从当前信息流中每个过滤主题的最新信息开始接收.
- `DeliverNew`: 开始接收消费者创建后创建的信息.
- `DeliverByStartSequence`: 从具有指定序列号的第一条信息开始. 消费者必须指定定义序列号的`OptStartSeq`.
- `DeliverByStartTime`: 从指定时间或之后的信息开始接收. 消费者必须指定定义开始时间的`OptStartTime`.

### 2.2.6 MaxAckPending

`MaxAckPending`功能提供流量控制, 同时适用于推式和拉式消费者.
对于推送消费者, `MaxAckPending`是唯一的流量控制形式.
对于拉式消费者, 客户端驱动的消息传递会与订阅者建立隐式一对一流量控制.
为获得高吞吐量, 请将 `MaxAckPending`设置为较高值.对于因外部服务导致延迟较高的应用, 可使用较低的值并调整 `AckWait` 以避免重新交付.

### 2.2.7 FilterSubjects

过滤主题可在向客户端发送信息前对信息进行服务器端过滤.

## 3. JetStream例子

### 创建一个`stream`

```shell
nats stream add \
    com_msg \                               <-- stream名称
    --subjects "com.msg.*" \                <-- 订阅的主题
    --storage file \                        <-- 存储类型, file/memory
    --retention "work" \                    <-- 保留策略, limits/interest/work  
    --discard old \                         <-- 丢弃策略, old/new, 当消息达到限制数据后, 如何处理消息
    --max-msgs -1 \                         <-- 最大消息数量, -1 表示无限制
    --max-msgs-per-subject -1 \             <-- 每个主题的最大消息数量, -1 表示无限制, 超过限制按丢弃策略处理
    --max-bytes -1 \                        <-- 所有消息总的最大大小, -1 表示无限制
    --max-msg-size -1 \                     <-- 单条消息的最大大小, -1 表示无限制
    --max-ages 1y \                         <-- 最大消息年龄, 超过限制按丢弃策略处理
    --dupe-window 2m0s \                    <-- 重复消息窗口, 根据Msg-Id的header头信息判断唯一消息的时间
    --no-allow-rollup \                     <-- 是否允许通过header卷起消息, --allow-rollup为允许
    --deny-delete \                         <-- 是否允许通过API删除消息, --no-deny-delete为允许
    --deny-purge \                          <-- 是否允许通过API清除消息, --no-deny-purge为允许
    --replicas                              <-- 消息副本数, 集群使用
```

#### 创建一个`Consumer`

```shell
nats consumer add \
    com_msg \                           <-- stream名称
    com_msg_consumer \                  <-- consumer名称
    --filter-subject "com.msg.*" \      <-- 过滤stream中的主题
    --deliver all \                     <-- 如何处理stream中的消息, 见下表
    --ack explicit \                    <-- 消息确认方式, none/all/explicit
    --replay instant \                  <-- 消息重放机制, instant/original
    --max-deliver -1 \                  <-- 最大交付次数, -1 表示没有正确的ack就不停的投递消息
    --max-pending 0 \                   <-- 最多允许存在多少条未投递成功, 正在重新投递的消息, 如果达到这个数, 将不再投递新消息
    --headers-only \                    <-- 是否只投递header信息
    --target ""                         <-- 推模式目标, 拉模式为空
```
